import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  subtitle,
  children,
  className,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <header className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-primary">
            {title}
          </h3>
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
