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
  const chargeCodeIds = formData.getAll("chargeCodeId").map(String);
  const isTaxables = formData.getAll("isTaxable").map((v) => v === "true");

  const items = descriptions
    .map((description, i) => ({
      description: description.trim(),
      quantity: quantities[i],
      unitPrice: unitPrices[i],
      chargeCodeId: chargeCodeIds[i] || undefined,
      isTaxable: isTaxables[i],
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

export async function updateInvoiceFullAction(
  invoiceId: string,
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const dueDate = String(formData.get("dueDate") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const currency = String(formData.get("currency") ?? "IDR") as Currency;
  const exchangeRate = Number(formData.get("exchangeRate") ?? 1);

  const itemIds = formData.getAll("itemId").map(String);
  const descriptions = formData.getAll("description").map(String);
  const quantities = formData.getAll("quantity").map(Number);
  const unitPrices = formData.getAll("unitPrice").map(Number);
  const chargeCodeIds = formData.getAll("chargeCodeId").map(String);
  const isTaxables = formData.getAll("isTaxable").map((v) => v === "true");
  const originalItemIds = formData.getAll("originalItemId").map(String);

  const rows = itemIds
    .map((itemId, i) => ({
      itemId: itemId || undefined,
      description: descriptions[i].trim(),
      quantity: quantities[i],
      unitPrice: unitPrices[i],
      chargeCodeId: chargeCodeIds[i] || undefined,
      isTaxable: isTaxables[i],
    }))
    .filter((row) => row.description && row.quantity > 0 && row.unitPrice >= 0);

  if (!dueDate) {
    return { error: "Due date is required." };
  }
  if (rows.length === 0) {
    return { error: "At least one valid line item is required." };
  }

  try {
    await apiFetch<Invoice>(`/invoices/${invoiceId}`, {
      method: "PATCH",
      body: { dueDate, notes: notes || undefined, currency, exchangeRate },
    });

    for (const row of rows.filter((r) => !r.itemId)) {
      await apiFetch<Invoice>(`/invoices/${invoiceId}/items`, {
        method: "POST",
        body: {
          description: row.description,
          quantity: row.quantity,
          unitPrice: row.unitPrice,
          chargeCodeId: row.chargeCodeId,
          isTaxable: row.isTaxable,
        },
      });
    }

    for (const row of rows.filter((r) => r.itemId)) {
      await apiFetch<Invoice>(`/invoices/${invoiceId}/items/${row.itemId}`, {
        method: "PATCH",
        body: {
          description: row.description,
          quantity: row.quantity,
          unitPrice: row.unitPrice,
          chargeCodeId: row.chargeCodeId,
          isTaxable: row.isTaxable,
        },
      });
    }

    const keptIds = new Set(rows.map((r) => r.itemId).filter(Boolean));
    for (const id of originalItemIds.filter((id) => !keptIds.has(id))) {
      await apiFetch<Invoice>(`/invoices/${invoiceId}/items/${id}`, { method: "DELETE" });
    }
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Could not update invoice." };
  }

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { success: true };
}
