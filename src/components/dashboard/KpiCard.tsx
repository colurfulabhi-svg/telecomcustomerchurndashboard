import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  info,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  hint?: string;
  info?: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
}) {
  return (
    <div className="kpi-gradient flex items-start gap-3 rounded-xl border border-border p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full",
          tones[tone],
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-1">
          <p className="min-w-0 flex-1 text-xs font-semibold uppercase leading-snug tracking-wide text-muted-foreground">
            {label}
          </p>
          {info ? (
            <Popover>
              <PopoverTrigger
                aria-label={`About ${label}`}
                className="-mr-1 -mt-0.5 shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Info className="size-3.5" />
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 text-xs leading-relaxed">
                <p className="mb-1 font-semibold">{label}</p>
                <p className="text-muted-foreground">{info}</p>
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
        <p className="font-display break-words text-xl font-bold leading-tight sm:text-2xl">
          {value}
        </p>
        {hint ? (
          <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
