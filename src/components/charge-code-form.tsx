"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ChargeCodeFormState } from "@/lib/actions/charge-codes";
import type { ChargeCode } from "@/lib/types";

type Action = (state: ChargeCodeFormState, formData: FormData) => Promise<ChargeCodeFormState>;

const inputClass =
  "mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none";

export function ChargeCodeForm({
  action,
  chargeCode,
  submitLabel,
}: {
  action: Action;
  chargeCode?: ChargeCode;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const router = useRouter();
  const handledRef = useRef(state);

  useEffect(() => {
    if (!state || state === handledRef.current) return;
    handledRef.current = state;
    if (state.error) {
      toast.error(state.error);
    } else if (state.chargeCodeId) {
      toast.success(chargeCode ? "Charge code updated." : "Charge code created.");
      router.push("/charge-codes");
    }
  }, [state, chargeCode, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-zinc-300">
          Code
        </label>
        <input
          id="code"
          name="code"
          required
          placeholder="PD001"
          defaultValue={chargeCode?.code}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-300">
          Description
        </label>
        <input
          id="description"
          name="description"
          required
          placeholder="Port dues and harbor fee"
          defaultValue={chargeCode?.description}
          className={inputClass}
        />
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm text-zinc-100">
          <input
            type="checkbox"
            name="isTaxable"
            defaultChecked={chargeCode?.isTaxable ?? true}
            className="size-4 rounded border-zinc-700 bg-zinc-900"
          />
          Subject to PPN by default
        </label>
        <p className="mt-1 text-xs text-zinc-500">
          Pre-fills the tax flag when this charge code is picked on an invoice item. Still editable per item.
        </p>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
