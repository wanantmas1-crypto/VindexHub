import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "btn-sheen bg-primary text-primary-fg shadow-sm shadow-primary/20 hover:opacity-95 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/25",
  secondary: "bg-surface text-text border border-border hover:bg-slate-100 dark:hover:bg-slate-800 hover:-translate-y-0.5",
  ghost: "bg-transparent text-text hover:bg-slate-100 dark:hover:bg-slate-800",
  danger: "btn-sheen bg-danger text-white hover:opacity-95 hover:-translate-y-0.5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
