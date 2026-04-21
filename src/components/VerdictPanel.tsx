import { type Verdict } from "@/lib/ai-stream";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  verdict: Partial<Verdict> | null;
  isStreaming: boolean;
  empty?: boolean;
};

const config = {
  safe: {
    label: "Looks Safe",
    icon: CheckCircle2,
    accent: "text-safe",
    bg: "bg-safe/10 border-safe/40",
    glow: "glow-safe",
    bar: "bg-safe",
  },
  suspicious: {
    label: "Suspicious",
    icon: AlertTriangle,
    accent: "text-warning",
    bg: "bg-warning/10 border-warning/40",
    glow: "",
    bar: "bg-warning",
  },
  phishing: {
    label: "Phishing Detected",
    icon: ShieldAlert,
    accent: "text-danger",
    bg: "bg-danger/10 border-danger/40",
    glow: "glow-danger",
    bar: "bg-danger",
  },
} as const;

export function VerdictPanel({ verdict, isStreaming, empty }: Props) {
  if (empty && !verdict && !isStreaming) {
    return (
      <div className="card-glass rounded-xl border border-border/60 p-6 text-center">
        <Sparkles className="h-8 w-8 mx-auto mb-3 text-cyan opacity-70" />
        <p className="text-sm font-medium">Live AI assistant ready</p>
        <p className="text-xs text-muted-foreground mt-1">
          Start typing — I'll grade the risk in real time and tell you what to do.
        </p>
      </div>
    );
  }

  const v = verdict?.verdict ?? "safe";
  const cfg = config[v];
  const Icon = cfg.icon;
  const score = Math.max(0, Math.min(100, Math.round(verdict?.score ?? 0)));
  const confidence = Math.max(0, Math.min(100, Math.round(verdict?.confidence ?? 0)));

  return (
    <div className={cn("rounded-xl border p-5 transition-all", cfg.bg, cfg.glow)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-background/40", cfg.accent)}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className={cn("text-lg font-bold leading-tight", cfg.accent)}>
              {cfg.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {isStreaming ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> AI analyzing live…
                </span>
              ) : (
                `Confidence ${confidence}%`
              )}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold tabular-nums text-foreground">{score}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            risk score
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 rounded-full bg-background/50 overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500", cfg.bar)}
          style={{ width: `${score}%` }}
        />
      </div>

      {verdict?.summary && (
        <p className="mt-4 text-sm text-foreground/90 leading-relaxed">
          {verdict.summary}
        </p>
      )}

      {verdict?.signals && verdict.signals.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            Detected signals
          </p>
          {verdict.signals.map((s, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2.5 rounded-lg bg-background/40 border border-border/40"
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full mt-1.5 shrink-0",
                  s.severity === "high"
                    ? "bg-danger"
                    : s.severity === "medium"
                      ? "bg-warning"
                      : "bg-cyan",
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {verdict?.recommendation && (
        <div className="mt-4 p-3 rounded-lg bg-background/60 border border-border/60">
          <p className="text-[10px] uppercase tracking-widest text-cyan font-bold mb-1">
            ✦ Recommended action
          </p>
          <p className="text-sm font-medium leading-relaxed">{verdict.recommendation}</p>
        </div>
      )}
    </div>
  );
}
