"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { updateInvoiceTaxAction } from "@/lib/actions/invoices";

export function EditableTax({
  invoiceId,
  isTaxable,
  vatRate,
}: {
  invoiceId: string;
  isTaxable: boolean;
  vatRate: string;
}) {
  const [value, setValue] = useState(isTaxable);
  const [isPending, startTransition] = useTransition();
  const ratePercent = (Number(vatRate) * 100).toFixed(0);

  function save() {
    startTransition(async () => {
      try {
        await updateInvoiceTaxAction(invoiceId, value);
        toast.success("Tax setting updated.");
      } catch {
        toast.error("Could not update tax setting.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 text-sm text-zinc-100">
        <input
          type="checkbox"
          checked={value}
          disabled={isPending}
          onChange={(e) => setValue(e.target.checked)}
          className="size-4 rounded border-zinc-700 bg-zinc-900 disabled:opacity-50"
        />
        Subject to PPN ({ratePercent}%)
      </label>
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
