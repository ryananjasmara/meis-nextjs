"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CustomerFormState } from "@/lib/actions/customers";
import type { Customer } from "@/lib/types";

type Action = (state: CustomerFormState, formData: FormData) => Promise<CustomerFormState>;

const inputClass =
  "mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none";

export function CustomerForm({
  action,
  customer,
  submitLabel,
}: {
  action: Action;
  customer?: Customer;
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
    } else if (state.customerId) {
      toast.success(customer ? "Customer updated." : "Customer created.");
      router.push(`/customers/${state.customerId}`);
    }
  }, [state, customer, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
          Name
        </label>
        <input id="name" name="name" required defaultValue={customer?.name} className={inputClass} />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={customer?.email ?? ""}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-zinc-300">
          Phone
        </label>
        <input id="phone" name="phone" defaultValue={customer?.phone ?? ""} className={inputClass} />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-zinc-300">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          rows={2}
          defaultValue={customer?.address ?? ""}
          className={inputClass}
        />
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
