import { AlertTriangle, CheckCircle2, CircleDashed, Send, XCircle, type LucideIcon } from "lucide-react";
import type { InvoiceStatus } from "@/lib/types";

const STYLES: Record<InvoiceStatus, string> = {
  DRAFT: "bg-zinc-800 text-zinc-300",
  SENT: "bg-blue-950 text-blue-300",
  PAID: "bg-green-950 text-green-300",
  OVERDUE: "bg-red-950 text-red-300",
  CANCELLED: "bg-zinc-800 text-zinc-500 line-through",
};

const ICONS: Record<InvoiceStatus, LucideIcon> = {
  DRAFT: CircleDashed,
  SENT: Send,
  PAID: CheckCircle2,
  OVERDUE: AlertTriangle,
  CANCELLED: XCircle,
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const Icon = ICONS[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      <Icon className="size-3" />
      {status}
    </span>
  );
}
