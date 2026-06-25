import type { InvoiceStatus } from "@/lib/types";

const STYLES: Record<InvoiceStatus, string> = {
  DRAFT: "bg-zinc-800 text-zinc-300",
  SENT: "bg-blue-950 text-blue-300",
  PAID: "bg-green-950 text-green-300",
  OVERDUE: "bg-red-950 text-red-300",
  CANCELLED: "bg-zinc-800 text-zinc-500 line-through",
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
