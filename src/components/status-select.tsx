"use client";

import { useRef, useState, useTransition } from "react";
import { updateInvoiceStatusAction } from "@/lib/actions/invoices";
import { INVOICE_STATUSES, type InvoiceStatus } from "@/lib/types";

export function StatusSelect({ invoiceId, status }: { invoiceId: string; status: InvoiceStatus }) {
  const [value, setValue] = useState(status);
  const [pendingValue, setPendingValue] = useState<InvoiceStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);

  function requestChange(next: InvoiceStatus) {
    setError(null);
    setPendingValue(next);
    dialogRef.current?.showModal();
  }

  function cancel() {
    dialogRef.current?.close();
    setPendingValue(null);
  }

  function confirm() {
    const next = pendingValue;
    dialogRef.current?.close();
    setPendingValue(null);
    if (!next) return;

    setValue(next);
    startTransition(async () => {
      try {
        await updateInvoiceStatusAction(invoiceId, next);
      } catch {
        setValue(status);
        setError("Could not update status.");
      }
    });
  }

  return (
    <>
      <select
        value={value}
        disabled={isPending}
        onChange={(e) => requestChange(e.target.value as InvoiceStatus)}
        className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none disabled:opacity-50"
      >
        {INVOICE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}

      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          e.preventDefault();
          cancel();
        }}
        className="fixed top-1/2 left-1/2 m-0 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-lg [&::backdrop]:bg-black/60"
      >
        <p className="text-sm font-medium text-zinc-50">Change invoice status?</p>
        <p className="mt-2 text-sm text-zinc-400">
          This will change the status from <span className="font-medium text-zinc-200">{value}</span> to{" "}
          <span className="font-medium text-zinc-200">{pendingValue}</span>.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={cancel}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white"
          >
            Confirm
          </button>
        </div>
      </dialog>
    </>
  );
}
