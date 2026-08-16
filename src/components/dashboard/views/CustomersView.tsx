import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ChartCard } from "../ChartCard";
import { isChurned, formatINR, type Scope } from "@/lib/dashboard-data";

export function CustomersView({ scope }: { scope: Scope }) {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const spendById = new Map<string, number>();
    for (const p of scope.payments) {
      if (p.status.toLowerCase() !== "paid") continue;
      spendById.set(p.customer_id, (spendById.get(p.customer_id) ?? 0) + p.amount);
    }
    const ticketsById = new Map<string, number>();
    for (const t of scope.tickets)
      ticketsById.set(t.customer_id, (ticketsById.get(t.customer_id) ?? 0) + 1);
    const contractById = new Map(scope.contracts.map((c) => [c.customer_id, c]));

    const q = query.trim().toLowerCase();
    return scope.customers
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.state.toLowerCase().includes(q),
      )
      .map((c) => ({
        ...c,
        spend: spendById.get(c.id) ?? 0,
        tickets: ticketsById.get(c.id) ?? 0,
        contract: contractById.get(c.id)?.contract_type ?? "—",
        churned: isChurned(c.id),
      }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 200);
  }, [scope, query]);

  return (
    <ChartCard
      title="Customer Explorer"
      subtitle={`${scope.customers.length} customers match the current filters — showing top 200 by revenue`}
      action={
        <div className="relative">
          <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, ID, state"
            className="w-56 pl-8"
          />
        </div>
      }
    >
      <div className="max-h-[560px] overflow-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              {["Customer", "Segment", "State", "Contract", "Internet", "Revenue", "Tickets", "Status"].map(
                (h) => (
                  <th key={h} className="px-3 py-2 text-left font-semibold">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-muted/50">
                <td className="px-3 py-2">
                  <span className="font-medium">{r.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{r.id}</span>
                </td>
                <td className="px-3 py-2">{r.segment}</td>
                <td className="px-3 py-2">{r.state}</td>
                <td className="px-3 py-2">{r.contract}</td>
                <td className="px-3 py-2">{r.internet ?? "—"}</td>
                <td className="px-3 py-2 tabular-nums">{formatINR(r.spend)}</td>
                <td className="px-3 py-2 tabular-nums">{r.tickets}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      r.churned
                        ? "rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive"
                        : "rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success"
                    }
                  >
                    {r.churned ? "Churned" : "Active"}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                  No customers match these filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
