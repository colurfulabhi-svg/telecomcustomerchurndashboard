import { IndianRupee, ReceiptText, TriangleAlert, TicketPercent } from "lucide-react";
import { ChartCard } from "../ChartCard";
import { KpiCard } from "../KpiCard";
import { Donut, HorizontalBars, TrendChart, VerticalBars } from "../Charts";
import { formatINR, formatNumber, monthlySeries, type Scope } from "@/lib/dashboard-data";

export function RevenueView({ scope }: { scope: Scope }) {
  const paid = scope.payments.filter((p) => p.status.toLowerCase() === "paid");
  const failed = scope.payments.filter((p) =>
    ["failed", "overdue"].includes(p.status.toLowerCase()),
  );
  const revenue = paid.reduce((a, p) => a + p.amount, 0);
  const atRisk = failed.reduce((a, p) => a + p.amount, 0);
  const discounts = scope.payments.reduce((a, p) => a + (p.discount ?? 0), 0);

  const trend = monthlySeries(
    paid,
    (p) => p.date,
    (p) => p.amount,
  );

  const methodMap = new Map<string, number>();
  for (const p of paid) methodMap.set(p.method, (methodMap.get(p.method) ?? 0) + p.amount);
  const byMethod = Array.from(methodMap, ([name, value]) => ({
    name,
    value: Math.round(value),
  })).sort((a, b) => b.value - a.value);

  const statusMap = new Map<string, number>();
  for (const p of scope.payments)
    statusMap.set(p.status, (statusMap.get(p.status) ?? 0) + 1);
  const byStatus = Array.from(statusMap, ([name, value]) => ({ name, value })).sort(
    (a, b) => b.value - a.value,
  );

  const segMap = new Map<string, { sum: number; n: number }>();
  const segOf = new Map(scope.customers.map((c) => [c.id, c.segment]));
  for (const p of scope.payments) {
    const seg = segOf.get(p.customer_id);
    if (!seg) continue;
    const row = segMap.get(seg) ?? { sum: 0, n: 0 };
    row.sum += p.amount;
    row.n += 1;
    segMap.set(seg, row);
  }
  const avgBySegment = Array.from(segMap, ([name, v]) => ({
    name,
    value: Math.round(v.sum / v.n),
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Revenue Collected"
          value={formatINR(revenue)}
          icon={IndianRupee}
          tone="green"
        />
        <KpiCard
          label="Payments"
          value={formatNumber(scope.payments.length)}
          hint={`${formatNumber(paid.length)} paid`}
          icon={ReceiptText}
          tone="blue"
        />
        <KpiCard
          label="Failed / Overdue"
          value={formatINR(atRisk)}
          hint={`${formatNumber(failed.length)} invoices`}
          icon={TriangleAlert}
          tone="red"
        />
        <KpiCard
          label="Discounts Given"
          value={formatINR(discounts)}
          icon={TicketPercent}
          tone="amber"
        />
      </div>

      <ChartCard title="Revenue Trend Over Time" subtitle="Collected revenue per month">
        <TrendChart data={trend} color={2} height={300} valueFormatter={formatINR} />
      </ChartCard>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Revenue by Payment Method">
          <Donut
            data={byMethod}
            height={280}
            centerLabel="Total"
            centerValue={formatINR(revenue)}
          />
        </ChartCard>
        <ChartCard title="Payment Status Mix">
          <VerticalBars data={byStatus} color={3} height={280} />
        </ChartCard>
        <ChartCard title="Avg Charge by Segment">
          <HorizontalBars data={avgBySegment} color={5} height={280} />
        </ChartCard>
      </div>
    </div>
  );
}
