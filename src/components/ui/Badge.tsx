import { type ReactNode } from "react";

type Variant = "success" | "danger" | "warning" | "info";

const variantClasses: Record<Variant, string> = {
  success: "bg-green-100 text-green-800",
  danger: "bg-red-100 text-red-800",
  warning: "bg-amber-100 text-amber-800",
  info: "bg-blue-100 text-blue-800",
};

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  icon?: ReactNode;
}

export function Badge({ variant = "info", children, icon }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {icon}
      {children}
    </span>
  );
}
