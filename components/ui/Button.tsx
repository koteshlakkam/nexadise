import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  variant?: Variant;
  size?: Size;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 ease-out " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-1 " +
  "disabled:cursor-not-allowed disabled:opacity-50 select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink-900 text-white shadow-soft hover:bg-ink-800 active:scale-[0.98] active:bg-ink-900",
  secondary:
    "bg-white text-ink-900 border border-ink-200 shadow-xs hover:bg-ink-50 hover:border-ink-300 active:scale-[0.98]",
  ghost:
    "bg-transparent text-ink-700 hover:bg-ink-100 hover:text-ink-900 active:scale-[0.98]",
  outline:
    "bg-transparent text-ink-900 border border-ink-300 hover:border-ink-400 hover:bg-ink-50 active:scale-[0.98]",
  danger:
    "bg-rose-600 text-white shadow-soft hover:bg-rose-700 active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    isLoading = false,
    variant = "primary",
    size = "md",
    leadingIcon,
    trailingIcon,
    fullWidth = false,
    className = "",
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner />
          <span>Loading…</span>
        </>
      ) : (
        <>
          {leadingIcon ? <span className="shrink-0">{leadingIcon}</span> : null}
          <span>{children}</span>
          {trailingIcon ? <span className="shrink-0">{trailingIcon}</span> : null}
        </>
      )}
    </button>
  );
});

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 animate-spin"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
    </svg>
  );
}
