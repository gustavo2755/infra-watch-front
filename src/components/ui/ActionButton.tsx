import { type ButtonHTMLAttributes } from "react";
import { Tooltip } from "./Tooltip";

type ActionVariant = "edit" | "attach" | "delete" | "view";

const variantClasses: Record<ActionVariant, string> = {
  edit: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200",
  attach: "bg-sky-100 text-sky-700 hover:bg-sky-200 border-sky-200",
  delete: "bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200",
  view: "bg-violet-100 text-violet-700 hover:bg-violet-200 border-violet-200",
};

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ActionVariant;
  tooltip: string;
}

export function ActionButton({
  variant,
  tooltip,
  className = "",
  children,
  ...props
}: ActionButtonProps) {
  return (
    <Tooltip content={tooltip}>
      <button
        type="button"
        className={`p-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    </Tooltip>
  );
}
