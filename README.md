# Mini ERP Invoicing System — Frontend

A Next.js (App Router) frontend for the Mini ERP Invoicing System, talking to a separate NestJS + Prisma API.

## Tech stack

- **Framework:** Next.js 16 (App Router, React Server Components)
- **Styling:** Tailwind CSS, dark theme, hand-rolled components (no UI library)
- **Icons:** `lucide-react`
- **Toasts:** `sonner` — every mutation (create/update/delete, login/logout, status changes, item edits) reports success or failure as a toast
- **Auth:** Server Actions call the NestJS `/auth/login` endpoint; the returned JWT is stored in an `httpOnly` cookie set by the server (never exposed to client JS)
- **Route protection:** `proxy.ts` (Next 16's renamed `middleware.ts`) redirects based on session presence
- **Data fetching:** Server Components fetch directly from the NestJS API on the server (no client-side waterfalls, no CORS exposure)
- **Mutations:** Server Actions (`"use server"`) wrapping `fetch` calls to the API, with `revalidatePath` to refresh data after writes

## Prerequisites

- Node.js 20+
- The backend (`meis-nestjs`) running locally — see its README. This app expects it at `http://localhost:3000`.

## Setup

```bash
npm install
cp .env.example .env.local   # adjust API_URL if your backend runs elsewhere
npm run dev
```

The dev server runs on **port 3001** (the backend already uses 3000) — http://localhost:3001.

Log in with a seeded user from the backend, e.g. `admin@meis.test` / `password123`.

## Features

- **Auth** — login/logout, session cookie, route protection, and a graceful redirect-to-login if a session becomes invalid mid-use (e.g. token expiry, or the user it belonged to no longer existing after a backend reset).
- **Dashboard** — totals, revenue/outstanding, status breakdown, recent invoices.
- **Customers** — search, pagination, create, inline edit, delete.
- **Invoices** — search, pagination, status filter pills, create with dynamic line items, detail view, and a confirmation dialog before any status change.
- **Draft-only inline editing** — while an invoice is `DRAFT`, its due date, notes, and line items (add/edit/remove) are editable directly on the detail page. Once it leaves `DRAFT`, all of that becomes read-only — enforced by the backend, not just hidden in the UI.

## Project structure

```
src/
  app/
    login/              Login page (public)
    api/session-expired/ Route Handler that clears a stale session cookie and redirects to /login
    (app)/              Authenticated route group, shared nav layout
      dashboard/        Summary cards, status breakdown, recent invoices
      customers/        List (search + pagination), create, detail/edit, delete
      invoices/         List (search + status filter + pagination), create, detail (draft-only inline editing)
  components/           Reusable UI: StatusBadge, StatCard, Select, Pagination, SearchBox,
                        forms (CustomerForm, InvoiceForm, AddItemForm), inline editors
                        (EditableDueDate, EditableNotes, EditableItemRow, StatusSelect), Logo
  lib/
    api.ts              Server-only fetch wrapper, attaches JWT, throws ApiError, handles 401 redirect
    session.ts           Cookie-based session helpers (httpOnly)
    actions/             Server Actions for auth, customers, invoices
    types.ts             Types mirroring backend DTOs, incl. Paginated<T>
    format.ts            Currency (Rupiah) and date formatting
  proxy.ts               Route protection (redirect unauthenticated/authenticated users)
```

## Architectural decisions & assumptions

- **No client-side API calls.** The browser never talks to the NestJS API directly — only this Next.js server does (via Server Components and Server Actions). This avoids CORS configuration entirely and keeps the JWT out of client-accessible storage.
- **Session cookie is `httpOnly` + `sameSite=lax`.** Set/cleared only by Server Actions (`login`/`logout`), never by client code.
- **`proxy.ts` does an optimistic check only** (cookie presence, not signature verification) — actual authorization is enforced by the NestJS API on every request, which is the real security boundary.
- **Stale-session recovery:** if an API call returns 401 (expired/invalid token, or the underlying user no longer exists), `apiFetch` redirects through `/api/session-expired` — a Route Handler, since clearing cookies isn't allowed from a Server Component render, only from a Server Action or Route Handler.
- **Mutations that used to redirect server-side now return a result instead** (e.g. `{ customerId }` / `{ invoiceId }` / `{ error }`), so the client component can show a toast *before* navigating. A `useRef` guard on the returned state prevents the toast from firing twice under React Strict Mode's dev-only double-invoked effects.
- **Server Actions are split per feature** (`lib/actions/auth.ts`, `customers.ts`, `invoices.ts`), mirroring the backend's module boundaries — consistent with this being one piece of a system designed to split into microservices/micro-frontends later.
- **No client-side data library (SWR/React Query).** Since all reads happen in Server Components and writes happen via Server Actions with `revalidatePath`, there's no client cache to manage.
- **Plain Tailwind components, no UI library** — `StatusBadge`, `StatCard`, `Select`, `Pagination`, `SearchBox`, and the form/inline-editor components are the reusable building blocks, kept intentionally small.
- **Search and pagination are plain GET forms/links** (no client JS required for the base case) — `?search=`, `?status=`, and `?page=` compose together and are preserved across navigation.
- **Currency is formatted as Indonesian Rupiah** (`Intl.NumberFormat("id-ID", { currency: "IDR" })`), matching the seeded data.

## Notes on Next.js 16

This project pins Next.js 16, which has a few breaking changes from earlier versions worth knowing about if you've used Next.js before:

- `middleware.ts` is renamed to `proxy.ts` (same behavior, new name).
- The new "Cache Components" caching model (`cacheComponents` in `next.config.ts`) is **off** in this project — all data fetching uses standard per-request rendering (`cache: "no-store"`), since this is an admin CRUD app where fresh data matters more than caching.
