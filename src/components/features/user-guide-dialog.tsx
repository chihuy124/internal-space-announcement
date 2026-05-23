"use client";

import { BookOpen } from "lucide-react";

import { UserGuidePreview } from "@/components/features/user-guide-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type UserGuideDialogProps = {
  ticketName: string;
  userGuide: string;
};

export function UserGuideDialog({
  ticketName,
  userGuide,
}: UserGuideDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="w-full border border-sky-700 bg-sky-700 px-2 text-white hover:bg-sky-800"
          size="sm"
        >
          <BookOpen className="h-4 w-4" />
          User guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{ticketName}</DialogTitle>
          <DialogDescription>User guide chi tiết</DialogDescription>
        </DialogHeader>
        <div className="max-h-[70dvh] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-5">
          <UserGuidePreview value={userGuide} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
