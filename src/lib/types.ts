export type Role = "ADMIN" | "STAFF";

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "DRAFT",
  "SENT",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
  invoiceId: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  totalAmount: string;
  notes: string | null;
  customerId: string;
  createdById: string;
  customer: Customer;
  items: InvoiceItem[];
};

export type DashboardSummary = {
  totalCustomers: number;
  totalInvoices: number;
  totalRevenue: string;
  outstandingAmount: string;
  invoicesByStatus: Record<InvoiceStatus, number>;
  recentInvoices: Invoice[];
};
