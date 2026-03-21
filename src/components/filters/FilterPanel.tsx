import { useState, type ReactNode } from "react";
import { Filter, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui/Button";

interface FilterPanelProps {
  title?: string;
  children: ReactNode;
  onClear: () => void;
}

export function FilterPanel({
  title = "Filters",
  children,
  onClear,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-gray-200 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
        {isExpanded && (
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>
      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
