import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { INVOICE_STATUSES, type Invoice, type InvoiceStatus } from "@/lib/types";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const query = status ? `?status=${status}` : "";
  const invoices = await apiFetch<Invoice[]>(`/invoices${query}`);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-50">Invoices</h1>
        <Link
          href="/invoices/new"
          className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          New invoice
        </Link>
      </div>

      <div className="flex gap-2">
        <Link
          href="/invoices"
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            !status ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          All
        </Link>
        {INVOICE_STATUSES.map((s: InvoiceStatus) => (
          <Link
            key={s}
            href={`/invoices?status=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              status === s ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {s}
          </Link>
        ))}
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
                <td className="px-5 py-3 text-right text-zinc-50">{formatCurrency(invoice.totalAmount)}</td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-zinc-500">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
