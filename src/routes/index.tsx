import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mail,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  LayoutDashboard,
  Link2,
  BarChart3,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { EmailScanner } from "@/components/EmailScanner";
import { UrlScanner } from "@/components/UrlScanner";
import { ChatAdvisor } from "@/components/ChatAdvisor";
import {
  ModelMetrics,
  RecentScansList,
  ScanDistributionChart,
  ThreatTrendChart,
} from "@/components/Charts";
import { useScanHistory, summarize, clearHistory } from "@/lib/scan-history";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PhishGuard AI — Real-time phishing defense with AI assistant" },
      {
        name: "description",
        content:
          "AI-powered phishing detection that streams live verdicts and a safety advisor chat to help you decide what to do — in real time.",
      },
      { property: "og:title", content: "PhishGuard AI — Real-time phishing defense" },
      {
        property: "og:description",
        content:
          "Live AI risk scoring for emails and URLs, plus a chat advisor that guides you to the right decision.",
      },
    ],
  }),
  component: Index,
});

type Tab = "dashboard" | "email" | "url" | "metrics";

const TABS: { id: Tab; label: string; icon: typeof Mail }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "email", label: "Email Scanner", icon: Mail },
  { id: "url", label: "URL Checker", icon: Link2 },
  { id: "metrics", label: "ML Metrics", icon: BarChart3 },
];

function Index() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [chatContext, setChatContext] = useState<string>("");
  const history = useScanHistory();
  const stats = summarize(history);
  const threatRate =
    stats.total === 0
      ? 0
      : Math.round(((stats.phishing + stats.suspicious) / stats.total) * 1000) / 10;


  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-6 flex-1 w-full">
        {/* Tabs */}
        <div className="mb-6 flex gap-1 p-1 rounded-xl bg-card/40 border border-border/60 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  active
                    ? "bg-gradient-to-br from-cyan/20 to-primary/20 text-cyan border border-cyan/30 glow-cyan"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40",
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Real-time <span className="gradient-text">phishing intelligence</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Live AI scoring, multi-language detection, and an always-on safety advisor.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Mail}
                label="Total scanned"
                value={stats.total.toLocaleString()}
                hint={stats.total === 0 ? "no scans yet" : "your scans"}
                tone="primary"
              />
              <StatCard
                icon={ShieldAlert}
                label="Phishing"
                value={stats.phishing.toLocaleString()}
                hint={stats.total === 0 ? "—" : `${threatRate}% threat rate`}
                tone="danger"
              />
              <StatCard
                icon={AlertTriangle}
                label="Suspicious"
                value={stats.suspicious.toLocaleString()}
                hint={stats.total === 0 ? "—" : "needs review"}
                tone="warning"
              />
              <StatCard
                icon={CheckCircle2}
                label="Safe"
                value={stats.safe.toLocaleString()}
                hint={stats.total === 0 ? "—" : "cleared"}
                tone="safe"
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <ThreatTrendChart />
              <ScanDistributionChart />
            </div>

            <RecentScansList />

            <ModelMetrics />

            {stats.total > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (confirm("Clear all your scan history?")) clearHistory();
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-danger border border-border/60 hover:border-danger/40 hover:bg-danger/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear scan history
                </button>
              </div>
            )}

            <div className="card-glass rounded-xl border border-cyan/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-cyan">
                  ✦ New: Live AI assistance
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  As you paste an email or URL, our AI streams a verdict in real time and
                  tells you exactly what to do. Need a second opinion? Open the chat
                  advisor in the bottom-right corner.
                </p>
              </div>
              <button
                onClick={() => setTab("email")}
                className="px-4 py-2 rounded-lg bg-gradient-to-br from-cyan to-primary text-primary-foreground text-sm font-bold glow-cyan hover:scale-[1.02] transition-transform shrink-0"
              >
                Try it now →
              </button>
            </div>
          </div>
        )}

        {tab === "email" && (
          <div className="animate-in fade-in duration-300">
            <EmailScanner onContextChange={setChatContext} />
          </div>
        )}

        {tab === "url" && (
          <div className="animate-in fade-in duration-300">
            <UrlScanner onContextChange={setChatContext} />
          </div>
        )}

        {tab === "metrics" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <ModelMetrics />
            <div className="grid lg:grid-cols-2 gap-4">
              <ThreatTrendChart />
              <ScanDistributionChart />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        PhishGuard AI · Powered by live AI risk scoring
      </footer>

      <ChatAdvisor context={chatContext} />
    </div>
  );
}
