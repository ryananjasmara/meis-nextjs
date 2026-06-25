import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Customer } from "@/lib/types";

export default async function CustomersPage() {
  const customers = await apiFetch<Customer[]>("/customers");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-50">Customers</h1>
        <Link
          href="/customers/new"
          className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          <Plus className="size-4" />
          New customer
        </Link>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs uppercase text-zinc-500">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Phone</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-zinc-800/50 last:border-0">
                <td className="px-5 py-3">
                  <Link
                    href={`/customers/${customer.id}`}
                    className="font-medium text-zinc-50 hover:underline"
                  >
                    {customer.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-zinc-300">{customer.email ?? "—"}</td>
                <td className="px-5 py-3 text-zinc-300">{customer.phone ?? "—"}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-zinc-500">
                  <Users className="mx-auto mb-2 size-6 text-zinc-600" />
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
