import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  releaseFrom: string;
  releaseTo: string;
  totalPages: number;
  search: string;
};

function pageHref(
  page: number,
  search: string,
  releaseFrom: string,
  releaseTo: string,
) {
  const params = new URLSearchParams();
  params.set("page", String(page));

  if (search) {
    params.set("search", search);
  }

  if (releaseFrom) {
    params.set("releaseFrom", releaseFrom);
  }

  if (releaseTo) {
    params.set("releaseTo", releaseTo);
  }

  return `/?${params.toString()}`;
}

export function Pagination({
  page,
  releaseFrom,
  releaseTo,
  totalPages,
  search,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1)
    .reduce<number[]>((acc, item) => {
      const previous = acc.at(-1);

      if (previous && item - previous > 1) {
        acc.push(-item);
      }

      acc.push(item);
      return acc;
    }, []);

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-4"
      aria-label="Pagination"
    >
      <Link
        aria-disabled={page <= 1}
        aria-label="Trang trước"
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900",
          page <= 1 && "pointer-events-none text-slate-300",
        )}
        href={pageHref(Math.max(1, page - 1), search, releaseFrom, releaseTo)}
      >
        <ChevronLeft className="h-6 w-6" />
      </Link>
      {pages.map((item) =>
        item < 0 ? (
          <span
            className="flex h-14 min-w-8 items-center justify-center text-2xl font-semibold text-slate-800"
            key={item}
          >
            ...
          </span>
        ) : (
          <Link
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-xl border text-xl font-semibold shadow-sm transition-colors",
              item === page
                ? "border-violet-600 bg-violet-500 text-white shadow-violet-200 hover:bg-violet-600"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950",
            )}
            href={pageHref(item, search, releaseFrom, releaseTo)}
            key={item}
          >
            {item}
          </Link>
        ),
      )}
      <Link
        aria-disabled={page >= totalPages}
        aria-label="Trang sau"
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900",
          page >= totalPages && "pointer-events-none text-slate-300",
        )}
        href={pageHref(Math.min(totalPages, page + 1), search, releaseFrom, releaseTo)}
      >
        <ChevronRight className="h-6 w-6" />
      </Link>
    </nav>
  );
}
