import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  basePath,
  query,
  page,
  totalPages,
  total,
  limit,
}: {
  basePath: string;
  query: Record<string, string | undefined>;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}) {
  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(targetPage));
    return `${basePath}?${params.toString()}`;
  }

  const isFirst = page <= 1;
  const isLast = page >= totalPages;
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(total, page * limit);

  return (
    <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3 text-sm text-zinc-400">
      <span>
        Showing {rangeStart}–{rangeEnd} of {total}
      </span>
      <div className="flex gap-2">
        <Link
          href={hrefFor(Math.max(1, page - 1))}
          aria-disabled={isFirst}
          className={`flex items-center gap-1 rounded-md px-2 py-1 ${
            isFirst ? "pointer-events-none opacity-30" : "hover:bg-zinc-800 hover:text-zinc-50"
          }`}
        >
          <ChevronLeft className="size-4" />
          Prev
        </Link>
        <Link
          href={hrefFor(Math.min(totalPages, page + 1))}
          aria-disabled={isLast}
          className={`flex items-center gap-1 rounded-md px-2 py-1 ${
            isLast ? "pointer-events-none opacity-30" : "hover:bg-zinc-800 hover:text-zinc-50"
          }`}
        >
          Next
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
