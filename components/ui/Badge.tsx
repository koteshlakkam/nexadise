import { ReactNode } from "react";

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
  | "pink";

const toneClass: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  gray: "bg-gray-100 text-gray-700 ring-gray-200",
  red: "bg-rose-100 text-rose-700 ring-rose-200",
  amber: "bg-amber-100 text-amber-800 ring-amber-200",
  yellow: "bg-yellow-100 text-yellow-800 ring-yellow-200",
  emerald: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  green: "bg-green-100 text-green-800 ring-green-200",
  teal: "bg-teal-100 text-teal-800 ring-teal-200",
  cyan: "bg-cyan-100 text-cyan-800 ring-cyan-200",
  blue: "bg-blue-100 text-blue-800 ring-blue-200",
  indigo: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  violet: "bg-violet-100 text-violet-800 ring-violet-200",
  pink: "bg-pink-100 text-pink-800 ring-pink-200",
};

export function Badge({
  children,
  tone = "slate",
  className = "",
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        toneClass[tone],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

