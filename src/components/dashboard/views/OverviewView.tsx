import { Users, UserMinus, Percent, IndianRupee, CreditCard, Star } from "lucide-react";
import { KpiCard } from "../KpiCard";
import { ChartCard } from "../ChartCard";
import { Donut, HorizontalBars, TrendChart, VerticalBars } from "../Charts";
import {
  countBy,
  formatINR,
  formatNumber,
  isChurned,
  monthlySeries,
  toSortedArray,
  type Scope,
} from "@/lib/dashboard-data";

export function OverviewView({ scope }: { scope: Scope }) {
  const total = scope.customers.length;
  const churnedCustomers = scope.customers.filter((c) => isChurned(c.id)).length;
  const churnRate = total ? (churnedCustomers / total) * 100 : 0;
  const paid = scope.payments.filter((p) => p.status.toLowerCase() === "paid");
  const revenue = paid.reduce((acc, p) => acc + p.amount, 0);
  const avgCharges = scope.payments.length
    ? scope.payments.reduce((acc, p) => acc + p.amount, 0) / scope.payments.length
    : 0;
  const scores = scope.tickets.filter((t) => t.score != null);
  const avgScore = scores.length
    ? scores.reduce((acc, t) => acc + (t.score ?? 0), 0) / scores.length
    : 0;

  const churnedContracts = scope.contracts.filter((c) => c.churned);
  const churnTrend = monthlySeries(
    churnedContracts,
    (c) => c.churn_date,
    () => 1,
  );
  const churnedIds = new Set(churnedContracts.map((c) => c.customer_id));
  const churnedCust = scope.customers.filter((c) => churnedIds.has(c.id));

  const byContract = toSortedArray(countBy(churnedContracts, (c) => c.contract_type));
  const bySegment = toSortedArray(countBy(churnedCust, (c) => c.segment));
  const byState = toSortedArray(countBy(churnedCust, (c) => c.state), 8);
  const byGender = toSortedArray(countBy(churnedCust, (c) => c.gender));
  const byReason = toSortedArray(countBy(churnedContracts, (c) => c.churn_reason));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard label="Total Customers" value={formatNumber(total)} icon={Users} tone="blue" />
        <KpiCard
          label="Churned Customers"
          value={formatNumber(churnedCustomers)}
          icon={UserMinus}
          tone="violet"
        />
        <KpiCard
          label="Churn Rate"
          value={`${churnRate.toFixed(2)}%`}
          icon={Percent}
          tone="red"
        />
        <KpiCard
          label="Revenue Collected"
          value={formatINR(revenue)}
          hint={`${formatNumber(paid.length)} paid invoices`}
          icon={IndianRupee}
          tone="green"
        />
        <KpiCard
          label="Avg Monthly Charges"
          value={formatINR(avgCharges)}
          icon={CreditCard}
          tone="amber"
        />
        <KpiCard
          label="Avg Satisfaction"
          value={`${avgScore.toFixed(2)} / 5`}
          icon={Star}
          tone="cyan"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Churn Trend Over Time"
          subtitle="Contracts churned per month"
          className="xl:col-span-2"
        >
          <TrendChart data={churnTrend} color={0} />
        </ChartCard>
        <ChartCard title="Churn by Contract Type">
          <VerticalBars data={byContract} color={1} height={280} />
        </ChartCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <ChartCard title="Churn by Segment">
          <HorizontalBars data={bySegment} color={0} height={240} />
        </ChartCard>
        <ChartCard title="Churn by State (Top 8)">
          <HorizontalBars data={byState} color={2} height={240} />
        </ChartCard>
        <ChartCard title="Churn by Gender">
          <Donut
            data={byGender}
            height={240}
            centerLabel="Churned"
            centerValue={formatNumber(churnedCust.length)}
          />
        </ChartCard>
        <ChartCard title="Churn by Reason">
          <HorizontalBars data={byReason} color={4} height={240} />
        </ChartCard>
      </div>
    </div>
  );
}
