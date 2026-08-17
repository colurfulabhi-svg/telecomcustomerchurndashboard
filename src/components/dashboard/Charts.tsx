import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/lib/dashboard-data";

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  fontSize: "12px",
  color: "var(--card-foreground)",
} as const;

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

export type Datum = { name: string; value: number };

export function HorizontalBars({
  data,
  color = 0,
  height = 240,
  total,
}: {
  data: Datum[];
  color?: number;
  height?: number;
  total?: number;
}) {
  const sum = total ?? data.reduce((acc, d) => acc + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 44, top: 4 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" {...axis} />
        <YAxis type="category" dataKey="name" width={92} {...axis} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} fill={CHART_COLORS[color % 6]}>
          <LabelList
            dataKey="value"
            position="right"
            fontSize={11}
            fill="var(--foreground)"
            formatter={(v: number) =>
              sum ? `${v} · ${((v / sum) * 100).toFixed(0)}%` : `${v}`
            }
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function VerticalBars({
  data,
  color = 1,
  height = 240,
}: {
  data: Datum[];
  color?: number;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 8, left: -16 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" interval={0} height={44} angle={-15} textAnchor="end" {...axis} />
        <YAxis {...axis} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={CHART_COLORS[color % 6]}>
          <LabelList dataKey="value" position="top" fontSize={11} fill="var(--foreground)" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({
  data,
  height = 260,
  centerLabel,
  centerValue,
}: {
  data: Datum[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            stroke="var(--card)"
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerValue ? (
        <div className="pointer-events-none absolute inset-x-0 top-[38%] text-center">
          <p className="text-[10px] uppercase text-muted-foreground">{centerLabel}</p>
          <p className="font-display text-lg font-bold">{centerValue}</p>
        </div>
      ) : null}
    </div>
  );
}

export function TrendChart({
  data,
  height = 280,
  color = 0,
  valueFormatter,
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: number;
  valueFormatter?: (v: number) => string;
}) {
  const stroke = CHART_COLORS[color % 6];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 12, left: -12 }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="label" minTickGap={16} {...axis} />
        <YAxis {...axis} tickFormatter={(v: number) => (valueFormatter ? valueFormatter(v) : String(v))} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number) => (valueFormatter ? valueFormatter(v) : v)}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={2}
          fill={`url(#grad-${color})`}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MultiLine({
  data,
  series,
  height = 280,
}: {
  data: Record<string, string | number>[];
  series: { key: string; label: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 12, left: -12 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="label" minTickGap={16} {...axis} />
        <YAxis {...axis} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} iconType="plainline" />
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
