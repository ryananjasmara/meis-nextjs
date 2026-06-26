"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { updateInvoiceDueDateAction } from "@/lib/actions/invoices";

export function EditableDueDate({ invoiceId, dueDate }: { invoiceId: string; dueDate: string }) {
  const [value, setValue] = useState(dueDate.slice(0, 10));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await updateInvoiceDueDateAction(invoiceId, value);
      } catch {
        setError("Could not update due date.");
      }
    });
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={value}
          disabled={isPending}
          onChange={(e) => setValue(e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="text-zinc-400 hover:text-zinc-50 disabled:opacity-50"
        >
          <Check className="size-4" />
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
