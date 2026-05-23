import { ClipboardList, Database, Rocket } from "lucide-react";

import { AuthMenu } from "@/components/features/auth-menu";
import { FeatureCard } from "@/components/features/feature-card";
import { FeatureDialog } from "@/components/features/feature-dialog";
import { MemberManager } from "@/components/features/member-manager";
import { Pagination } from "@/components/features/pagination";
import { SearchBar } from "@/components/features/search-bar";
import type { FeatureItem, MemberItem } from "@/components/features/types";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

type SearchParams = Promise<{
  releaseFrom?: string;
  releaseTo?: string;
  search?: string;
  page?: string;
}>;

function isDateParam(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getFeatureWhere(search: string, releaseFrom: string, releaseTo: string) {
  const clauses = [];

  if (search) {
    const query = { contains: search, mode: "insensitive" as const };

    clauses.push({
      OR: [{ ticket: query }, { ticketName: query }, { assignee: query }],
    });
  }

  if (isDateParam(releaseFrom) || isDateParam(releaseTo)) {
    const releaseDate = {
      ...(isDateParam(releaseFrom)
        ? { gte: new Date(`${releaseFrom}T00:00:00.000Z`) }
        : {}),
      ...(isDateParam(releaseTo)
        ? { lte: new Date(`${releaseTo}T00:00:00.000Z`) }
        : {}),
    };

    clauses.push({ releaseDate });
  }

  if (clauses.length === 0) {
    return undefined;
  }

  return clauses.length === 1 ? clauses[0] : { AND: clauses };
}

async function getFeatures(
  search: string,
  page: number,
  releaseFrom: string,
  releaseTo: string,
) {
  try {
    const where = getFeatureWhere(search, releaseFrom, releaseTo);

    const [features, total, members] = await Promise.all([
      prisma.feature.findMany({
        where,
        orderBy: [{ releaseDate: "desc" }, { updatedAt: "desc" }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.feature.count({ where }),
      prisma.member.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, name: true, passwordHash: true },
      }),
    ]);

    return {
      dbReady: true,
      features: features.map<FeatureItem>((feature) => ({
        id: feature.id,
        ticket: feature.ticket,
        ticketName: feature.ticketName,
        assignee: feature.assignee,
        releaseDate: feature.releaseDate.toISOString(),
        userGuide: feature.userGuide,
        createdAt: feature.createdAt.toISOString(),
        updatedAt: feature.updatedAt.toISOString(),
      })),
      members: members.map<MemberItem>((member) => ({
        hasPassword: Boolean(member.passwordHash),
        id: member.id,
        name: member.name,
      })),
      total,
      adminExists: members.some((member) => Boolean(member.passwordHash)),
    };
  } catch {
    return {
      adminExists: false,
      dbReady: false,
      features: [],
      members: [],
      total: 0,
    };
  }
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const releaseFrom = params.releaseFrom ?? "";
  const releaseTo = params.releaseTo ?? "";
  const rawPage = Number(params.page ?? "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const { dbReady, features, members, total } = await getFeatures(
    search,
    page,
    releaseFrom,
    releaseTo,
  );
  const currentUser = dbReady ? await getCurrentUser() : null;
  const canManage = Boolean(currentUser);
  const adminExists = members.some((member) => member.hasPassword);
  const canSetupFirstAdmin = dbReady && !adminExists;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="min-h-dvh bg-[#fbfaf8] text-[#191919]">
      <section className="bg-[#101628] text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-white">
                <Rocket className="h-4 w-4" />
                Oroca internal release space
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-normal text-white sm:text-5xl">
                  Internal Space Announcement
                </h1>
                <p className="max-w-2xl text-base leading-7 text-white/72">
                  Quản lý các feature đã deploy của website chính, kèm ticket,
                  người thực hiện, ngày release và user guide cho đội nội bộ.
                </p>
              </div>
            </div>
            <div className="w-full rounded-xl border border-white/10 bg-white/[0.06] p-3 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.8)] backdrop-blur lg:w-auto lg:min-w-[25rem]">
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-white/45">
                    Quyền truy cập
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {canManage ? "Admin" : "Viewer"}
                  </p>
                </div>
                <AuthMenu currentUserName={currentUser?.name} />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                {canManage || canSetupFirstAdmin ? (
                <MemberManager
                  canDelete={canManage}
                  currentUserId={currentUser?.id}
                  members={members}
                  setupMode={canSetupFirstAdmin}
                />
                ) : null}
                {canManage ? (
                  <FeatureDialog members={members} mode="create" />
                ) : null}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-[#efe3aa] bg-[#fff4ba] text-[#37352f] shadow-[0_24px_48px_-20px_rgba(15,15,15,0.38)]">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/70 text-[#8a5a00]">
                  <ClipboardList className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-[#6b5f32]">Tổng feature</p>
                  <p className="text-xl font-semibold">{total}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#cdebdc] bg-[#e5f8ed] text-[#173f2a] shadow-[0_24px_48px_-20px_rgba(15,15,15,0.32)]">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/70 text-[#0f7b4c]">
                  <Database className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-[#4d705d]">Database</p>
                  <p className="text-xl font-semibold">
                    {dbReady ? "PostgreSQL" : "Chưa kết nối"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#ded8fb] bg-[#f0ecff] text-[#2f1c68] shadow-[0_24px_48px_-20px_rgba(15,15,15,0.32)]">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/70 text-[#6d28d9]">
                  <Rocket className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-[#6d5ca4]">Mỗi trang</p>
                  <p className="text-xl font-semibold">{PAGE_SIZE} thẻ</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto flex min-h-[calc(100dvh-22rem)] w-full max-w-7xl flex-col gap-6 px-4 py-7 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-[#e5e2dc] bg-white p-3 shadow-[0_4px_12px_rgba(15,15,15,0.06)]">
          <SearchBar
            defaultReleaseFrom={releaseFrom}
            defaultReleaseTo={releaseTo}
            defaultValue={search}
          />
        </div>

        {!dbReady ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-5 text-sm leading-6 text-amber-900">
              Chưa kết nối được PostgreSQL. Cập nhật `DATABASE_URL`, chạy
              `npx prisma migrate dev`, rồi tải lại trang để bắt đầu quản lý
              feature.
            </CardContent>
          </Card>
        ) : null}

        {features.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard
                canManage={canManage}
                feature={feature}
                key={feature.id}
                members={members}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
              <ClipboardList className="h-10 w-10 text-slate-300" />
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">
                  {search ? "Không tìm thấy feature" : "Chưa có feature nào"}
                </h2>
                <p className="max-w-md text-sm leading-6 text-slate-500">
                  {search
                    ? "Thử đổi từ khoá tìm kiếm hoặc quay lại trang đầu."
                    : "Thêm feature đầu tiên để ghi nhận ticket đã release và user guide cho đội nội bộ."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-auto pt-6">
          <Pagination
            page={Math.min(page, totalPages)}
            releaseFrom={releaseFrom}
            releaseTo={releaseTo}
            search={search}
            totalPages={totalPages}
          />
        </div>
      </section>
    </main>
  );
}
