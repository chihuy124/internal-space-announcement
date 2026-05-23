import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { UserGuidePreview } from "@/components/features/user-guide-preview";
import { Card, CardContent } from "@/components/ui/card";
import { formatVietnamDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type FeatureDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function FeatureDetailPage({
  params,
}: FeatureDetailPageProps) {
  const { id } = await params;
  const feature = await prisma.feature.findUnique({
    where: { id },
  });

  if (!feature) {
    notFound();
  }

  const isTicketLink = feature.ticket?.startsWith("http");

  return (
    <main className="min-h-dvh bg-[#fbfaf8] text-[#191919]">
      <section className="border-b border-[#e5e2dc] bg-[#101628] text-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <Link
            className="inline-flex w-fit items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại dashboard
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <h1 className="break-words text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                {feature.ticketName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/72">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <UserRound className="h-4 w-4 shrink-0" />
                  <span className="truncate">{feature.assignee}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  {formatVietnamDate(feature.releaseDate)}
                </span>
              </div>
            </div>

            {isTicketLink && feature.ticket ? (
              <Link
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-[#101628] transition-colors hover:bg-[#f4f1ff] hover:text-[#4c1d95]"
                href={feature.ticket}
                rel="noreferrer"
                target="_blank"
              >
                Jira
                <ExternalLink className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-[#e5e2dc] bg-white shadow-[0_12px_32px_rgba(15,15,15,0.08)]">
          <CardContent className="p-5 sm:p-8">
            <div className="mb-5 flex flex-col gap-2 border-b border-[#efede8] pb-5">
              <p className="text-sm font-medium text-[#6b6a67]">User guide</p>
              {!isTicketLink && feature.ticket ? (
                <p className="break-words text-sm text-[#37352f]">
                  Ticket: {feature.ticket}
                </p>
              ) : null}
            </div>
            <UserGuidePreview value={feature.userGuide} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
