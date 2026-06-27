import { notFound } from "next/navigation";
import { Receipt } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { updateCustomerAction } from "@/lib/actions/customers";
import { CustomerForm } from "@/components/customer-form";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import { CustomerInvoicesPanel } from "@/components/customer-invoices-panel";
import type { Customer, Invoice, InvoiceStatus, Paginated } from "@/lib/types";

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const { id } = await params;
  const { status, search, page } = await searchParams;
  const currentPage = page ? Number(page) : 1;

  let customer: Customer;
  try {
    customer = await apiFetch<Customer>(`/customers/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const query = new URLSearchParams();
  query.set("customerId", id);
  if (status) query.set("status", status);
  if (search) query.set("search", search);
  query.set("page", String(currentPage));
  query.set("limit", "10");

  const initialInvoices = await apiFetch<Paginated<Invoice>>(`/invoices?${query}`);

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
        <CustomerInvoicesPanel
          customerId={id}
          initialData={initialInvoices}
          initialStatus={status as InvoiceStatus | undefined}
          initialSearch={search}
        />
      </div>
    </div>
  );
}
