import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "danger" | "muted";

const styles: Record<Variant, string> = {
  default: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  success: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  danger: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  muted: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", styles[variant], className)}>
      {children}
    </span>
  );
}
