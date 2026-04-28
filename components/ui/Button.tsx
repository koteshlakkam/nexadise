import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({ children, isLoading = false, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-lg bg-[#FF8400] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#E67600] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
