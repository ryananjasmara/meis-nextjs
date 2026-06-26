"use client";

import { useState, useTransition } from "react";
import { Check, Trash2 } from "lucide-react";
import { removeInvoiceItemAction, updateInvoiceItemAction } from "@/lib/actions/invoices";
import { formatCurrency } from "@/lib/format";
import type { InvoiceItem } from "@/lib/types";

const cellInputClass =
  "rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none disabled:opacity-50";

export function EditableItemRow({ invoiceId, item }: { invoiceId: string; item: InvoiceItem }) {
  const [description, setDescription] = useState(item.description);
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [unitPrice, setUnitPrice] = useState(item.unitPrice);
  const [isSaving, startSaving] = useTransition();
  const [isRemoving, startRemoving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const pending = isSaving || isRemoving;
  const total = (Number(quantity) || 0) * (Number(unitPrice) || 0);

  function save() {
    setError(null);
    startSaving(async () => {
      try {
        await updateInvoiceItemAction(invoiceId, item.id, {
          description,
          quantity: Number(quantity),
          unitPrice: Number(unitPrice),
        });
      } catch {
        setError("Could not save item.");
      }
    });
  }

  function remove() {
    setError(null);
    startRemoving(async () => {
      try {
        await removeInvoiceItemAction(invoiceId, item.id);
      } catch {
        setError("Could not remove item.");
      }
    });
  }

  return (
    <tr className="border-b border-zinc-800/50 last:border-0">
      <td className="px-5 py-2">
        <input
          value={description}
          disabled={pending}
          onChange={(e) => setDescription(e.target.value)}
          className={`w-full ${cellInputClass}`}
        />
      </td>
      <td className="px-5 py-2 text-right">
        <input
          type="number"
          min="1"
          value={quantity}
          disabled={pending}
          onChange={(e) => setQuantity(e.target.value)}
          className={`w-16 text-right ${cellInputClass}`}
        />
      </td>
      <td className="px-5 py-2 text-right">
        <input
          type="number"
          min="0"
          step="1"
          value={unitPrice}
          disabled={pending}
          onChange={(e) => setUnitPrice(e.target.value)}
          className={`w-28 text-right ${cellInputClass}`}
        />
      </td>
      <td className="px-5 py-2 text-right text-zinc-50">{formatCurrency(total)}</td>
      <td className="px-5 py-2">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={save}
            disabled={pending}
            title="Save"
            className="text-zinc-400 hover:text-zinc-50 disabled:opacity-50"
          >
            <Check className="size-4" />
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            title="Remove"
            className="text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
        {error && <p className="mt-1 text-right text-xs text-red-400">{error}</p>}
      </td>
    </tr>
  );
}
