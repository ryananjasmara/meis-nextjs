import { Logo } from "@/components/logo";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 p-8 shadow-sm">
        <Logo size="lg" />
        <p className="mt-2 text-sm text-zinc-400">Sign in to manage invoices.</p>
        <LoginForm />
      </div>
    </div>
  );
}
