interface SpinnerProps {
  size?: "sm" | "md";
}

export function Spinner({ size = "md" }: SpinnerProps) {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-8 h-8";
  return (
    <div
      className={`${sizeClass} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
      role="status"
      aria-label="Carregando"
    />
  );
}
