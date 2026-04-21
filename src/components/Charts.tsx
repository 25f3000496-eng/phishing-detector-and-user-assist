import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { useMemo } from "react";
import { useScanHistory, summarize, type ScanRecord } from "@/lib/scan-history";

function buildHourlyTrend(records: ScanRecord[]) {
  const now = new Date();
  const buckets: { hour: string; phishing: number; suspicious: number; safe: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    buckets.push({
      hour: `${d.getHours().toString().padStart(2, "0")}:00`,
      phishing: 0,
      suspicious: 0,
      safe: 0,
    });
  }
  const start = new Date(now.getTime() - 11 * 60 * 60 * 1000);
  start.setMinutes(0, 0, 0);
  for (const r of records) {
    const diffH = Math.floor((r.ts - start.getTime()) / (60 * 60 * 1000));
    if (diffH < 0 || diffH >= buckets.length) continue;
    buckets[diffH][r.verdict] += 1;
  }
  return buckets;
}

export function ThreatTrendChart() {
  const records = useScanHistory();
  const data = useMemo(() => buildHourlyTrend(records), [records]);
  const hasData = records.length > 0;

  return (
    <div className="card-glass rounded-xl border border-border/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest">
          🕐 Hourly threat trend
        </h3>
        <span className="text-[10px] text-muted-foreground">last 12h · your scans</span>
      </div>
      <div className="h-[220px] relative">
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground z-10">
            No scans yet — run a scan to see your activity.
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="g-phishing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.65 0.24 20)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="oklch(0.65 0.24 20)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-suspicious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.82 0.16 80)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="oklch(0.82 0.16 80)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-safe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.74 0.18 155)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="oklch(0.74 0.18 155)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.04 250 / 0.4)" />
            <XAxis dataKey="hour" stroke="oklch(0.68 0.03 240)" fontSize={10} />
            <YAxis stroke="oklch(0.68 0.03 240)" fontSize={10} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "oklch(0.21 0.035 250)",
                border: "1px solid oklch(0.3 0.04 250)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Area type="monotone" dataKey="safe" stroke="oklch(0.74 0.18 155)" fill="url(#g-safe)" />
            <Area type="monotone" dataKey="suspicious" stroke="oklch(0.82 0.16 80)" fill="url(#g-suspicious)" />
            <Area type="monotone" dataKey="phishing" stroke="oklch(0.65 0.24 20)" fill="url(#g-phishing)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ScanDistributionChart() {
  const records = useScanHistory();
  const { total, safe, suspicious, phishing } = summarize(records);

  const distData = useMemo(() => {
    if (total === 0) {
      return [
        { name: "Safe", value: 0, color: "oklch(0.74 0.18 155)" },
        { name: "Suspicious", value: 0, color: "oklch(0.82 0.16 80)" },
        { name: "Phishing", value: 0, color: "oklch(0.65 0.24 20)" },
      ];
    }
    return [
      { name: "Safe", value: safe, color: "oklch(0.74 0.18 155)" },
      { name: "Suspicious", value: suspicious, color: "oklch(0.82 0.16 80)" },
      { name: "Phishing", value: phishing, color: "oklch(0.65 0.24 20)" },
    ];
  }, [total, safe, suspicious, phishing]);

  const pct = (v: number) => (total === 0 ? 0 : Math.round((v / total) * 100));

  return (
    <div className="card-glass rounded-xl border border-border/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest">
          🍩 Scan distribution
        </h3>
        <span className="text-[10px] text-muted-foreground">{total} total</span>
      </div>
      <div className="h-[220px] flex items-center">
        <ResponsiveContainer width="60%" height="100%">
          <PieChart>
            <Pie
              data={total === 0 ? [{ name: "Empty", value: 1, color: "oklch(0.3 0.04 250)" }] : distData}
              innerRadius={50}
              outerRadius={80}
              paddingAngle={total === 0 ? 0 : 3}
              dataKey="value"
              stroke="none"
            >
              {(total === 0
                ? [{ name: "Empty", value: 1, color: "oklch(0.3 0.04 250)" }]
                : distData
              ).map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            {total > 0 && (
              <Tooltip
                contentStyle={{
                  background: "oklch(0.21 0.035 250)",
                  border: "1px solid oklch(0.3 0.04 250)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {distData.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ background: d.color }} />
                <span>{d.name}</span>
              </div>
              <span className="font-bold tabular-nums">
                {d.value} <span className="text-muted-foreground font-normal">({pct(d.value)}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const metrics = [
  { name: "Accuracy", value: 96.4 },
  { name: "Precision", value: 94.8 },
  { name: "Recall", value: 97.2 },
  { name: "F1 Score", value: 96.0 },
  { name: "ROC-AUC", value: 98.1 },
  { name: "False Positive Rate", value: 3.6, invert: true },
];

export function ModelMetrics() {
  return (
    <div className="card-glass rounded-xl border border-border/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest">
          🤖 Model performance
        </h3>
        <span className="text-[10px] text-muted-foreground">v3.1 · indian-multilingual</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div
            key={m.name}
            className="rounded-lg bg-background/40 border border-border/40 p-3"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {m.name}
            </p>
            <p
              className={`text-2xl font-bold mt-1 tabular-nums ${
                m.invert ? "text-warning" : "text-cyan"
              }`}
            >
              {m.value}%
            </p>
            <div className="h-1 mt-2 rounded-full bg-background/60 overflow-hidden">
              <div
                className={`h-full ${m.invert ? "bg-warning" : "bg-cyan"}`}
                style={{ width: `${m.invert ? m.value * 5 : m.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecentScansList() {
  const records = useScanHistory();
  const recent = records.slice(0, 8);
  return (
    <div className="card-glass rounded-xl border border-border/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest">
          📋 Recent scans
        </h3>
        <span className="text-[10px] text-muted-foreground">{records.length} total</span>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No scans yet. Try the Email Scanner or URL Checker to populate your dashboard.
        </p>
      ) : (
        <ul className="divide-y divide-border/40">
          {recent.map((r) => {
            const tone =
              r.verdict === "safe"
                ? "text-safe border-safe/40 bg-safe/10"
                : r.verdict === "suspicious"
                  ? "text-warning border-warning/40 bg-warning/10"
                  : "text-danger border-danger/40 bg-danger/10";
            return (
              <li key={r.id} className="py-2 flex items-center gap-3 text-sm">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest font-bold border ${tone}`}
                >
                  {r.verdict}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground w-10">
                  {r.kind}
                </span>
                <span className="flex-1 truncate text-foreground/80 font-mono text-xs">
                  {r.target || "(empty)"}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {new Date(r.ts).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
