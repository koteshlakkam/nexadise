import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
  interactive?: boolean;
}

export function Card({
  title,
  description,
  action,
  children,
  className = "",
  padded = true,
  interactive = false,
}: CardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-ink-200 bg-white shadow-xs",
        interactive && "transition-all duration-200 hover:shadow-soft hover:border-ink-300",
        className,
      )}
    >
      {(title || action) && (
        <header
          className={cn(
            "flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4",
          )}
        >
          <div className="min-w-0">
            {title ? (
              <h3 className="text-sm font-semibold tracking-tightish text-ink-900">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-xs text-ink-500">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      )}
      <div className={cn(padded ? "p-5" : "")}>{children}</div>
    </section>
  );
}
