"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { updateInvoiceNotesAction } from "@/lib/actions/invoices";

export function EditableNotes({ invoiceId, notes }: { invoiceId: string; notes: string | null }) {
  const [value, setValue] = useState(notes ?? "");
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        await updateInvoiceNotesAction(invoiceId, value);
        toast.success("Notes updated.");
      } catch {
        toast.error("Could not update notes.");
      }
    });
  }

  return (
    <div className="flex items-start gap-2">
      <textarea
        value={value}
        rows={2}
        disabled={isPending}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none disabled:opacity-50"
      />
      <button
        type="button"
        onClick={save}
        disabled={isPending}
        className="mt-1 text-zinc-400 hover:text-zinc-50 disabled:opacity-50"
      >
        <Check className="size-4 text-green-500" />
      </button>
    </div>
  );
}
