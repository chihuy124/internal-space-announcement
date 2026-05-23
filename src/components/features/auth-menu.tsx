"use client";

import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { login, logout, type ActionState } from "@/app/actions";
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

type AuthMenuProps = {
  currentUserName?: string;
};

export function AuthMenu({ currentUserName }: AuthMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function applyResult(result: ActionState) {
    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setMessage("");
    setPassword("");
    setUsername("");
    setOpen(false);
    router.refresh();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      applyResult(await login({ password, username }));
    });
  }

  function signOut() {
    startTransition(async () => {
      applyResult(await logout());
    });
  }

  if (currentUserName) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex h-10 min-w-0 items-center gap-2 rounded-md border border-white/12 bg-white/[0.08] px-3 text-sm font-medium text-white/90">
          <ShieldCheck className="h-4 w-4" />
          <span className="max-w-36 truncate">{currentUserName}</span>
        </span>
        <Button
          className="border-white/20 bg-white text-[#101628] hover:bg-[#f4f1ff] hover:text-[#4c1d95]"
          disabled={isPending}
          onClick={signOut}
          size="sm"
          type="button"
          variant="outline"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LogIn className="h-4 w-4" />
          Đăng nhập
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đăng nhập admin</DialogTitle>
          <DialogDescription>
            Viewer có thể xem nội dung. Admin cần đăng nhập để thêm, sửa hoặc
            xoá dữ liệu.
          </DialogDescription>
        </DialogHeader>

        <form autoComplete="off" className="grid gap-3" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="loginUsername">Username</Label>
            <Input
              autoComplete="username"
              id="loginUsername"
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="VD: huy.tran"
              value={username}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="loginPassword">Password</Label>
            <Input
              id="loginPassword"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nhập password"
              type="password"
              value={password}
            />
          </div>
          {message ? (
            <p className="text-sm leading-6 text-rose-600">{message}</p>
          ) : null}
          <Button disabled={isPending} type="submit">
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
