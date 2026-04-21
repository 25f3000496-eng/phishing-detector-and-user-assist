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

const trendData = Array.from({ length: 12 }, (_, i) => ({
  hour: `${(new Date().getHours() - 11 + i + 24) % 24}:00`,
  phishing: Math.round(Math.sin(i / 2) * 4 + 6 + Math.random() * 3),
  suspicious: Math.round(Math.cos(i / 3) * 3 + 5 + Math.random() * 2),
  safe: Math.round(15 + Math.sin(i) * 4 + Math.random() * 3),
}));

const distData = [
  { name: "Safe", value: 71, color: "var(--safe)" },
  { name: "Suspicious", value: 18, color: "var(--warning)" },
  { name: "Phishing", value: 11, color: "var(--danger)" },
];

export function ThreatTrendChart() {
  return (
    <div className="card-glass rounded-xl border border-border/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest">
          🕐 Hourly threat trend
        </h3>
        <span className="text-[10px] text-muted-foreground">last 12h</span>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
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
            <YAxis stroke="oklch(0.68 0.03 240)" fontSize={10} />
            <Tooltip
              contentStyle={{
                background: "oklch(0.21 0.035 250)",
                border: "1px solid oklch(0.3 0.04 250)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="safe"
              stroke="oklch(0.74 0.18 155)"
              fill="url(#g-safe)"
            />
            <Area
              type="monotone"
              dataKey="suspicious"
              stroke="oklch(0.82 0.16 80)"
              fill="url(#g-suspicious)"
            />
            <Area
              type="monotone"
              dataKey="phishing"
              stroke="oklch(0.65 0.24 20)"
              fill="url(#g-phishing)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ScanDistributionChart() {
  return (
    <div className="card-glass rounded-xl border border-border/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest">
          🍩 Scan distribution
        </h3>
        <span className="text-[10px] text-muted-foreground">cumulative</span>
      </div>
      <div className="h-[220px] flex items-center">
        <ResponsiveContainer width="60%" height="100%">
          <PieChart>
            <Pie
              data={distData}
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {distData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "oklch(0.21 0.035 250)",
                border: "1px solid oklch(0.3 0.04 250)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {distData.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ background: d.color }}
                />
                <span>{d.name}</span>
              </div>
              <span className="font-bold tabular-nums">{d.value}%</span>
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
