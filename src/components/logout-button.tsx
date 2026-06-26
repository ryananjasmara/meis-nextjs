"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function logout() {
    startTransition(async () => {
      await logoutAction();
      toast.success("Logged out.");
      router.push("/login");
    });
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={isPending}
      className="flex items-center gap-1.5 font-medium text-zinc-50 hover:underline disabled:opacity-50"
    >
      <LogOut className="size-4" />
      Log out
    </button>
  );
}
