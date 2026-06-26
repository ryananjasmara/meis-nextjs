import Link from "next/link";
import { notFound } from "next/navigation";
import { Receipt } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { updateCustomerAction } from "@/lib/actions/customers";
import { CustomerForm } from "@/components/customer-form";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/format";
import type { Customer, Invoice, Paginated } from "@/lib/types";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let customer: Customer;
  try {
    customer = await apiFetch<Customer>(`/customers/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const { data: customerInvoices } = await apiFetch<Paginated<Invoice>>(
    `/invoices?customerId=${id}&limit=100`,
  );

  const boundUpdate = updateCustomerAction.bind(null, id);

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-50">{customer.name}</h1>
        <DeleteCustomerButton customerId={id} />
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
        <CustomerForm action={boundUpdate} customer={customer} submitLabel="Save changes" />
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 shadow-sm">
        <div className="border-b border-zinc-800 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Receipt className="size-4" />
            Invoices
          </h2>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {customerInvoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-zinc-800/50 last:border-0">
                <td className="px-5 py-3">
                  <Link href={`/invoices/${invoice.id}`} className="font-medium text-zinc-50 hover:underline">
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={invoice.status} />
                </td>
                <td className="px-5 py-3 text-right text-zinc-50">{formatCurrency(invoice.totalAmount)}</td>
              </tr>
            ))}
            {customerInvoices.length === 0 && (
              <tr>
                <td className="px-5 py-6 text-center text-zinc-500">No invoices for this customer yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
