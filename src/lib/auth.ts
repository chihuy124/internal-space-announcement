import { createHmac, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const scryptAsync = promisify(scrypt);
const SESSION_COOKIE = "isa_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type SessionPayload = {
  exp: number;
  memberId: string;
  name: string;
  role: "admin";
};

export type CurrentUser = {
  id: string;
  name: string;
  role: "admin";
};

function getAuthSecret() {
  return (
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.DATABASE_URL ??
    "internal-space-announcement-dev-secret"
  );
}

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function createSessionToken(payload: SessionPayload) {
  const body = encodeBase64Url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

function readSessionToken(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expectedSignature = sign(body);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (payload.role !== "admin" || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

  return `scrypt:${salt}:${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "base64url");
  const actual = (await scryptAsync(password, salt, expected.length)) as Buffer;

  return timingSafeEqual(actual, expected);
}

export async function setSession(user: CurrentUser) {
  const cookieStore = await cookies();
  const token = createSessionToken({
    exp: Date.now() + SESSION_MAX_AGE * 1000,
    memberId: user.id,
    name: user.name,
    role: "admin",
  });

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = readSessionToken(token);

  if (!payload) {
    return null;
  }

  const member = await prisma.member.findUnique({
    where: { id: payload.memberId },
    select: { id: true, name: true, passwordHash: true },
  });

  if (!member?.passwordHash) {
    return null;
  }

  return { id: member.id, name: member.name, role: "admin" };
}

export async function hasAdminAccount() {
  const count = await prisma.member.count({
    where: { passwordHash: { not: null } },
  });

  return count > 0;
}

export async function requireAdmin() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("UNAUTHORIZED");
  }

  return currentUser;
}
