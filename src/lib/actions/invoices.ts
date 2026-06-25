"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import type { Invoice, InvoiceStatus } from "@/lib/types";

export type InvoiceFormState = { error?: string } | undefined;

export async function createInvoiceAction(
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const customerId = String(formData.get("customerId") ?? "");
  const dueDate = String(formData.get("dueDate") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  const descriptions = formData.getAll("description").map(String);
  const quantities = formData.getAll("quantity").map(Number);
  const unitPrices = formData.getAll("unitPrice").map(Number);

  const items = descriptions
    .map((description, i) => ({
      description: description.trim(),
      quantity: quantities[i],
      unitPrice: unitPrices[i],
    }))
    .filter((item) => item.description && item.quantity > 0 && item.unitPrice >= 0);

  if (!customerId || !dueDate) {
    return { error: "Customer and due date are required." };
  }
  if (items.length === 0) {
    return { error: "At least one valid line item is required." };
  }

  let invoice: Invoice;
  try {
    invoice = await apiFetch<Invoice>("/invoices", {
      method: "POST",
      body: { customerId, dueDate, notes: notes || undefined, items },
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Could not create invoice." };
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoiceStatusAction(id: string, status: InvoiceStatus) {
  await apiFetch<Invoice>(`/invoices/${id}/status`, { method: "PATCH", body: { status } });
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

export async function addInvoiceItemAction(
  invoiceId: string,
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const description = String(formData.get("description") ?? "").trim();
  const quantity = Number(formData.get("quantity"));
  const unitPrice = Number(formData.get("unitPrice"));

  if (!description || !quantity || quantity <= 0 || Number.isNaN(unitPrice) || unitPrice < 0) {
    return { error: "Enter a description, a positive quantity, and a valid unit price." };
  }

  try {
    await apiFetch<Invoice>(`/invoices/${invoiceId}/items`, {
      method: "POST",
      body: { description, quantity, unitPrice },
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Could not add item." };
  }

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/dashboard");
}

export async function removeInvoiceItemAction(invoiceId: string, itemId: string) {
  await apiFetch<Invoice>(`/invoices/${invoiceId}/items/${itemId}`, { method: "DELETE" });
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/dashboard");
}
