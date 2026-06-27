# Mini ERP Invoicing System — Frontend

A Next.js (App Router) frontend for the Mini ERP Invoicing System, talking to a separate NestJS + Prisma API.

## Tech stack used

- **Framework:** Next.js 16 (App Router, React Server Components)
- **Styling:** Tailwind CSS, dark theme, hand-rolled components (no UI library)
- **Icons:** `lucide-react`
- **Toasts:** `sonner` — every mutation (create/update/delete, login/logout, status changes, item edits) reports success or failure
- **Auth:** Server Actions call the NestJS `/auth/login` endpoint; the JWT is stored in an `httpOnly` cookie set by the server
- **Route protection:** `proxy.ts` (Next 16's renamed `middleware.ts`) redirects based on session presence
- **Data fetching:** Server Components fetch directly from the NestJS API on the server
- **Mutations:** Server Actions (`"use server"`) wrapping `fetch` calls, with `revalidatePath` to refresh data after writes

## Prerequisites

- Node.js 20+
- The backend (`meis-nestjs`) running locally — see its README. This app expects it at `http://localhost:3000`.

## Installation steps

```bash
npm install
cp .env.example .env.local   # adjust API_URL if your backend runs elsewhere
```

## Running the application locally

```bash
npm run dev
```

The dev server runs on **port 3001** (the backend already uses 3000) — http://localhost:3001.

Log in with a seeded user from the backend, e.g. `admin@meis.test` / `password123`.

## Features

- **Auth** — login/logout, session cookie, route protection, graceful redirect-to-login if a session becomes invalid mid-use.
- **Dashboard** — totals, revenue/outstanding (IDR-equivalent), revenue breakdown by currency, status breakdown, recent invoices.
- **Customers** — search, pagination, create, edit, delete (blocked with a clear error if the customer still has invoices); each customer's own invoice list supports status filter, search, and pagination without a page reload.
- **Charge codes** — simple master list (code, description, default PPN flag) used as a template when adding invoice line items.
- **Invoices** — search, pagination, status filter, multi-currency (IDR/USD) with exchange rate, per-item PPN, a printable PDF-style view, confirmation before status change.
- **One big edit form while `DRAFT`** — due date, notes, currency, and all line items are edited together in a single form (same layout as "New invoice") and saved with one "Save changes" click. Once the invoice leaves `DRAFT`, the page becomes fully read-only — enforced by the backend, not just hidden in the UI.

## Project structure

```
src/
  app/
    login/                  Login page (public)
    api/
      session-expired/      Route Handler that clears a stale session cookie
      customers/[id]/invoices/  Route Handler proxying the invoice list (used by the client-side filter panel)
    (app)/                  Authenticated route group, shared nav layout
      dashboard/            Summary cards, revenue by currency, status breakdown, recent invoices
      customers/            List (search + pagination), create, detail/edit, delete
      charge-codes/         List + search, create, edit/delete
      invoices/             List (search + status filter + pagination), create, detail (big edit form while draft)
      invoices/[id]/print/   Print-friendly invoice view (outside the app shell), "Save as PDF" via the browser
  components/                Reusable UI: StatusBadge, StatCard, Select, Pagination, SearchBox,
                              forms (CustomerForm, ChargeCodeForm, InvoiceForm, InvoiceEditForm),
                              StatusSelect, CustomerInvoicesPanel, PrintButton, Logo
  lib/
    api.ts                  Server-only fetch wrapper, attaches JWT, throws ApiError, handles 401 redirect
    session.ts              Cookie-based session helpers (httpOnly)
    actions/                Server Actions for auth, customers, charge-codes, invoices
    types.ts                Types mirroring backend DTOs, incl. Paginated<T>
    format.ts                Currency (per-invoice IDR/USD) and date formatting
  proxy.ts                  Route protection (redirect unauthenticated/authenticated users)
```

## Architectural decisions & assumptions

- **No client-side API calls to the backend.** The browser never talks to the NestJS API directly — only this Next.js server does (via Server Components and Server Actions), which avoids CORS configuration and keeps the JWT out of client-accessible storage.
- **Session cookie is `httpOnly` + `sameSite=lax`**, set/cleared only by Server Actions, never by client code.
- **Exception — the customer invoice filter panel:** to let status/search/pagination update without a page reload, it fetches from a same-origin Next.js Route Handler (`/api/customers/[id]/invoices`), which itself calls the backend server-side and forwards the cookie-based token. The browser still never sees the JWT.
- **Stale-session recovery:** if an API call returns 401, `apiFetch` redirects through `/api/session-expired` — a Route Handler, since clearing cookies isn't allowed from a Server Component render.
- **Server Actions are split per feature** (`lib/actions/auth.ts`, `customers.ts`, `invoices.ts`), mirroring the backend's module boundaries.
- **No client-side data library (SWR/React Query).** Reads happen in Server Components and writes happen via Server Actions with `revalidatePath`; the one client-fetching exception above manages its own local state instead.
- **Plain Tailwind components, no UI library** — kept intentionally small and composable.
- **Currency formatting follows the invoice**, not a fixed locale — `formatCurrency(amount, currency)` switches between `id-ID`/IDR and `en-US`/USD per invoice.
- **Exchange rate and VAT rate are snapshotted per invoice on the backend**, not recomputed from a "current" value — the UI just displays/edits whatever was stored, so it always matches what the backend will calculate.
- **The draft edit form saves everything in one submit, not field-by-field.** The action diffs submitted line items against the invoice's original ones (creates new rows, updates changed ones, then deletes removed ones last) so it never trips the backend's "an invoice needs at least one item" rule, even when every line is replaced in the same save.
- **The print view is a separate route outside the `(app)` layout** (`/invoices/[id]/print`), so it renders without the dashboard nav/sidebar. "Save as PDF" is just the browser's native print dialog — no PDF library on either side.

## Notes on Next.js 16

This project pins Next.js 16, which has a few breaking changes worth knowing about:

- `middleware.ts` is renamed to `proxy.ts` (same behavior, new name).
- The new "Cache Components" caching model is **off** in this project — all data fetching uses `cache: "no-store"`, since this is an admin CRUD app where fresh data matters more than caching.
