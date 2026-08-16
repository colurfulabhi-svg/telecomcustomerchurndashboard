import { LifeBuoy, Clock, CheckCheck, Star } from "lucide-react";
import { ChartCard } from "../ChartCard";
import { KpiCard } from "../KpiCard";
import { Donut, HorizontalBars, TrendChart, VerticalBars } from "../Charts";
import {
  countBy,
  formatNumber,
  monthlySeries,
  toSortedArray,
  type Scope,
} from "@/lib/dashboard-data";

export function SupportView({ scope }: { scope: Scope }) {
  const tickets = scope.tickets;
  const resolved = tickets.filter((t) => t.resolved);
  const withHours = tickets.filter((t) => t.hours != null);
  const avgHours = withHours.length
    ? withHours.reduce((a, t) => a + (t.hours ?? 0), 0) / withHours.length
    : 0;
  const withScore = tickets.filter((t) => t.score != null);
  const avgScore = withScore.length
    ? withScore.reduce((a, t) => a + (t.score ?? 0), 0) / withScore.length
    : 0;

  const byIssue = toSortedArray(countBy(tickets, (t) => t.issue));
  const byPriority = toSortedArray(countBy(tickets, (t) => t.priority));
  const scoreDist = [1, 2, 3, 4, 5].map((s) => ({
    name: `${s} ★`,
    value: tickets.filter((t) => t.score === s).length,
  }));
  const resolutionMix = [
    { name: "Resolved", value: resolved.length },
    { name: "Open", value: tickets.length - resolved.length },
  ];
  const trend = monthlySeries(
    tickets,
    (t) => t.date,
    () => 1,
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Tickets"
          value={formatNumber(tickets.length)}
          icon={LifeBuoy}
          tone="blue"
        />
        <KpiCard
          label="Resolution Rate"
          value={`${tickets.length ? ((resolved.length / tickets.length) * 100).toFixed(1) : "0"}%`}
          icon={CheckCheck}
          tone="green"
        />
        <KpiCard
          label="Avg Resolution Time"
          value={`${avgHours.toFixed(1)} hrs`}
          icon={Clock}
          tone="amber"
        />
        <KpiCard
          label="Avg Satisfaction"
          value={`${avgScore.toFixed(2)} / 5`}
          icon={Star}
          tone="cyan"
        />
      </div>

      <ChartCard title="Ticket Volume Over Time" subtitle="Tickets raised per month">
        <TrendChart data={trend} color={5} height={280} />
      </ChartCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Top Customer Issues">
          <HorizontalBars data={byIssue} color={1} height={260} />
        </ChartCard>
        <ChartCard title="Tickets by Priority">
          <VerticalBars data={byPriority} color={4} height={260} />
        </ChartCard>
        <ChartCard title="Satisfaction Score Distribution">
          <VerticalBars data={scoreDist} color={2} height={260} />
        </ChartCard>
        <ChartCard title="Resolution Status">
          <Donut
            data={resolutionMix}
            height={260}
            centerLabel="Tickets"
            centerValue={formatNumber(tickets.length)}
          />
        </ChartCard>
      </div>
    </div>
  );
}
