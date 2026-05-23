"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/features/date-range-picker";
import { Input } from "@/components/ui/input";

type SearchBarProps = {
  defaultReleaseFrom: string;
  defaultReleaseTo: string;
  defaultValue: string;
};

export function SearchBar({
  defaultReleaseFrom,
  defaultReleaseTo,
  defaultValue,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const [releaseFrom, setReleaseFrom] = useState(defaultReleaseFrom);
  const [releaseTo, setReleaseTo] = useState(defaultReleaseTo);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const nextSearch = value.trim();

      if (nextSearch) {
        params.set("search", nextSearch);
      } else {
        params.delete("search");
      }

      if (releaseFrom) {
        params.set("releaseFrom", releaseFrom);
      } else {
        params.delete("releaseFrom");
      }

      if (releaseTo) {
        params.set("releaseTo", releaseTo);
      } else {
        params.delete("releaseTo");
      }

      params.set("page", "1");

      const nextUrl = `/?${params.toString()}`;
      const currentUrl = `/?${searchParams.toString()}`;

      if (nextUrl !== currentUrl) {
        router.replace(nextUrl, { scroll: false });
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [releaseFrom, releaseTo, router, searchParams, value]);

  function applySearch() {
    const params = new URLSearchParams(searchParams.toString());
    const nextSearch = value.trim();

    if (nextSearch) {
      params.set("search", nextSearch);
    } else {
      params.delete("search");
    }

    if (releaseFrom) {
      params.set("releaseFrom", releaseFrom);
    } else {
      params.delete("releaseFrom");
    }

    if (releaseTo) {
      params.set("releaseTo", releaseTo);
    } else {
      params.delete("releaseTo");
    }

    params.set("page", "1");
    router.replace(`/?${params.toString()}`, { scroll: false });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applySearch();
  }

  return (
    <form
      className="flex w-full flex-col gap-2 lg:flex-row lg:items-start lg:justify-between"
      onSubmit={submit}
    >
      <div className="flex w-full gap-2 lg:max-w-2xl">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="border-slate-200/80 bg-white/90 pl-9 shadow-none"
            onChange={(event) => setValue(event.target.value)}
            placeholder="Tìm ticket, tên ticket, người thực hiện"
            value={value}
          />
        </div>
        {value ? (
          <Button
            aria-label="Xoá tìm kiếm"
            onClick={() => setValue("")}
            size="icon"
            type="button"
            variant="outline"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
        <Button className="shrink-0 bg-white/90" type="submit" variant="outline">
          Tìm
        </Button>
      </div>
      <DateRangePicker
        from={releaseFrom}
        onChange={({ from, to }) => {
          setReleaseFrom(from);
          setReleaseTo(to);
        }}
        to={releaseTo}
      />
    </form>
  );
}
