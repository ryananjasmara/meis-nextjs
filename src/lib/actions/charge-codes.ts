"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import type { ChargeCode } from "@/lib/types";

export type ChargeCodeFormState = { error?: string; chargeCodeId?: string } | undefined;

function chargeCodePayload(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isTaxable = formData.get("isTaxable") === "on";

  return { code, description, isTaxable };
}

export async function createChargeCodeAction(
  _prevState: ChargeCodeFormState,
  formData: FormData,
): Promise<ChargeCodeFormState> {
  const payload = chargeCodePayload(formData);
  if (!payload.code || !payload.description) {
    return { error: "Code and description are required." };
  }

  let chargeCode: ChargeCode;
  try {
    chargeCode = await apiFetch<ChargeCode>("/charge-codes", { method: "POST", body: payload });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Could not create charge code." };
  }

  revalidatePath("/charge-codes");
  return { chargeCodeId: chargeCode.id };
}

export async function updateChargeCodeAction(
  id: string,
  _prevState: ChargeCodeFormState,
  formData: FormData,
): Promise<ChargeCodeFormState> {
  const payload = chargeCodePayload(formData);
  if (!payload.code || !payload.description) {
    return { error: "Code and description are required." };
  }

  try {
    await apiFetch<ChargeCode>(`/charge-codes/${id}`, { method: "PATCH", body: payload });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Could not update charge code." };
  }

  revalidatePath("/charge-codes");
  revalidatePath(`/charge-codes/${id}`);
  return { chargeCodeId: id };
}

export async function deleteChargeCodeAction(id: string): Promise<{ error?: string }> {
  try {
    await apiFetch(`/charge-codes/${id}`, { method: "DELETE" });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Could not delete charge code." };
  }

  revalidatePath("/charge-codes");
  return {};
}
