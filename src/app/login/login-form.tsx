"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state?.email ?? ""}
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
          placeholder="admin@meis.test"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
          placeholder="••••••••"
        />
      </div>
      {state?.error && (
        <p className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-300">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
