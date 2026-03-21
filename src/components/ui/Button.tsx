import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "danger" | "success" | "secondary";
type Size = "sm" | "md";

const variantClasses: Record<Variant, string> = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  success: "bg-green-600 hover:bg-green-700 text-white",
  secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-2 py-1 text-sm rounded",
  md: "px-4 py-2 text-base rounded-md",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`font-medium transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
