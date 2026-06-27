import { apiFetch } from "@/lib/api";
import type { ChargeCode, Customer, Paginated } from "@/lib/types";
import { InvoiceForm } from "@/components/invoice-form";

export default async function NewInvoicePage() {
  const [{ data: customers }, chargeCodes] = await Promise.all([
    apiFetch<Paginated<Customer>>("/customers?limit=100"),
    apiFetch<ChargeCode[]>("/charge-codes"),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-50">New invoice</h1>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
        <InvoiceForm customers={customers} chargeCodes={chargeCodes} />
      </div>
    </div>
  );
}
