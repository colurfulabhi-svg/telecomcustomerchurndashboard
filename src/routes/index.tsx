import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  Radio,
  Table2,
  Wallet,
  LifeBuoy,
} from "lucide-react";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { OverviewView } from "@/components/dashboard/views/OverviewView";
import { ChurnView } from "@/components/dashboard/views/ChurnView";
import { RevenueView } from "@/components/dashboard/views/RevenueView";
import { SupportView } from "@/components/dashboard/views/SupportView";
import { CustomersView } from "@/components/dashboard/views/CustomersView";
import { applyFilters, emptyFilters, type Filters } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Telecom Customer Churn Dashboard | Retention Analytics" },
      {
        name: "description",
        content:
          "Interactive telecom analytics: churn rate, retention drivers, revenue collection and support performance across 500+ customers.",
      },
      { property: "og:title", content: "Telecom Customer Churn Dashboard" },
      {
        property: "og:description",
        content:
          "Explore churn, revenue and support KPIs with live filters by segment, state, contract and payment method.",
      },
    ],
  }),
  component: Dashboard,
});

const NAV = [
  { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
  { id: "churn", label: "Churn Analysis", icon: Activity },
  { id: "revenue", label: "Customer & Revenue", icon: Wallet },
  { id: "support", label: "Customer Support", icon: LifeBuoy },
  { id: "customers", label: "Customer Explorer", icon: Table2 },
] as const;

type ViewId = (typeof NAV)[number]["id"];

function Dashboard() {
  const [view, setView] = useState<ViewId>("overview");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const scope = useMemo(() => applyFilters(filters), [filters]);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <nav className="panel-surface flex shrink-0 flex-col gap-1 p-4 text-panel-foreground lg:w-64">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-panel-accent/20">
            <Radio className="size-5 text-panel-foreground" />
          </span>
          <div>
            <p className="font-display text-base font-bold leading-tight">Telecom</p>
            <p className="text-xs text-panel-muted">Retention Analytics</p>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                view === item.id
                  ? "bg-panel-accent text-panel-foreground shadow"
                  : "text-panel-muted hover:bg-white/5 hover:text-panel-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-auto hidden pt-8 lg:block">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-panel-muted">
            <BarChart3 className="mb-2 size-4" />
            Data imported from your customer, contract, payment, service and support
            tables. Values cleaned for casing, duplicates and invalid dates.
          </div>
        </div>
      </nav>

      <main className="flex-1 space-y-4 p-4 lg:p-6">
        <header className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
              Telecom Customer Churn Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Customer retention &amp; performance overview
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {scope.customers.length} customers · {scope.contracts.length} contracts ·{" "}
            {scope.payments.length} payments · {scope.tickets.length} tickets in view
          </p>
        </header>

        <div className="grid gap-4 xl:grid-cols-[240px_1fr]">
          <FilterPanel filters={filters} onChange={setFilters} />
          <div className="min-w-0">
            {view === "overview" ? <OverviewView scope={scope} /> : null}
            {view === "churn" ? <ChurnView scope={scope} /> : null}
            {view === "revenue" ? <RevenueView scope={scope} /> : null}
            {view === "support" ? <SupportView scope={scope} /> : null}
            {view === "customers" ? <CustomersView scope={scope} /> : null}
          </div>
        </div>

        <footer className="rounded-lg border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
          Churn Rate = churned customers / total customers · Revenue counts payments with
          status “Paid” · Charges above ₹20,000 were excluded as data-entry anomalies.
        </footer>
      </main>
    </div>
  );
}
