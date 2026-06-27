import Link from "next/link";
import { BarChart3, Clock3, FileStack, ListChecks, Users, Wallet } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Currency, DashboardSummary, InvoiceStatus } from "@/lib/types";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";

const STATUS_ORDER: InvoiceStatus[] = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];

export default async function DashboardPage() {
  const summary = await apiFetch<DashboardSummary>("/dashboard/summary");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-zinc-50">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Customers" value={String(summary.totalCustomers)} icon={Users} />
        <StatCard label="Invoices" value={String(summary.totalInvoices)} icon={FileStack} />
        <StatCard
          label="Revenue (paid)"
          value={formatCurrency(summary.totalRevenue)}
          hint="IDR equiv."
          icon={Wallet}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(summary.outstandingAmount)}
          hint="Sent + overdue, IDR equiv."
          icon={Clock3}
        />
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Wallet className="size-4" />
          Revenue by currency
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.entries(summary.revenueByCurrency).map(([currency, amounts]) => (
            <div key={currency} className="rounded-md border border-zinc-800 px-4 py-3">
              <p className="text-xs font-medium uppercase text-zinc-500">{currency}</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-zinc-400">Paid</span>
                <span className="font-medium text-zinc-50">
                  {formatCurrency(amounts.paid, currency as Currency)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-zinc-400">Outstanding</span>
                <span className="font-medium text-zinc-50">
                  {formatCurrency(amounts.outstanding, currency as Currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <BarChart3 className="size-4" />
          Invoices by status
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {STATUS_ORDER.map((status) => (
            <div key={status} className="flex items-center gap-2 rounded-md border border-zinc-800 px-3 py-2">
              <StatusBadge status={status} />
              <span className="text-sm font-semibold text-zinc-50">{summary.invoicesByStatus[status]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <ListChecks className="size-4" />
            Recent invoices
          </h2>
          <Link href="/invoices" className="text-sm font-medium text-zinc-50 hover:underline">
            View all
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs uppercase text-zinc-500">
              <th className="px-5 py-2">Invoice</th>
              <th className="px-5 py-2">Customer</th>
              <th className="px-5 py-2">Due</th>
              <th className="px-5 py-2">Status</th>
              <th className="px-5 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {summary.recentInvoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-zinc-800/50 last:border-0">
                <td className="px-5 py-3">
                  <Link href={`/invoices/${invoice.id}`} className="font-medium text-zinc-50 hover:underline">
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                <td className="px-5 py-3 text-zinc-300">{invoice.customer.name}</td>
                <td className="px-5 py-3 text-zinc-300">{formatDate(invoice.dueDate)}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={invoice.status} />
                </td>
                <td className="px-5 py-3 text-right text-zinc-50">
                  {formatCurrency(invoice.totalAmount, invoice.currency)}
                </td>
              </tr>
            ))}
            {summary.recentInvoices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-zinc-500">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
