export function Logo({ size = "base" }: { size?: "base" | "lg" }) {
  const textSize = size === "lg" ? "text-xl" : "text-base";
  const padding = size === "lg" ? "px-3 py-1.5" : "px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center rounded-2xl bg-gradient-to-br from-white via-zinc-100 to-zinc-800 font-bold tracking-tight text-zinc-700 ${textSize} ${padding}`}
    >
      mEis
    </span>
  );
}
