import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { PrintButton } from "@/components/print-button";
import { Logo } from "@/components/logo";
import type { Invoice } from "@/lib/types";

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let invoice: Invoice;
  try {
    invoice = await apiFetch<Invoice>(`/invoices/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="min-h-screen bg-zinc-100 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between px-4 print:hidden">
        <Link href={`/invoices/${invoice.id}`} className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900">
          <ArrowLeft className="size-4" />
          Back to invoice
        </Link>
        <PrintButton />
      </div>

      <div className="mx-auto max-w-3xl bg-white p-10 text-zinc-900 shadow-sm print:shadow-none">
        <div className="flex items-start justify-between border-b border-zinc-200 pb-6">
          <Logo />
          <div className="text-right">
            <h1 className="text-xl font-semibold">INVOICE</h1>
            <p className="text-sm text-zinc-500">{invoice.invoiceNumber}</p>
            <p className="mt-1 text-sm font-medium text-zinc-700">{invoice.status}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">Bill to</p>
            <p className="mt-1 font-medium">{invoice.customer.name}</p>
            {invoice.customer.address && <p className="text-sm text-zinc-600">{invoice.customer.address}</p>}
            {invoice.customer.email && <p className="text-sm text-zinc-600">{invoice.customer.email}</p>}
            {invoice.customer.phone && <p className="text-sm text-zinc-600">{invoice.customer.phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-zinc-400">Issued</p>
            <p className="text-sm">{formatDate(invoice.issueDate)}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-zinc-400">Due</p>
            <p className="text-sm">{formatDate(invoice.dueDate)}</p>
            {invoice.currency !== "IDR" && (
              <p className="mt-2 text-xs text-zinc-500">
                {invoice.currency} · rate {Number(invoice.exchangeRate).toLocaleString("id-ID")}
              </p>
            )}
          </div>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 text-left text-xs uppercase text-zinc-500">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100">
                <td className="py-2.5">{item.description}</td>
                <td className="py-2.5 text-right">{item.quantity}</td>
                <td className="py-2.5 text-right">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                <td className="py-2.5 text-right">{formatCurrency(item.total, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-56 space-y-1 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>{invoice.isTaxable ? `PPN (${(Number(invoice.vatRate) * 100).toFixed(0)}%)` : "PPN"}</span>
              <span>{invoice.isTaxable ? formatCurrency(invoice.vatAmount, invoice.currency) : "—"}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-300 pt-1 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(invoice.grandTotal, invoice.currency)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 border-t border-zinc-200 pt-4">
            <p className="text-xs uppercase tracking-wide text-zinc-400">Notes</p>
            <p className="mt-1 text-sm text-zinc-600">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
