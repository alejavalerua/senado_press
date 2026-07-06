"use client";

const FILTERS = [
  { id: "todo", label: "Todo" },
  { id: "debate", label: "Debate" },
  { id: "sesion", label: "Sesión" },
  { id: "preguntas", label: "Preguntas" },
  { id: "senadores", label: "Senadores" },
] as const;

export type FeedFilter = (typeof FILTERS)[number]["id"];

interface FeedFiltersProps {
  active: FeedFilter;
  onChange: (filter: FeedFilter) => void;
}

export function FeedFilters({ active, onChange }: FeedFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            active === f.id
              ? "bg-senate-700 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-200 hover:border-senate-300 hover:text-senate-700"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}