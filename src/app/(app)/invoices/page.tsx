import Link from "next/link";
import { FileStack, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { SearchBox } from "@/components/search-box";
import { Pagination } from "@/components/pagination";
import { INVOICE_STATUSES, type Invoice, type InvoiceStatus, type Paginated } from "@/lib/types";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const { status, search, page } = await searchParams;
  const currentPage = page ? Number(page) : 1;

  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (search) query.set("search", search);
  query.set("page", String(currentPage));
  query.set("limit", "10");

  const { data: invoices, meta } = await apiFetch<Paginated<Invoice>>(`/invoices?${query}`);

  function statusHref(s?: InvoiceStatus) {
    const params = new URLSearchParams();
    if (s) params.set("status", s);
    if (search) params.set("search", search);
    return `/invoices?${params}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-50">Invoices</h1>
        <Link
          href="/invoices/new"
          className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          <Plus className="size-4" />
          New invoice
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Link
            href={statusHref()}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              !status ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            All
          </Link>
          {INVOICE_STATUSES.map((s: InvoiceStatus) => (
            <Link
              key={s}
              href={statusHref(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                status === s ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
        <SearchBox
          action="/invoices"
          placeholder="Search by invoice # or customer…"
          defaultValue={search}
          hiddenFields={{ status }}
        />
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs uppercase text-zinc-500">
              <th className="px-5 py-3">Invoice</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Issued</th>
              <th className="px-5 py-3">Due</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-zinc-800/50 last:border-0">
                <td className="px-5 py-3">
                  <Link href={`/invoices/${invoice.id}`} className="font-medium text-zinc-50 hover:underline">
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                <td className="px-5 py-3 text-zinc-300">{invoice.customer.name}</td>
                <td className="px-5 py-3 text-zinc-300">{formatDate(invoice.issueDate)}</td>
                <td className="px-5 py-3 text-zinc-300">{formatDate(invoice.dueDate)}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={invoice.status} />
                </td>
                <td className="px-5 py-3 text-right text-zinc-50">
                  {formatCurrency(invoice.totalAmount, invoice.currency)}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-zinc-500">
                  <FileStack className="mx-auto mb-2 size-6 text-zinc-600" />
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          basePath="/invoices"
          query={{ search, status }}
          page={meta.page}
          totalPages={meta.totalPages}
        />
      </div>
    </div>
  );
}
