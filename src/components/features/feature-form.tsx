"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import {
  createFeature,
  type ActionState,
  updateFeature,
} from "@/app/actions";
import type { MemberItem } from "@/components/features/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  featureSchema,
  type FeatureFormValues,
  todayDateInputValue,
} from "@/lib/feature-schema";

type FeatureFormProps = {
  mode: "create" | "edit";
  feature?: FeatureFormValues & { id: string };
  members: MemberItem[];
  onSuccess?: () => void;
};

export function FeatureForm({
  mode,
  feature,
  members,
  onSuccess,
}: FeatureFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverMessage, setServerMessage] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FeatureFormValues>({
    resolver: zodResolver(featureSchema),
    defaultValues: feature ?? {
      ticket: "",
      ticketName: "",
      assignee: "",
      releaseDate: todayDateInputValue(),
      userGuide: "",
    },
  });

  function applyServerErrors(result: ActionState) {
    if (!result.fieldErrors) {
      return;
    }

    Object.entries(result.fieldErrors).forEach(([field, messages]) => {
      const message = messages?.[0];

      if (message) {
        setError(field as keyof FeatureFormValues, { message });
      }
    });
  }

  function onSubmit(values: FeatureFormValues) {
    setServerMessage("");

    startTransition(async () => {
      const result =
        mode === "edit" && feature
          ? await updateFeature(feature.id, values)
          : await createFeature(values);

      if (!result.ok) {
        setServerMessage(result.message);
        applyServerErrors(result);
        return;
      }

      router.refresh();
      onSuccess?.();
    });
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <RequiredLabel htmlFor="ticketName">Tên ticket</RequiredLabel>
        <Input
          id="ticketName"
          placeholder="VD: [OROCA-123] Ra mắt màn hình quản lý đơn hàng"
          {...register("ticketName")}
        />
        <FieldMessage message={errors.ticketName?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <RequiredLabel htmlFor="ticket">Link Jira</RequiredLabel>
          <Input
            id="ticket"
            placeholder="https://oroca.atlassian.net/..."
            type="url"
            {...register("ticket")}
          />
          <FieldMessage message={errors.ticket?.message} />
        </div>

        <div className="grid gap-2">
          <RequiredLabel htmlFor="assignee">Người thực hiện</RequiredLabel>
          <select
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            id="assignee"
            {...register("assignee")}
          >
            <option value="">Chọn thành viên</option>
            {members.map((member) => (
              <option key={member.id} value={member.name}>
                {member.name}
              </option>
            ))}
          </select>
          <FieldMessage message={errors.assignee?.message} />
          {members.length === 0 ? (
            <p className="text-sm text-amber-700">
              Chưa có thành viên. Thêm thành viên trước khi tạo feature.
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <RequiredLabel className="flex items-center gap-2" htmlFor="releaseDate">
          <CalendarDays className="h-4 w-4" />
          Ngày release
        </RequiredLabel>
        <Input id="releaseDate" type="date" {...register("releaseDate")} />
        <FieldMessage message={errors.releaseDate?.message} />
      </div>

      <div className="grid gap-2">
        <RequiredLabel htmlFor="userGuide">User guide</RequiredLabel>
        <Textarea
          id="userGuide"
          className="min-h-48"
          placeholder="Hỗ trợ Markdown: **in đậm**, danh sách, tiêu đề..."
          {...register("userGuide")}
        />
        <FieldMessage message={errors.userGuide?.message} />
      </div>

      <div className="flex justify-end gap-2">
        {serverMessage ? (
          <p className="mr-auto max-w-md text-sm leading-6 text-rose-600">
            {serverMessage}
          </p>
        ) : null}
        <Button disabled={isPending} type="submit">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {mode === "edit" ? "Lưu thay đổi" : "Thêm feature"}
        </Button>
      </div>
    </form>
  );
}

function RequiredLabel({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label className={className} {...props}>
      {children} <span className="text-rose-600">*</span>
    </Label>
  );
}

function FieldMessage({ message }: { message?: string }) {
  return (
    <p className="min-h-5 text-sm leading-5 text-rose-600">
      {message ? message : <span aria-hidden="true">&nbsp;</span>}
    </p>
  );
}
