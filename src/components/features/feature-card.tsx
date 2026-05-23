import { CalendarDays, LinkIcon, UserRound } from "lucide-react";

import { DeleteFeatureButton } from "@/components/features/delete-feature-button";
import { FeatureDialog } from "@/components/features/feature-dialog";
import type { FeatureItem, MemberItem } from "@/components/features/types";
import { UserGuideDialog } from "@/components/features/user-guide-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatVietnamDate } from "@/lib/date";

type FeatureCardProps = {
  feature: FeatureItem;
  members: MemberItem[];
};

export function FeatureCard({ feature, members }: FeatureCardProps) {
  const isTicketLink = feature.ticket?.startsWith("http");

  return (
    <Card className="group flex min-h-48 flex-col overflow-hidden border-white/80 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)]">
      <CardHeader className="flex-1 justify-between gap-5 border-b border-slate-100/80 p-5">
        <div className="min-w-0 space-y-3">
          {isTicketLink && feature.ticket ? (
            <a
              className="line-clamp-2 break-words text-base font-semibold leading-6 text-slate-950 underline-offset-4 transition-colors hover:text-sky-700 hover:underline"
              href={feature.ticket}
              rel="noreferrer"
              target="_blank"
              title={feature.ticket}
            >
              {feature.ticketName}
            </a>
          ) : (
            <CardTitle className="line-clamp-2 break-words text-base leading-6">
              {feature.ticketName}
            </CardTitle>
          )}
          {feature.ticket ? (
            !isTicketLink ? (
              <span className="inline-flex max-w-full items-center gap-1 truncate rounded-md bg-slate-100 px-2 py-1 text-sm font-medium text-slate-700">
                <LinkIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{feature.ticket}</span>
              </span>
            ) : null
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
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
      <CardContent className="bg-slate-50/70 p-4">
        <div className="grid grid-cols-[1fr_1fr_1.35fr] gap-2">
          <UserGuideDialog
            ticketName={feature.ticketName}
            userGuide={feature.userGuide}
          />
          <FeatureDialog feature={feature} members={members} mode="edit" />
          <DeleteFeatureButton id={feature.id} ticketName={feature.ticketName} />
        </div>
      </CardContent>
    </Card>
  );
}
