"use client";

import { Loader2, Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import {
  createMember,
  deleteMember,
  type ActionState,
  updateMember,
} from "@/app/actions";
import type { MemberItem } from "@/components/features/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MemberManagerProps = {
  canDelete?: boolean;
  currentUserId?: string;
  members: MemberItem[];
  setupMode?: boolean;
};

type EditingMember = MemberItem | null;

export function MemberManager({
  canDelete = true,
  currentUserId,
  members,
  setupMode = false,
}: MemberManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [editingMember, setEditingMember] = useState<EditingMember>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setName("");
    setPassword("");
    setUsername("");
    setEditingMember(null);
    setMessage("");
  }

  function applyResult(result: ActionState) {
    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    resetForm();
    router.refresh();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const payload = { name, password, username };
      const result = editingMember
        ? await updateMember(editingMember.id, payload)
        : await createMember(payload);

      applyResult(result);
    });
  }

  function startEdit(member: MemberItem) {
    setEditingMember(member);
    setName(member.name);
    setPassword("");
    setUsername(member.username);
    setMessage("");
  }

  function remove(member: MemberItem) {
    setMessage("");

    startTransition(async () => {
      const result = await deleteMember(member.id);
      applyResult(result);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (!value) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <UsersRound className="h-4 w-4" />
          Thành viên
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {setupMode ? "Thiết lập admin đầu tiên" : "Quản lý thành viên"}
          </DialogTitle>
          <DialogDescription>
            {setupMode
              ? "Chưa có admin nào. Tạo thành viên kèm password để bắt đầu quản trị."
              : "Danh sách này được lưu trong database và dùng cho dropdown Người thực hiện."}
          </DialogDescription>
        </DialogHeader>

        <form
          autoComplete="off"
          className="grid gap-3 rounded-lg border border-slate-200 p-4"
          onSubmit={submit}
        >
          <div className="grid gap-2">
            <Label htmlFor="adminDisplayName">Tên thành viên</Label>
            <Input
              autoComplete="off"
              id="adminDisplayName"
              name="admin-display-name"
              onChange={(event) => setName(event.target.value)}
              placeholder="VD: Leo Nguyen"
              value={name}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adminUsername">Username đăng nhập</Label>
            <Input
              autoComplete="off"
              id="adminUsername"
              name="admin-username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="VD: huy.tran"
              value={username}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adminAccessKey">
              Password {editingMember ? "(để trống nếu không đổi)" : ""}
            </Label>
            <Input
              autoComplete="new-password"
              id="adminAccessKey"
              name="admin-access-key"
              onChange={(event) => setPassword(event.target.value)}
              placeholder={
                editingMember ? "Nhập password mới nếu cần đổi" : "Tối thiểu 6 ký tự"
              }
              type="password"
              value={password}
            />
          </div>
          {message ? (
            <p className="text-sm leading-6 text-rose-600">{message}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            {editingMember ? (
              <Button onClick={resetForm} type="button" variant="outline">
                Huỷ sửa
              </Button>
            ) : null}
            <Button disabled={isPending} type="submit">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingMember ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {editingMember ? "Lưu thành viên" : "Thêm thành viên"}
            </Button>
          </div>
        </form>

        <div className="grid max-h-80 gap-2 overflow-y-auto">
          {members.length > 0 ? (
            members.map((member) => {
              const canEditMember = setupMode || member.id === currentUserId;

              return (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2"
                  key={member.id}
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                    <span>{member.name}</span>
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      @{member.username}
                    </span>
                    {member.hasPassword ? (
                      <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        admin
                      </span>
                    ) : null}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    {canEditMember ? (
                      <Button
                        aria-label={`Sửa ${member.name}`}
                        onClick={() => startEdit(member)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Button
                        aria-label={`Xoá ${member.name}`}
                        disabled={isPending}
                        onClick={() => remove(member)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-md border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
              Chưa có thành viên nào.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
