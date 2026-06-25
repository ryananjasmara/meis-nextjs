"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import type { Customer } from "@/lib/types";

export type CustomerFormState = { error?: string } | undefined;

function customerPayload(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  return {
    name,
    email: email || undefined,
    phone: phone || undefined,
    address: address || undefined,
  };
}

export async function createCustomerAction(
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const payload = customerPayload(formData);
  if (!payload.name) {
    return { error: "Name is required." };
  }

  let customer: Customer;
  try {
    customer = await apiFetch<Customer>("/customers", { method: "POST", body: payload });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Could not create customer." };
  }

  revalidatePath("/customers");
  redirect(`/customers/${customer.id}`);
}

export async function updateCustomerAction(
  id: string,
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const payload = customerPayload(formData);
  if (!payload.name) {
    return { error: "Name is required." };
  }

  try {
    await apiFetch<Customer>(`/customers/${id}`, { method: "PATCH", body: payload });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Could not update customer." };
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}

export async function deleteCustomerAction(id: string) {
  await apiFetch(`/customers/${id}`, { method: "DELETE" });
  revalidatePath("/customers");
  redirect("/customers");
}
