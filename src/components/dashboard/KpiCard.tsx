import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  blue: "bg-chart-1/12 text-chart-1",
  violet: "bg-chart-2/12 text-chart-2",
  green: "bg-chart-3/15 text-chart-3",
  amber: "bg-chart-4/15 text-chart-4",
  red: "bg-chart-5/12 text-chart-5",
  cyan: "bg-chart-6/15 text-chart-6",
} as const;

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
}) {
  return (
    <div className="kpi-gradient flex items-center gap-3 rounded-xl border border-border p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full",
          tones[tone],
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="font-display text-2xl font-bold leading-tight">{value}</p>
        {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}
