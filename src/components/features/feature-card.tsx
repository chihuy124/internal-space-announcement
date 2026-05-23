"use client";

import { CalendarDays, ExternalLink, LinkIcon, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";

import { DeleteFeatureButton } from "@/components/features/delete-feature-button";
import { FeatureDialog } from "@/components/features/feature-dialog";
import type { FeatureItem, MemberItem } from "@/components/features/types";
import { UserGuideDialog } from "@/components/features/user-guide-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatVietnamDate } from "@/lib/date";

type FeatureCardProps = {
  canManage: boolean;
  feature: FeatureItem;
  members: MemberItem[];
};

export function FeatureCard({ canManage, feature, members }: FeatureCardProps) {
  const router = useRouter();
  const isTicketLink = feature.ticket?.startsWith("http");
  const detailHref = `/features/${feature.id}`;

  function openDetail() {
    router.push(detailHref);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetail();
    }
  }

  return (
    <Card
      className="group flex min-h-48 cursor-pointer flex-col overflow-hidden border-[#e5e2dc] bg-white shadow-[0_4px_12px_rgba(15,15,15,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(15,15,15,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]"
      onClick={openDetail}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
    >
      <CardHeader className="flex-1 justify-between gap-5 border-b border-[#efede8] p-5">
        <div className="min-w-0 space-y-3">
          <div className="flex items-start gap-3">
            <CardTitle className="line-clamp-2 flex-1 break-words text-base leading-6 transition-colors group-hover:text-[#7c3aed]">
              {feature.ticketName}
            </CardTitle>
            {isTicketLink && feature.ticket ? (
              <Link
                aria-label={`Mở Jira cho ${feature.ticketName}`}
                className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-[#d9d9d6] bg-white px-2 text-xs font-medium text-[#37352f] shadow-sm transition-colors hover:border-[#7c3aed] hover:bg-[#f4f1ff] hover:text-[#4c1d95]"
                href={feature.ticket}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                rel="noreferrer"
                target="_blank"
                title={feature.ticket}
              >
                Jira
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </div>
          {feature.ticket ? (
            !isTicketLink ? (
              <span className="inline-flex max-w-full items-center gap-1 truncate rounded-md bg-[#f4f1ff] px-2 py-1 text-sm font-medium text-[#4c1d95]">
                <LinkIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{feature.ticket}</span>
              </span>
            ) : null
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#6b6a67]">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <UserRound className="h-4 w-4 shrink-0" />
            <span className="truncate">{feature.assignee}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 shrink-0" />
            {formatVietnamDate(feature.releaseDate)}
          </span>
        </div>
      </CardHeader>
      <CardContent
        className="cursor-default bg-[#f7f6f3] p-4"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <div
          className={
            canManage
              ? "grid grid-cols-[1fr_1fr_1.35fr] gap-2"
              : "grid grid-cols-1 gap-2"
          }
        >
          <UserGuideDialog
            ticketName={feature.ticketName}
            userGuide={feature.userGuide}
          />
          {canManage ? (
            <>
              <FeatureDialog feature={feature} members={members} mode="edit" />
              <DeleteFeatureButton
                id={feature.id}
                ticketName={feature.ticketName}
              />
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
