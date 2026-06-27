"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { createInvoiceAction } from "@/lib/actions/invoices";
import { formatCurrency } from "@/lib/format";
import { Select } from "@/components/select";
import { CURRENCIES, type Currency, type Customer } from "@/lib/types";

type Row = { description: string; quantity: string; unitPrice: string };

const emptyRow: Row = { description: "", quantity: "1", unitPrice: "0" };

// Preview only — the canonical rate is snapshotted server-side at creation.
const VAT_RATE_PREVIEW = 0.11;

const inputClass =
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none";

export function InvoiceForm({ customers }: { customers: Customer[] }) {
  const [state, formAction, pending] = useActionState(createInvoiceAction, undefined);
  const [rows, setRows] = useState<Row[]>([{ ...emptyRow }]);
  const [currency, setCurrency] = useState<Currency>("IDR");
  const [exchangeRate, setExchangeRate] = useState("1");
  const [isTaxable, setIsTaxable] = useState(true);
  const router = useRouter();
  const handledRef = useRef(state);

  useEffect(() => {
    if (!state || state === handledRef.current) return;
    handledRef.current = state;
    if (state.error) {
      toast.error(state.error);
    } else if (state.invoiceId) {
      toast.success("Invoice created.");
      router.push(`/invoices/${state.invoiceId}`);
    }
  }, [state, router]);

  const total = rows.reduce((sum, row) => {
    const qty = Number(row.quantity) || 0;
    const price = Number(row.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  function updateRow(index: number, field: keyof Row, value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="customerId" className="block text-sm font-medium text-zinc-300">
          Customer
        </label>
        <Select id="customerId" name="customerId" required defaultValue="" className="mt-1 w-full">
          <option value="" disabled>
            Select a customer
          </option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-zinc-300">
            Due date
          </label>
          <input id="dueDate" name="dueDate" type="date" required className={`mt-1 w-full ${inputClass}`} />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-zinc-300">
            Notes
          </label>
          <input id="notes" name="notes" className={`mt-1 w-full ${inputClass}`} />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-zinc-300">
            Currency
          </label>
          <Select
            id="currency"
            name="currency"
            value={currency}
            onChange={(e) => {
              const next = e.target.value as Currency;
              setCurrency(next);
              if (next === "IDR") setExchangeRate("1");
              setIsTaxable(next === "IDR");
            }}
            className="mt-1 w-full"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        {currency !== "IDR" && (
          <div>
            <label htmlFor="exchangeRate" className="block text-sm font-medium text-zinc-300">
              Exchange rate (IDR)
            </label>
            <input
              id="exchangeRate"
              name="exchangeRate"
              type="number"
              min="1"
              step="0.01"
              required
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              className={`mt-1 w-full ${inputClass}`}
            />
          </div>
        )}
        <div className="col-span-2">
          <label className="flex items-center gap-2 text-sm text-zinc-100">
            <input
              type="checkbox"
              name="isTaxable"
              checked={isTaxable}
              onChange={(e) => setIsTaxable(e.target.checked)}
              className="size-4 rounded border-zinc-700 bg-zinc-900"
            />
            Subject to PPN ({(VAT_RATE_PREVIEW * 100).toFixed(0)}%)
          </label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-300">Line items</p>
          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, { ...emptyRow }])}
            className="flex items-center gap-1 text-sm font-medium text-zinc-50 hover:underline"
          >
            <Plus className="size-4" />
            Add item
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {rows.map((row, index) => (
            <div key={index} className="flex gap-2">
              <input
                name="description"
                placeholder="Description"
                value={row.description}
                onChange={(e) => updateRow(index, "description", e.target.value)}
                className={`flex-1 ${inputClass}`}
              />
              <input
                name="quantity"
                type="number"
                min="1"
                placeholder="Qty"
                value={row.quantity}
                onChange={(e) => updateRow(index, "quantity", e.target.value)}
                className={`w-20 ${inputClass}`}
              />
              <input
                name="unitPrice"
                type="number"
                min="0"
                step="1"
                placeholder="Unit price"
                value={row.unitPrice}
                onChange={(e) => updateRow(index, "unitPrice", e.target.value)}
                className={`w-28 ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                disabled={rows.length === 1}
                className="flex items-center px-2 text-sm text-red-400 hover:underline disabled:opacity-30"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1 text-right text-sm">
          <p className="text-zinc-400">Subtotal: {formatCurrency(total, currency)}</p>
          {isTaxable && (
            <p className="text-zinc-400">
              PPN ({(VAT_RATE_PREVIEW * 100).toFixed(0)}%):{" "}
              {formatCurrency(total * VAT_RATE_PREVIEW, currency)}
            </p>
          )}
          <p className="font-medium text-zinc-300">
            Total: {formatCurrency(isTaxable ? total * (1 + VAT_RATE_PREVIEW) : total, currency)}
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create invoice"}
      </button>
    </form>
  );
}
