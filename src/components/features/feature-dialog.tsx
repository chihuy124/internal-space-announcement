"use client";

import { Pencil, Plus } from "lucide-react";
import { useState } from "react";

import { FeatureForm } from "@/components/features/feature-form";
import type { FeatureItem, MemberItem } from "@/components/features/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDateInput } from "@/lib/date";

type FeatureDialogProps =
  | {
      mode: "create";
      members: MemberItem[];
      feature?: never;
    }
  | {
      mode: "edit";
      feature: FeatureItem;
      members: MemberItem[];
    };

export function FeatureDialog({ mode, feature, members }: FeatureDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button className="w-full px-2" size="sm" variant="outline">
            <Pencil className="h-4 w-4" />
            Sửa
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" />
            Thêm feature
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Sửa feature" : "Thêm feature mới"}
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin ticket, ngày release và hướng dẫn sử dụng.
          </DialogDescription>
        </DialogHeader>
        <FeatureForm
          mode={mode}
          members={members}
          feature={
            isEdit
              ? {
                  id: feature.id,
                  ticket: feature.ticket ?? "",
                  ticketName: feature.ticketName,
                  assignee: feature.assignee,
                  releaseDate: formatDateInput(feature.releaseDate),
                  userGuide: feature.userGuide,
                }
              : undefined
          }
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
