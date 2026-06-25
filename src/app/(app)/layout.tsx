import Link from "next/link";
import { FileStack, LayoutDashboard, LogOut, Receipt, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { logoutAction } from "@/lib/actions/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2 text-base font-semibold text-zinc-50">
              <Receipt className="size-5" />
              Mini ERP
            </span>
            <nav className="flex gap-6 text-sm font-medium text-zinc-400">
              <Link href="/dashboard" className="flex items-center gap-1.5 hover:text-zinc-50">
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
              <Link href="/customers" className="flex items-center gap-1.5 hover:text-zinc-50">
                <Users className="size-4" />
                Customers
              </Link>
              <Link href="/invoices" className="flex items-center gap-1.5 hover:text-zinc-50">
                <FileStack className="size-4" />
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
              <button
                type="submit"
                className="flex items-center gap-1.5 font-medium text-zinc-50 hover:underline"
              >
                <LogOut className="size-4" />
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
