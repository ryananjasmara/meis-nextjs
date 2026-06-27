import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { updateChargeCodeAction } from "@/lib/actions/charge-codes";
import { ChargeCodeForm } from "@/components/charge-code-form";
import { DeleteChargeCodeButton } from "@/components/delete-charge-code-button";
import type { ChargeCode } from "@/lib/types";

export default async function ChargeCodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let chargeCode: ChargeCode;
  try {
    chargeCode = await apiFetch<ChargeCode>(`/charge-codes/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const boundUpdate = updateChargeCodeAction.bind(null, id);

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-50">{chargeCode.code}</h1>
        <DeleteChargeCodeButton chargeCodeId={id} />
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
        <ChargeCodeForm action={boundUpdate} chargeCode={chargeCode} submitLabel="Save changes" />
      </div>
    </div>
  );
}
