import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  perPage,
  total,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-slate-200/80 bg-slate-50/80 rounded-b-lg">
      <p className="text-sm text-slate-600">
        Showing {start} to {end} of {total}
        {totalPages > 1 && (
          <span className="text-slate-500"> · Page {page} of {totalPages}</span>
        )}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-[2.25rem] h-9 px-2.5 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-sky-200/90 text-sky-800 shadow-sm border border-sky-300/60"
                  : "bg-white/80 text-slate-600 hover:bg-sky-50/80 border border-slate-200/80 hover:border-sky-200/60"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
