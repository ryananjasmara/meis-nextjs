"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/format";
import { INVOICE_STATUSES, type Invoice, type InvoiceStatus, type Paginated } from "@/lib/types";

export function CustomerInvoicesPanel({
  customerId,
  initialData,
  initialStatus,
  initialSearch,
}: {
  customerId: string;
  initialData: Paginated<Invoice>;
  initialStatus?: InvoiceStatus;
  initialSearch?: string;
}) {
  const [status, setStatus] = useState<InvoiceStatus | undefined>(initialStatus);
  const [searchInput, setSearchInput] = useState(initialSearch ?? "");
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  function load(nextStatus: InvoiceStatus | undefined, nextSearch: string, page: number) {
    startTransition(async () => {
      const query = new URLSearchParams();
      if (nextStatus) query.set("status", nextStatus);
      if (nextSearch) query.set("search", nextSearch);
      query.set("page", String(page));
      const res = await fetch(`/api/customers/${customerId}/invoices?${query}`);
      const json = (await res.json()) as Paginated<Invoice>;
      setData(json);
    });
  }

  function selectStatus(next: InvoiceStatus | undefined) {
    setStatus(next);
    load(next, searchInput, 1);
  }

  function submitSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    load(status, searchInput, 1);
  }

  function goToPage(page: number) {
    load(status, searchInput, page);
  }

  const { data: invoices, meta } = data;
  const isFirst = meta.page <= 1;
  const isLast = meta.page >= meta.totalPages;
  const rangeStart = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const rangeEnd = Math.min(meta.total, meta.page * meta.limit);

  return (
    <div className={isPending ? "opacity-60 transition-opacity" : undefined}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-5 py-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectStatus(undefined)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              !status ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            All
          </button>
          {INVOICE_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => selectStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                status === s ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={submitSearch} className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by invoice #…"
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
        </form>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b border-zinc-800/50 last:border-0">
              <td className="px-5 py-3">
                <Link href={`/invoices/${invoice.id}`} className="font-medium text-zinc-50 hover:underline">
                  {invoice.invoiceNumber}
                </Link>
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={invoice.status} />
              </td>
              <td className="px-5 py-3 text-right text-zinc-50">
                {formatCurrency(invoice.grandTotal, invoice.currency)}
              </td>
            </tr>
          ))}
          {invoices.length === 0 && (
            <tr>
              <td className="px-5 py-6 text-center text-zinc-500">
                {status || searchInput ? "No invoices match this filter." : "No invoices for this customer yet."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3 text-sm text-zinc-400">
        <span>
          Showing {rangeStart}–{rangeEnd} of {meta.total}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => goToPage(Math.max(1, meta.page - 1))}
            disabled={isFirst}
            className={`flex items-center gap-1 rounded-md px-2 py-1 ${
              isFirst ? "pointer-events-none opacity-30" : "hover:bg-zinc-800 hover:text-zinc-50"
            }`}
          >
            <ChevronLeft className="size-4" />
            Prev
          </button>
          <button
            type="button"
            onClick={() => goToPage(Math.min(meta.totalPages, meta.page + 1))}
            disabled={isLast}
            className={`flex items-center gap-1 rounded-md px-2 py-1 ${
              isLast ? "pointer-events-none opacity-30" : "hover:bg-zinc-800 hover:text-zinc-50"
            }`}
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
