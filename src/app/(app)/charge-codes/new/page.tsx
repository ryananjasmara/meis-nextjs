import { createChargeCodeAction } from "@/lib/actions/charge-codes";
import { ChargeCodeForm } from "@/components/charge-code-form";

export default function NewChargeCodePage() {
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-50">New charge code</h1>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
        <ChargeCodeForm action={createChargeCodeAction} submitLabel="Create charge code" />
      </div>
    </div>
  );
}
