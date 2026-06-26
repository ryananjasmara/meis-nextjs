"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { addInvoiceItemAction } from "@/lib/actions/invoices";

const inputClass =
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none";

export function AddItemForm({ invoiceId }: { invoiceId: string }) {
  const action = addInvoiceItemAction.bind(null, invoiceId);
  const [state, formAction, pending] = useActionState(action, undefined);
  const handledRef = useRef(state);

  useEffect(() => {
    if (!state || state === handledRef.current) return;
    handledRef.current = state;
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success("Item added.");
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input name="description" placeholder="Description" required className={`flex-1 ${inputClass}`} />
      <input
        name="quantity"
        type="number"
        min="1"
        defaultValue="1"
        placeholder="Qty"
        className={`w-20 ${inputClass}`}
      />
      <input
        name="unitPrice"
        type="number"
        min="0"
        step="1"
        placeholder="Unit price"
        className={`w-28 ${inputClass}`}
      />
      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-50"
      >
        <Plus className="size-4" />
        {pending ? "Adding…" : "Add item"}
      </button>
    </form>
  );
}
