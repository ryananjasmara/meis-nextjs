import { createCustomerAction } from "@/lib/actions/customers";
import { CustomerForm } from "@/components/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-50">New customer</h1>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
        <CustomerForm action={createCustomerAction} submitLabel="Create customer" />
      </div>
    </div>
  );
}
