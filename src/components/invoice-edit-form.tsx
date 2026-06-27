"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { updateInvoiceFullAction } from "@/lib/actions/invoices";
import { formatCurrency } from "@/lib/format";
import { Select } from "@/components/select";
import { CURRENCIES, type ChargeCode, type Currency, type Invoice } from "@/lib/types";

type Row = {
  id: string | null;
  description: string;
  quantity: string;
  unitPrice: string;
  chargeCodeId: string;
  isTaxable: boolean;
};

const emptyRow: Row = { id: null, description: "", quantity: "1", unitPrice: "0", chargeCodeId: "", isTaxable: true };

// Preview only — the canonical rate is recalculated server-side on save.
const VAT_RATE_PREVIEW = 0.11;

const inputClass =
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none";

export function InvoiceEditForm({ invoice, chargeCodes }: { invoice: Invoice; chargeCodes: ChargeCode[] }) {
  const action = updateInvoiceFullAction.bind(null, invoice.id);
  const [state, formAction, pending] = useActionState(action, undefined);
  const handledRef = useRef(state);

  const [rows, setRows] = useState<Row[]>(
    invoice.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: String(item.quantity),
      unitPrice: item.unitPrice,
      chargeCodeId: item.chargeCodeId ?? "",
      isTaxable: item.isTaxable,
    })),
  );
  const [currency, setCurrency] = useState<Currency>(invoice.currency);
  const [exchangeRate, setExchangeRate] = useState(invoice.exchangeRate);
  const originalItemIds = invoice.items.map((item) => item.id);

  useEffect(() => {
    if (!state || state === handledRef.current) return;
    handledRef.current = state;
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success("Invoice updated.");
    }
  }, [state]);

  const subtotal = rows.reduce((sum, row) => {
    const qty = Number(row.quantity) || 0;
    const price = Number(row.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  const vatAmount = rows.reduce((sum, row) => {
    if (!row.isTaxable) return sum;
    const qty = Number(row.quantity) || 0;
    const price = Number(row.unitPrice) || 0;
    return sum + qty * price * VAT_RATE_PREVIEW;
  }, 0);

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function selectChargeCode(index: number, chargeCodeId: string) {
    const chargeCode = chargeCodes.find((c) => c.id === chargeCodeId);
    if (!chargeCode) {
      updateRow(index, { chargeCodeId: "" });
      return;
    }
    updateRow(index, {
      chargeCodeId: chargeCode.id,
      description: chargeCode.description,
      isTaxable: chargeCode.isTaxable,
    });
  }

  return (
    <form action={formAction} className="space-y-6 rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      {originalItemIds.map((id) => (
        <input key={id} type="hidden" name="originalItemId" value={id} />
      ))}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-zinc-300">
            Due date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            required
            defaultValue={invoice.dueDate.slice(0, 10)}
            className={`mt-1 w-full ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-zinc-300">
            Notes
          </label>
          <input
            id="notes"
            name="notes"
            defaultValue={invoice.notes ?? ""}
            className={`mt-1 w-full ${inputClass}`}
          />
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
            <div key={index} className="space-y-2 rounded-md border border-zinc-800 p-3">
              <div className="flex gap-2">
                <div className="w-44 shrink-0">
                  <label className="block text-xs text-zinc-500">Charge code</label>
                  <Select
                    value={row.chargeCodeId}
                    onChange={(e) => selectChargeCode(index, e.target.value)}
                    className="mt-0.5 w-full"
                  >
                    <option value="">— Free text —</option>
                    {chargeCodes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-zinc-500">Description</label>
                  <input
                    name="description"
                    placeholder="Description"
                    value={row.description}
                    onChange={(e) => updateRow(index, { description: e.target.value })}
                    className={`mt-0.5 w-full ${inputClass}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                  disabled={rows.length === 1}
                  className="flex items-center self-end px-2 py-2 text-sm text-red-400 hover:underline disabled:opacity-30"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="flex items-end gap-2">
                <div className="w-20">
                  <label className="block text-xs text-zinc-500">Qty</label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(e) => updateRow(index, { quantity: e.target.value })}
                    className={`mt-0.5 w-full ${inputClass}`}
                  />
                </div>
                <div className="w-28">
                  <label className="block text-xs text-zinc-500">Unit price</label>
                  <input
                    name="unitPrice"
                    type="number"
                    min="0"
                    step="1"
                    value={row.unitPrice}
                    onChange={(e) => updateRow(index, { unitPrice: e.target.value })}
                    className={`mt-0.5 w-full ${inputClass}`}
                  />
                </div>
                <label className="flex items-center gap-1.5 pb-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={row.isTaxable}
                    onChange={(e) => updateRow(index, { isTaxable: e.target.checked })}
                    className="size-4 rounded border-zinc-700 bg-zinc-900"
                  />
                  Taxable
                </label>
                <input type="hidden" name="itemId" value={row.id ?? ""} />
                <input type="hidden" name="chargeCodeId" value={row.chargeCodeId} />
                <input type="hidden" name="isTaxable" value={row.isTaxable ? "true" : "false"} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1 text-right text-sm">
          <p className="text-zinc-400">Subtotal: {formatCurrency(subtotal, currency)}</p>
          <p className="text-zinc-400">
            PPN ({(VAT_RATE_PREVIEW * 100).toFixed(0)}%): {formatCurrency(vatAmount, currency)}
          </p>
          <p className="font-medium text-zinc-300">Total: {formatCurrency(subtotal + vatAmount, currency)}</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
