import type { Currency } from "@/lib/types";

const CURRENCY_LOCALES: Record<Currency, string> = {
  IDR: "id-ID",
  USD: "en-US",
};

export function formatCurrency(value: string | number, currency: Currency = "IDR") {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(n);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}
