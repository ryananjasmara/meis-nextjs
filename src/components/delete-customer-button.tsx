"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteCustomerAction } from "@/lib/actions/customers";

export function DeleteCustomerButton({ customerId }: { customerId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function remove() {
    startTransition(async () => {
      try {
        await deleteCustomerAction(customerId);
        toast.success("Customer deleted.");
        router.push("/customers");
      } catch {
        toast.error("Could not delete customer.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={isPending}
      className="flex items-center gap-1.5 text-sm font-medium text-red-400 hover:underline disabled:opacity-50"
    >
      <Trash2 className="size-4" />
      {isPending ? "Deleting…" : "Delete customer"}
    </button>
  );
}
