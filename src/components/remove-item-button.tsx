"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { removeInvoiceItemAction } from "@/lib/actions/invoices";

export function RemoveItemButton({ invoiceId, itemId }: { invoiceId: string; itemId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="text-right">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await removeInvoiceItemAction(invoiceId, itemId);
            } catch {
              setError("Could not remove item.");
            }
          });
        }}
        className="inline-flex items-center gap-1 text-xs font-medium text-red-400 hover:underline disabled:opacity-50"
      >
        <Trash2 className="size-3.5" />
        {isPending ? "Removing…" : "Remove"}
      </button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
