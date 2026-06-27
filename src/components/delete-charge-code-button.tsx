"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteChargeCodeAction } from "@/lib/actions/charge-codes";

export function DeleteChargeCodeButton({ chargeCodeId }: { chargeCodeId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function remove() {
    startTransition(async () => {
      const result = await deleteChargeCodeAction(chargeCodeId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Charge code deleted.");
      router.push("/charge-codes");
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
      {isPending ? "Deleting…" : "Delete charge code"}
    </button>
  );
}
