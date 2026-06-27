import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusSelect } from "@/components/status-select";
import { InvoiceEditForm } from "@/components/invoice-edit-form";
import type { ChargeCode, Invoice } from "@/lib/types";

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
  const chargeCodes = isDraft ? await apiFetch<ChargeCode[]>("/charge-codes") : [];

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
        <div className="flex items-center">
          <StatusSelect invoiceId={invoice.id} status={invoice.status} />
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href={`/invoices/${invoice.id}/print`}
          target="_blank"
          className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
        >
          <Printer className="size-4" />
          Print / PDF
        </Link>
      </div>

      {isDraft ? (
        <>
          <p className="text-sm text-zinc-400">Issued {formatDate(invoice.issueDate)}</p>
          <InvoiceEditForm invoice={invoice} chargeCodes={chargeCodes} />
        </>
      ) : (
        <>
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
              <p className="mt-1 text-sm font-semibold text-zinc-50">
                {formatCurrency(invoice.grandTotal, invoice.currency)}
              </p>
              <div className="mt-1 space-y-0.5 text-xs text-zinc-500">
                <p>Subtotal {formatCurrency(invoice.totalAmount, invoice.currency)}</p>
                <p>
                  {Number(invoice.vatAmount) > 0
                    ? `PPN (${(Number(invoice.vatRate) * 100).toFixed(0)}%) ${formatCurrency(invoice.vatAmount, invoice.currency)}`
                    : "PPN — no taxable items"}
                </p>
                {invoice.currency !== "IDR" && (
                  <p>
                    {invoice.currency} · rate {Number(invoice.exchangeRate).toLocaleString("id-ID")}
                  </p>
                )}
              </div>
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
              <p className="text-xs text-zinc-500">Items can only be changed while the invoice is in Draft.</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs uppercase text-zinc-500">
                  <th className="px-5 py-2">Description</th>
                  <th className="px-5 py-2 text-right">Qty</th>
                  <th className="px-5 py-2 text-right">Unit price</th>
                  <th className="px-5 py-2 text-center">Taxable</th>
                  <th className="px-5 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-800/50 last:border-0">
                    <td className="px-5 py-3 text-zinc-50">{item.description}</td>
                    <td className="px-5 py-3 text-right text-zinc-300">{item.quantity}</td>
                    <td className="px-5 py-3 text-right text-zinc-300">
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </td>
                    <td className="px-5 py-3 text-center text-zinc-300">{item.isTaxable ? "Yes" : "No"}</td>
                    <td className="px-5 py-3 text-right text-zinc-50">
                      {formatCurrency(item.total, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
