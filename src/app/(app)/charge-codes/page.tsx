import Link from "next/link";
import { ListTree, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { SearchBox } from "@/components/search-box";
import type { ChargeCode } from "@/lib/types";

export default async function ChargeCodesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const query = new URLSearchParams();
  if (search) query.set("search", search);

  const chargeCodes = await apiFetch<ChargeCode[]>(`/charge-codes?${query}`);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-50">Charge codes</h1>
        <Link
          href="/charge-codes/new"
          className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          <Plus className="size-4" />
          New charge code
        </Link>
      </div>

      <SearchBox action="/charge-codes" placeholder="Search by code or description…" defaultValue={search} />

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs uppercase text-zinc-500">
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">PPN default</th>
            </tr>
          </thead>
          <tbody>
            {chargeCodes.map((chargeCode) => (
              <tr key={chargeCode.id} className="border-b border-zinc-800/50 last:border-0">
                <td className="px-5 py-3">
                  <Link
                    href={`/charge-codes/${chargeCode.id}`}
                    className="font-medium text-zinc-50 hover:underline"
                  >
                    {chargeCode.code}
                  </Link>
                </td>
                <td className="px-5 py-3 text-zinc-300">{chargeCode.description}</td>
                <td className="px-5 py-3 text-zinc-300">{chargeCode.isTaxable ? "Taxable" : "Not taxable"}</td>
              </tr>
            ))}
            {chargeCodes.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-zinc-500">
                  <ListTree className="mx-auto mb-2 size-6 text-zinc-600" />
                  {search ? `No charge codes match "${search}".` : "No charge codes yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
