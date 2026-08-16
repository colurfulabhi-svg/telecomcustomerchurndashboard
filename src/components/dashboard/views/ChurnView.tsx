import { ChartCard } from "../ChartCard";
import { Donut, HorizontalBars, MultiLine, VerticalBars } from "../Charts";
import { KpiCard } from "../KpiCard";
import { CalendarClock, TrendingDown, Repeat } from "lucide-react";
import {
  countBy,
  isChurned,
  monthKey,
  monthLabel,
  toSortedArray,
  type Scope,
} from "@/lib/dashboard-data";

const tenureBucket = (months: number | null) => {
  if (months == null) return "Unknown";
  if (months <= 6) return "0-6 m";
  if (months <= 12) return "7-12 m";
  if (months <= 24) return "13-24 m";
  if (months <= 48) return "25-48 m";
  return "48+ m";
};

const bucketOrder = ["0-6 m", "7-12 m", "13-24 m", "25-48 m", "48+ m", "Unknown"];

export function ChurnView({ scope }: { scope: Scope }) {
  const churned = scope.contracts.filter((c) => c.churned);
  const churnRate = scope.customers.length
    ? (scope.customers.filter((c) => isChurned(c.id)).length / scope.customers.length) * 100
    : 0;
  const tenures = churned.filter((c) => c.tenure != null);
  const avgTenure = tenures.length
    ? tenures.reduce((a, c) => a + (c.tenure ?? 0), 0) / tenures.length
    : 0;

  const tenureData = bucketOrder
    .map((name) => ({
      name,
      value: churned.filter((c) => tenureBucket(c.tenure) === name).length,
    }))
    .filter((d) => d.value > 0);

  const byReason = toSortedArray(countBy(churned, (c) => c.churn_reason));
  const byType = toSortedArray(countBy(churned, (c) => c.contract_type));

  // Cumulative churn vs new contracts by month
  const months = new Map<string, { starts: number; churns: number }>();
  for (const c of scope.contracts) {
    if (c.start_date) {
      const k = monthKey(c.start_date);
      const row = months.get(k) ?? { starts: 0, churns: 0 };
      row.starts += 1;
      months.set(k, row);
    }
    if (c.churn_date) {
      const k = monthKey(c.churn_date);
      const row = months.get(k) ?? { starts: 0, churns: 0 };
      row.churns += 1;
      months.set(k, row);
    }
  }
  const flow = Array.from(months, ([key, v]) => ({
    key,
    label: monthLabel(key),
    starts: v.starts,
    churns: v.churns,
  })).sort((a, b) => a.key.localeCompare(b.key));

  const internetSplit = toSortedArray(
    countBy(
      scope.customers.filter((c) => isChurned(c.id)),
      (c) => c.internet,
    ),
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          label="Churned Contracts"
          value={String(churned.length)}
          icon={TrendingDown}
          tone="red"
        />
        <KpiCard
          label="Churn Rate"
          value={`${churnRate.toFixed(2)}%`}
          icon={Repeat}
          tone="violet"
        />
        <KpiCard
          label="Avg Tenure at Churn"
          value={`${avgTenure.toFixed(1)} months`}
          icon={CalendarClock}
          tone="amber"
        />
      </div>

      <ChartCard title="Contract Starts vs Churns" subtitle="Monthly contract flow">
        <MultiLine
          data={flow}
          series={[
            { key: "starts", label: "New contracts" },
            { key: "churns", label: "Churned" },
          ]}
          height={300}
        />
      </ChartCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Churn Reasons">
          <HorizontalBars data={byReason} color={4} height={260} />
        </ChartCard>
        <ChartCard title="Tenure at Churn">
          <VerticalBars data={tenureData} color={2} height={260} />
        </ChartCard>
        <ChartCard title="Churn by Contract Type">
          <VerticalBars data={byType} color={1} height={260} />
        </ChartCard>
        <ChartCard title="Churned Customers by Internet Service">
          <Donut data={internetSplit} height={260} />
        </ChartCard>
      </div>
    </div>
  );
}
