import { RotateCcw, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { emptyFilters, filterOptions, type Filters } from "@/lib/dashboard-data";

const fields: { key: keyof Filters; label: string; options: string[] }[] = [
  { key: "segment", label: "Customer Segment", options: filterOptions.segment },
  { key: "gender", label: "Gender", options: filterOptions.gender },
  { key: "state", label: "State", options: filterOptions.state },
  { key: "contractType", label: "Contract Type", options: filterOptions.contractType },
  { key: "paymentMethod", label: "Payment Method", options: filterOptions.paymentMethod },
  { key: "internet", label: "Internet Service", options: filterOptions.internet },
  { key: "churnStatus", label: "Churn Status", options: filterOptions.churnStatus },
];

export function FilterPanel({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const activeCount = Object.values(filters).filter((v) => v !== "All").length;

  return (
    <aside className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Filter className="size-4 text-primary" />
        <h2 className="font-display text-sm font-bold uppercase tracking-wide">Filters</h2>
        {activeCount > 0 ? (
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {activeCount}
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {field.label}
            </label>
            <Select
              value={filters[field.key]}
              onValueChange={(value) => onChange({ ...filters, [field.key]: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {field.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        className="mt-4 w-full"
        onClick={() => onChange(emptyFilters)}
      >
        <RotateCcw className="size-4" /> Clear All Filters
      </Button>
    </aside>
  );
}
