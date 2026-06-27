"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import type { Currency, Invoice, InvoiceStatus } from "@/lib/types";

export type InvoiceFormState = { error?: string; invoiceId?: string; success?: boolean } | undefined;

export async function createInvoiceAction(
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const customerId = String(formData.get("customerId") ?? "");
  const dueDate = String(formData.get("dueDate") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const currency = String(formData.get("currency") ?? "IDR");
  const exchangeRate = Number(formData.get("exchangeRate") ?? 1);

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
      body: { customerId, dueDate, notes: notes || undefined, currency, exchangeRate, items },
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Could not create invoice." };
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { invoiceId: invoice.id };
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
  return { success: true };
}

export async function removeInvoiceItemAction(invoiceId: string, itemId: string) {
  await apiFetch<Invoice>(`/invoices/${invoiceId}/items/${itemId}`, { method: "DELETE" });
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/dashboard");
}

export async function updateInvoiceDueDateAction(invoiceId: string, dueDate: string) {
  await apiFetch<Invoice>(`/invoices/${invoiceId}`, { method: "PATCH", body: { dueDate } });
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

export async function updateInvoiceCurrencyAction(
  invoiceId: string,
  currency: Currency,
  exchangeRate: number,
) {
  await apiFetch<Invoice>(`/invoices/${invoiceId}`, {
    method: "PATCH",
    body: { currency, exchangeRate },
  });
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

export async function updateInvoiceNotesAction(invoiceId: string, notes: string) {
  await apiFetch<Invoice>(`/invoices/${invoiceId}`, { method: "PATCH", body: { notes } });
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function updateInvoiceItemAction(
  invoiceId: string,
  itemId: string,
  payload: { description: string; quantity: number; unitPrice: number },
) {
  await apiFetch<Invoice>(`/invoices/${invoiceId}/items/${itemId}`, {
    method: "PATCH",
    body: payload,
  });
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/dashboard");
}
