import Link from "next/link";
import { FileStack, LayoutDashboard, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";
import { Logo } from "@/components/logo";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Logo />
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
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
