import customersRaw from "@/data/customers.json";
import contractsRaw from "@/data/contracts.json";
import paymentsRaw from "@/data/payments.json";
import ticketsRaw from "@/data/tickets.json";

export type Customer = {
  id: string;
  name: string;
  gender: string;
  city: string;
  state: string;
  segment: string;
  registered: string | null;
  age: number | null;
  internet: string | null;
  mobile_plan: string | null;
  streaming: string | null;
  cloud: string | null;
  protection: string | null;
  intl: string | null;
};

export type Contract = {
  id: string;
  customer_id: string;
  contract_type: string;
  tenure: number | null;
  churned: boolean;
  churn_date: string | null;
  churn_reason: string | null;
  start_date: string | null;
};

export type Payment = {
  id: string;
  customer_id: string;
  amount: number;
  method: string;
  status: string;
  discount: number;
  date: string | null;
};

export type Ticket = {
  id: string;
  customer_id: string;
  issue: string;
  priority: string;
  hours: number | null;
  score: number | null;
  resolved: boolean;
  date: string | null;
};

export const customers = customersRaw as unknown as Customer[];
export const contracts = contractsRaw as unknown as Contract[];
export const payments = paymentsRaw as unknown as Payment[];
export const tickets = ticketsRaw as unknown as Ticket[];

export type Filters = {
  segment: string;
  gender: string;
  state: string;
  contractType: string;
  paymentMethod: string;
  churnStatus: string;
  internet: string;
};

export const emptyFilters: Filters = {
  segment: "All",
  gender: "All",
  state: "All",
  contractType: "All",
  paymentMethod: "All",
  churnStatus: "All",
  internet: "All",
};

const uniqueSorted = (values: (string | null)[]) =>
  Array.from(new Set(values.filter((v): v is string => !!v))).sort();

export const filterOptions = {
  segment: uniqueSorted(customers.map((c) => c.segment)),
  gender: uniqueSorted(customers.map((c) => c.gender)),
  state: uniqueSorted(customers.map((c) => c.state)),
  contractType: uniqueSorted(contracts.map((c) => c.contract_type)),
  paymentMethod: uniqueSorted(payments.map((p) => p.method)),
  churnStatus: ["Churned", "Active"],
  internet: uniqueSorted(customers.map((c) => c.internet)),
};

export type Scope = {
  customers: Customer[];
  contracts: Contract[];
  payments: Payment[];
  tickets: Ticket[];
};

/** Customers considered churned = they have at least one churned contract. */
const churnedCustomerIds = new Set(
  contracts.filter((c) => c.churned).map((c) => c.customer_id),
);

export const isChurned = (customerId: string) => churnedCustomerIds.has(customerId);

export function applyFilters(filters: Filters): Scope {
  const contractTypeIds =
    filters.contractType === "All"
      ? null
      : new Set(
          contracts
            .filter((c) => c.contract_type === filters.contractType)
            .map((c) => c.customer_id),
        );

  const paymentMethodIds =
    filters.paymentMethod === "All"
      ? null
      : new Set(
          payments
            .filter((p) => p.method === filters.paymentMethod)
            .map((p) => p.customer_id),
        );

  const scopedCustomers = customers.filter((c) => {
    if (filters.segment !== "All" && c.segment !== filters.segment) return false;
    if (filters.gender !== "All" && c.gender !== filters.gender) return false;
    if (filters.state !== "All" && c.state !== filters.state) return false;
    if (filters.internet !== "All" && c.internet !== filters.internet) return false;
    if (contractTypeIds && !contractTypeIds.has(c.id)) return false;
    if (paymentMethodIds && !paymentMethodIds.has(c.id)) return false;
    if (filters.churnStatus === "Churned" && !isChurned(c.id)) return false;
    if (filters.churnStatus === "Active" && isChurned(c.id)) return false;
    return true;
  });

  const ids = new Set(scopedCustomers.map((c) => c.id));

  return {
    customers: scopedCustomers,
    contracts: contracts.filter(
      (c) =>
        ids.has(c.customer_id) &&
        (filters.contractType === "All" || c.contract_type === filters.contractType),
    ),
    payments: payments.filter(
      (p) =>
        ids.has(p.customer_id) &&
        (filters.paymentMethod === "All" || p.method === filters.paymentMethod),
    ),
    tickets: tickets.filter((t) => ids.has(t.customer_id)),
  };
}

/* ---------------- aggregation helpers ---------------- */

export const countBy = <T,>(rows: T[], key: (row: T) => string | null | undefined) => {
  const map = new Map<string, number>();
  for (const row of rows) {
    const k = key(row);
    if (!k) continue;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
};

export const toSortedArray = (map: Map<string, number>, limit?: number) => {
  const arr = Array.from(map, ([name, value]) => ({ name, value })).sort(
    (a, b) => b.value - a.value,
  );
  return limit ? arr.slice(0, limit) : arr;
};

export const monthKey = (iso: string) => iso.slice(0, 7);

export const monthLabel = (key: string) => {
  const [y, m] = key.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[Number(m) - 1]} ${y?.slice(2)}`;
};

export function monthlySeries<T>(
  rows: T[],
  dateOf: (row: T) => string | null,
  valueOf: (row: T) => number,
) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const d = dateOf(row);
    if (!d) continue;
    const k = monthKey(d);
    map.set(k, (map.get(k) ?? 0) + valueOf(row));
  }
  return Array.from(map, ([key, value]) => ({ key, label: monthLabel(key), value })).sort(
    (a, b) => a.key.localeCompare(b.key),
  );
}

export const formatINR = (value: number) => {
  if (value >= 1_000_000) return `₹${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
  return `₹${value.toFixed(0)}`;
};

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(Math.round(value));

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];
