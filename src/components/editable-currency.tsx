"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { updateInvoiceCurrencyAction } from "@/lib/actions/invoices";
import { Select } from "@/components/select";
import { CURRENCIES, type Currency } from "@/lib/types";

export function EditableCurrency({
  invoiceId,
  currency,
  exchangeRate,
}: {
  invoiceId: string;
  currency: Currency;
  exchangeRate: string;
}) {
  const [value, setValue] = useState<Currency>(currency);
  const [rate, setRate] = useState(exchangeRate);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        await updateInvoiceCurrencyAction(invoiceId, value, value === "IDR" ? 1 : Number(rate));
        toast.success("Currency updated.");
      } catch {
        toast.error("Could not update currency.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value as Currency;
          setValue(next);
          if (next === "IDR") setRate("1");
        }}
        className="w-28 shrink-0"
      >
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>
      {value !== "IDR" && (
        <input
          type="number"
          min="1"
          step="0.01"
          value={rate}
          disabled={isPending}
          onChange={(e) => setRate(e.target.value)}
          placeholder="Rate to IDR"
          className="w-40 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none disabled:opacity-50"
        />
      )}
      <button
        type="button"
        onClick={save}
        disabled={isPending}
        className="shrink-0 text-zinc-400 hover:text-zinc-50 disabled:opacity-50"
      >
        <Check className="size-4 text-green-500" />
      </button>
    </div>
  );
}
