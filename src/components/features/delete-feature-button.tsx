"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useTransition } from "react";

import { deleteFeature } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogActionButton,
  AlertDialogCancelButton,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type DeleteFeatureButtonProps = {
  id: string;
  ticketName: string;
};

export function DeleteFeatureButton({
  id,
  ticketName,
}: DeleteFeatureButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="w-full px-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600"
          size="sm"
          variant="ghost"
        >
          <Trash2 className="h-4 w-4" />
          Xoá
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xoá feature này?</AlertDialogTitle>
          <AlertDialogDescription>
            Feature <span className="font-medium">{ticketName}</span> sẽ bị xoá
            khỏi danh sách quản lý. Thao tác này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancelButton disabled={isPending}>
            Huỷ
          </AlertDialogCancelButton>
          <AlertDialogActionButton
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              startTransition(async () => {
                await deleteFeature(id);
              });
            }}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Xoá
          </AlertDialogActionButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
