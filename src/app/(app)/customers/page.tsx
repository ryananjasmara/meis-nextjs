import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { SearchBox } from "@/components/search-box";
import { Pagination } from "@/components/pagination";
import type { Customer, Paginated } from "@/lib/types";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search, page } = await searchParams;
  const currentPage = page ? Number(page) : 1;

  const query = new URLSearchParams();
  if (search) query.set("search", search);
  query.set("page", String(currentPage));
  query.set("limit", "10");

  const { data: customers, meta } = await apiFetch<Paginated<Customer>>(`/customers?${query}`);

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

      <SearchBox action="/customers" placeholder="Search by name, email, or phone…" defaultValue={search} />

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
                  {search ? `No customers match "${search}".` : "No customers yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination basePath="/customers" query={{ search }} page={meta.page} totalPages={meta.totalPages} />
      </div>
    </div>
  );
}
