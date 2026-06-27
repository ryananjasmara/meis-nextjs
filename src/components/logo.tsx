import { Archivo_Black } from "next/font/google";

const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: ["400"] });

export function Logo({ size = "base" }: { size?: "base" | "lg" }) {
  const textSize = size === "lg" ? "text-xl" : "text-base";
  const padding = size === "lg" ? "px-3 py-1.5" : "px-2.5 py-1";

  return (
    <span
      className={`${archivoBlack.className} inline-flex items-center rounded-xl bg-gradient-to-br from-white via-white-100 to-zinc-700 tracking-tight text-zinc-700 ${textSize} ${padding}`}
    >
      mEis
    </span>
  );
}
