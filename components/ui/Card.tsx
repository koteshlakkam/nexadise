import { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {title ? <h3 className="mb-3 text-sm font-semibold text-slate-700">{title}</h3> : null}
      {children}
    </section>
  );
}
