"use server";

import { revalidatePath } from "next/cache";

import {
  featureSchema,
  loginSchema,
  memberSchema,
  parseReleaseDate,
  updateMemberSchema,
} from "@/lib/feature-schema";
import {
  clearSession,
  getCurrentUser,
  hasAdminAccount,
  hashPassword,
  setSession,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function normalizeData(formData: unknown) {
  const parsed = featureSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      ok: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  return {
    ok: true as const,
    data: {
      ticket: parsed.data.ticket,
      ticketName: parsed.data.ticketName,
      assignee: parsed.data.assignee,
      releaseDate: parseReleaseDate(parsed.data.releaseDate),
      userGuide: parsed.data.userGuide,
    },
  };
}

function getDatabaseErrorMessage(error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.warn("Database action failed:", error);
  }

  return "Không thể lưu dữ liệu. Hãy kiểm tra DATABASE_URL, PostgreSQL đã chạy, và đã chạy npm run db:migrate.";
}

async function assertMemberExists(assignee: string) {
  const member = await prisma.member.findUnique({
    where: { name: assignee },
    select: { id: true },
  });

  return Boolean(member);
}

async function canManageMembersForSetup() {
  const [currentUser, adminExists] = await Promise.all([
    getCurrentUser(),
    hasAdminAccount(),
  ]);

  return Boolean(currentUser) || !adminExists;
}

async function assertAdminAction() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      ok: false as const,
      message: "Bạn cần đăng nhập admin để thực hiện thao tác này.",
    };
  }

  return { ok: true as const };
}

export async function createFeature(formData: unknown): Promise<ActionState> {
  const authorized = await assertAdminAction();

  if (!authorized.ok) {
    return authorized;
  }

  const normalized = normalizeData(formData);

  if (!normalized.ok) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin.",
      fieldErrors: normalized.errors,
    };
  }

  try {
    const memberExists = await assertMemberExists(normalized.data.assignee);

    if (!memberExists) {
      return {
        ok: false,
        message: "Người thực hiện không có trong danh sách thành viên.",
        fieldErrors: {
          assignee: ["Vui lòng chọn một thành viên hợp lệ."],
        },
      };
    }

    await prisma.feature.create({ data: normalized.data });
    revalidatePath("/");
  } catch (error) {
    return {
      ok: false,
      message: getDatabaseErrorMessage(error),
    };
  }

  return { ok: true, message: "Đã thêm feature." };
}

export async function updateFeature(
  id: string,
  formData: unknown,
): Promise<ActionState> {
  const authorized = await assertAdminAction();

  if (!authorized.ok) {
    return authorized;
  }

  const normalized = normalizeData(formData);

  if (!normalized.ok) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin.",
      fieldErrors: normalized.errors,
    };
  }

  try {
    const memberExists = await assertMemberExists(normalized.data.assignee);

    if (!memberExists) {
      return {
        ok: false,
        message: "Người thực hiện không có trong danh sách thành viên.",
        fieldErrors: {
          assignee: ["Vui lòng chọn một thành viên hợp lệ."],
        },
      };
    }

    await prisma.feature.update({
      where: { id },
      data: normalized.data,
    });
    revalidatePath("/");
    revalidatePath(`/features/${id}`);
  } catch (error) {
    return {
      ok: false,
      message: getDatabaseErrorMessage(error),
    };
  }

  return { ok: true, message: "Đã cập nhật feature." };
}

export async function deleteFeature(id: string): Promise<ActionState> {
  const authorized = await assertAdminAction();

  if (!authorized.ok) {
    return authorized;
  }

  try {
    await prisma.feature.delete({ where: { id } });
    revalidatePath("/");
  } catch (error) {
    return {
      ok: false,
      message: getDatabaseErrorMessage(error),
    };
  }

  return { ok: true, message: "Đã xoá feature." };
}

export async function createMember(formData: unknown): Promise<ActionState> {
  if (!(await canManageMembersForSetup())) {
    return {
      ok: false,
      message: "Bạn cần đăng nhập admin để quản lý thành viên.",
    };
  }

  const parsed = memberSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.member.create({
      data: {
        name: parsed.data.name,
        passwordHash: await hashPassword(parsed.data.password),
        username: parsed.data.username,
      },
    });
    revalidatePath("/");
  } catch {
    return {
      ok: false,
      message:
        "Không thể thêm thành viên. Tên có thể đã tồn tại hoặc database chưa sẵn sàng.",
    };
  }

  return { ok: true, message: "Đã thêm thành viên." };
}

export async function updateMember(
  id: string,
  formData: unknown,
): Promise<ActionState> {
  const currentUser = await getCurrentUser();
  const adminExists = await hasAdminAccount();

  if (!currentUser && adminExists) {
    return {
      ok: false,
      message: "Bạn cần đăng nhập admin để quản lý thành viên.",
    };
  }

  if (currentUser && currentUser.id !== id) {
    return {
      ok: false,
      message: "Bạn chỉ có quyền sửa tài khoản của chính mình.",
    };
  }

  const parsed = updateMemberSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const currentMember = await prisma.member.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!currentMember) {
      return {
        ok: false,
        message: "Không tìm thấy thành viên cần sửa.",
      };
    }

    const memberData = {
      name: parsed.data.name,
      username: parsed.data.username,
      ...(parsed.data.password
        ? { passwordHash: await hashPassword(parsed.data.password) }
        : {}),
    };

    await prisma.$transaction([
      prisma.member.update({
        where: { id },
        data: memberData,
      }),
      prisma.feature.updateMany({
        where: { assignee: currentMember.name },
        data: { assignee: parsed.data.name },
      }),
    ]);
    revalidatePath("/");
  } catch {
    return {
      ok: false,
      message:
        "Không thể cập nhật thành viên. Tên có thể đã tồn tại hoặc database chưa sẵn sàng.",
    };
  }

  return { ok: true, message: "Đã cập nhật thành viên." };
}

export async function deleteMember(id: string): Promise<ActionState> {
  const authorized = await assertAdminAction();

  if (!authorized.ok) {
    return authorized;
  }

  try {
    await prisma.member.delete({ where: { id } });
    revalidatePath("/");
  } catch (error) {
    return {
      ok: false,
      message: getDatabaseErrorMessage(error),
    };
  }

  return { ok: true, message: "Đã xoá thành viên." };
}

export async function login(formData: unknown): Promise<ActionState> {
  const parsed = loginSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin đăng nhập.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const member = await prisma.member.findUnique({
    where: { username: parsed.data.username },
    select: { id: true, name: true, passwordHash: true },
  });

  if (
    !member?.passwordHash ||
    !(await verifyPassword(parsed.data.password, member.passwordHash))
  ) {
    return {
      ok: false,
      message: "Tên hoặc password không đúng.",
    };
  }

  await setSession({ id: member.id, name: member.name, role: "admin" });
  revalidatePath("/");

  return { ok: true, message: "Đã đăng nhập." };
}

export async function logout(): Promise<ActionState> {
  await clearSession();
  revalidatePath("/");

  return { ok: true, message: "Đã đăng xuất." };
}
