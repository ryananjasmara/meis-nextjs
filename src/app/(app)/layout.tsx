import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { logoutAction } from "@/lib/actions/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="text-base font-semibold text-zinc-50">Mini ERP</span>
            <nav className="flex gap-6 text-sm font-medium text-zinc-400">
              <Link href="/dashboard" className="hover:text-zinc-50">
                Dashboard
              </Link>
              <Link href="/customers" className="hover:text-zinc-50">
                Customers
              </Link>
              <Link href="/invoices" className="hover:text-zinc-50">
                Invoices
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            {user && (
              <span>
                {user.name} <span className="text-zinc-500">({user.role})</span>
              </span>
            )}
            <form action={logoutAction}>
              <button type="submit" className="font-medium text-zinc-50 hover:underline">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
