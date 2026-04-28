import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeTone =
  | "slate"
  | "gray"
  | "red"
  | "amber"
  | "yellow"
  | "emerald"
  | "green"
  | "teal"
  | "cyan"
  | "blue"
  | "indigo"
  | "violet"
  | "pink"
  | "brand";

const toneClass: Record<BadgeTone, string> = {
  slate: "bg-ink-100 text-ink-700 ring-ink-200",
  gray: "bg-gray-100 text-gray-700 ring-gray-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200/70",
  amber: "bg-amber-50 text-amber-800 ring-amber-200/70",
  yellow: "bg-yellow-50 text-yellow-800 ring-yellow-200/70",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  green: "bg-green-50 text-green-700 ring-green-200/70",
  teal: "bg-teal-50 text-teal-700 ring-teal-200/70",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-200/70",
  blue: "bg-blue-50 text-blue-700 ring-blue-200/70",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
  violet: "bg-violet-50 text-violet-700 ring-violet-200/70",
  pink: "bg-pink-50 text-pink-700 ring-pink-200/70",
  brand: "bg-brand-50 text-brand-700 ring-brand-200/70",
};

export function Badge({
  children,
  tone = "slate",
  className = "",
  dot = false,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-2xs font-medium ring-1 ring-inset",
        toneClass[tone],
        className,
      )}
    >
      {dot ? (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "emerald" || tone === "green" ? "bg-emerald-500" :
            tone === "red" ? "bg-rose-500" :
            tone === "amber" || tone === "yellow" ? "bg-amber-500" :
            tone === "blue" || tone === "cyan" ? "bg-blue-500" :
            tone === "indigo" || tone === "violet" ? "bg-indigo-500" :
            tone === "brand" ? "bg-brand-500" :
            tone === "pink" ? "bg-pink-500" :
            tone === "teal" ? "bg-teal-500" :
            "bg-ink-400"
          )}
        />
      ) : null}
      {children}
    </span>
  );
}
