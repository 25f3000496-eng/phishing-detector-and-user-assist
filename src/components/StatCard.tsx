import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "primary" | "danger" | "warning" | "safe";
};

const toneMap = {
  primary: { ring: "from-cyan/30", text: "text-cyan", border: "border-cyan/30" },
  danger: { ring: "from-danger/30", text: "text-danger", border: "border-danger/30" },
  warning: { ring: "from-warning/30", text: "text-warning", border: "border-warning/30" },
  safe: { ring: "from-safe/30", text: "text-safe", border: "border-safe/30" },
} as const;

export function StatCard({ icon: Icon, label, value, hint, tone = "primary" }: Props) {
  const t = toneMap[tone];
  return (
    <div
      className={cn(
        "card-glass rounded-xl p-5 border relative overflow-hidden transition-transform hover:-translate-y-0.5",
        t.border,
      )}
    >
      <div
        className={cn(
          "absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl bg-gradient-to-br opacity-50",
          t.ring,
          "to-transparent",
        )}
      />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
            {label}
          </p>
          <p className={cn("text-3xl font-bold mt-2 tabular-nums", t.text)}>{value}</p>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
        <div className={cn("p-2 rounded-lg bg-background/50", t.text)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
