import { Users, UserMinus, Percent, IndianRupee, CreditCard, Star } from "lucide-react";
import { KpiCard } from "../KpiCard";
import { ChartCard } from "../ChartCard";
import { Donut, HorizontalBars, TrendChart, VerticalBars } from "../Charts";
import {
  countBy,
  formatINR,
  formatINRFull,
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Total Customers"
          value={formatNumber(total)}
          hint="unique customers"
          icon={Users}
          tone="blue"
          info="Number of unique customers matching the current filters."
        />
        <KpiCard
          label="Churned Customers"
          value={formatNumber(churnedCustomers)}
          hint={`${formatNumber(churnedContracts.length)} churned contracts`}
          icon={UserMinus}
          tone="violet"
          info="Customers with at least one contract marked as churned."
        />
        <KpiCard
          label="Churn Rate"
          value={`${churnRate.toFixed(1)}%`}
          hint={`${formatNumber(churnedCustomers)} of ${formatNumber(total)}`}
          icon={Percent}
          tone="red"
          info="Churned customers divided by total customers in the current selection."
        />
        <KpiCard
          label="Revenue Collected"
          value={formatINR(revenue)}
          hint={`${formatINRFull(revenue)} · ${formatNumber(paid.length)} invoices`}
          icon={IndianRupee}
          tone="green"
          info={`Sum of all invoice amounts with a Paid status: ${formatINRFull(revenue)}. L = lakh, Cr = crore.`}
        />
        <KpiCard
          label="Avg Monthly Charges"
          value={formatINRFull(avgCharges)}
          hint="per invoice"
          icon={CreditCard}
          tone="amber"
          info="Average invoice amount across all payments, paid or not."
        />
        <KpiCard
          label="Avg Satisfaction"
          value={avgScore.toFixed(2)}
          hint="out of 5"
          icon={Star}
          tone="cyan"
          info="Average support ticket satisfaction score, on a 1 to 5 scale."
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
