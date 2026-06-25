import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`appearance-none rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 pr-9 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none disabled:opacity-50 ${className}`}
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
    </div>
  );
}
