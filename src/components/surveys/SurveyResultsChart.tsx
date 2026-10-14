import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { cn } from "@/lib/utils";

const PIE_COLOURS = [
  "#0A2E68",
  "#C5A869",
  "#0B5F6B",
  "#1F7A4D",
  "#14428B",
  "#A8631A",
  "#334155",
  "#7C8AA5",
];

interface Bucket {
  label: string;
  value: number;
  count: number;
}

/** Horizontal distribution bars for a single survey question. */
export function DistributionBars({
  buckets,
  mean,
  answered,
  questionType,
}: {
  buckets: Bucket[];
  mean?: number | undefined;
  answered: number;
  questionType: string;
}) {
  if (questionType === "rating" && (mean !== undefined || buckets.length === 0)) {
    const value = mean ?? 0;
    return (
      <div className="rounded-md border border-brand-border bg-brand-cream p-4">
        <p className="text-xs text-brand-slate">Mean rating</p>
        <p className="mt-1 font-display text-3xl font-bold text-brand-navy">{value.toFixed(1)}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-brand-gold"
            style={{ width: `${(value / 10) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-brand-slate">
          Scale of 1–10 · {answered.toLocaleString("en-GB")} sample responses
        </p>
      </div>
    );
  }

  if (buckets.length === 0) {
    return <p className="text-xs text-brand-slate">No responses recorded yet.</p>;
  }

  const max = Math.max(...buckets.map((bucket) => bucket.value), 1);

  return (
    <ul className="space-y-2">
      {buckets.map((bucket) => (
        <li key={bucket.label}>
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate font-medium text-brand-charcoal">{bucket.label}</span>
            <span className="shrink-0 tabular-nums text-brand-slate">
              {bucket.value}% · {bucket.count.toLocaleString("en-GB")}
            </span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-sm bg-brand-border/70">
            <div
              className={cn(
                "h-full rounded-sm",
                bucket.value === max ? "bg-brand-gold" : "bg-brand-navy",
              )}
              style={{ width: `${Math.max(bucket.value, 1.5)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Donut breakdown used for respondent segments and geography. */
export function MixPie({
  data,
  title,
}: {
  data: { label: string; count: number }[];
  title: string;
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-brand-border bg-white p-5">
        <h4 className="text-sm font-semibold text-brand-charcoal">{title}</h4>
        <p className="mt-2 text-xs text-brand-slate">No data recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-brand-border bg-white p-5">
      <h4 className="text-sm font-semibold text-brand-charcoal">{title}</h4>
      <div className="mt-3 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius={42}
              outerRadius={70}
              paddingAngle={2}
              stroke="#F8F9FA"
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.label}
                  fill={PIE_COLOURS[index % PIE_COLOURS.length] ?? "#0A2E68"}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} responses`, String(name)]}
              contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#E2E8F0" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 space-y-1.5">
        {data.slice(0, 6).map((entry, index) => (
          <li key={entry.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-brand-slate">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: PIE_COLOURS[index % PIE_COLOURS.length] }}
              />
              <span className="truncate">{entry.label}</span>
            </span>
            <span className="shrink-0 tabular-nums font-medium text-brand-charcoal">
              {entry.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
