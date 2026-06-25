import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { StatusSelect } from "@/components/status-select";
import { AddItemForm } from "@/components/add-item-form";
import { RemoveItemButton } from "@/components/remove-item-button";
import type { Invoice } from "@/lib/types";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let invoice: Invoice;
  try {
    invoice = await apiFetch<Invoice>(`/invoices/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const isDraft = invoice.status === "DRAFT";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">{invoice.invoiceNumber}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            <Link href={`/customers/${invoice.customer.id}`} className="hover:underline">
              {invoice.customer.name}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={invoice.status} />
          <StatusSelect invoiceId={invoice.id} status={invoice.status} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <div>
          <p className="text-xs uppercase text-zinc-500">Issued</p>
          <p className="mt-1 text-sm text-zinc-50">{formatDate(invoice.issueDate)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-zinc-500">Due</p>
          <p className="mt-1 text-sm text-zinc-50">{formatDate(invoice.dueDate)}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-zinc-500">Total</p>
          <p className="mt-1 text-sm font-semibold text-zinc-50">{formatCurrency(invoice.totalAmount)}</p>
        </div>
        {invoice.notes && (
          <div className="col-span-3 border-t border-zinc-800 pt-3">
            <p className="text-xs uppercase text-zinc-500">Notes</p>
            <p className="mt-1 text-sm text-zinc-300">{invoice.notes}</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h2 className="text-sm font-medium text-zinc-300">Line items</h2>
          {!isDraft && (
            <p className="text-xs text-zinc-500">Items can only be changed while the invoice is in Draft.</p>
          )}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs uppercase text-zinc-500">
              <th className="px-5 py-2">Description</th>
              <th className="px-5 py-2 text-right">Qty</th>
              <th className="px-5 py-2 text-right">Unit price</th>
              <th className="px-5 py-2 text-right">Total</th>
              {isDraft && <th className="px-5 py-2" />}
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-zinc-800/50 last:border-0">
                <td className="px-5 py-3 text-zinc-50">{item.description}</td>
                <td className="px-5 py-3 text-right text-zinc-300">{item.quantity}</td>
                <td className="px-5 py-3 text-right text-zinc-300">{formatCurrency(item.unitPrice)}</td>
                <td className="px-5 py-3 text-right text-zinc-50">{formatCurrency(item.total)}</td>
                {isDraft && (
                  <td className="px-5 py-3">
                    <RemoveItemButton invoiceId={invoice.id} itemId={item.id} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {isDraft && (
          <div className="border-t border-zinc-800 px-5 py-4">
            <AddItemForm invoiceId={invoice.id} />
          </div>
        )}
      </div>
    </div>
  );
}
