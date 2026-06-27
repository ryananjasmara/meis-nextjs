export type Role = "ADMIN" | "STAFF";

export type Currency = "IDR" | "USD";

export const CURRENCIES: Currency[] = ["IDR", "USD"];

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
  currency: Currency;
  exchangeRate: string;
  totalAmount: string;
  notes: string | null;
  customerId: string;
  createdById: string;
  customer: Customer;
  items: InvoiceItem[];
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type CurrencyBreakdown = Record<Currency, { paid: string; outstanding: string }>;

export type DashboardSummary = {
  totalCustomers: number;
  totalInvoices: number;
  totalRevenue: string;
  outstandingAmount: string;
  revenueByCurrency: CurrencyBreakdown;
  invoicesByStatus: Record<InvoiceStatus, number>;
  recentInvoices: Invoice[];
};
