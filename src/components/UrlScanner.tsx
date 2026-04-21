import { useEffect, useState } from "react";
import { Link2, FlaskConical, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VerdictPanel } from "./VerdictPanel";
import { useLiveVerdict } from "@/hooks/use-live-verdict";

const PHISHING_URL = "http://paypa1-secure-login.tk/verify?account=update&token=xR8";
const SAFE_URL = "https://github.com/login";

export function UrlScanner({
  onContextChange,
}: {
  onContextChange: (ctx: string) => void;
}) {
  const [url, setUrl] = useState("");
  // The URL we actually submit for analysis. Empty until the user clicks Analyze.
  const [submittedUrl, setSubmittedUrl] = useState("");

  const { verdict, isStreaming, error } = useLiveVerdict({
    kind: "url",
    url: submittedUrl,
  });

  // expose context to chat (only after submit, and only on the client to avoid SSR mismatch)
  useEffect(() => {
    const ctx = submittedUrl
      ? `URL scan in progress.\nURL: ${submittedUrl}\nCurrent verdict: ${verdict?.verdict ?? "pending"} (score ${verdict?.score ?? 0})`
      : "";
    onContextChange(ctx);
  }, [submittedUrl, verdict, onContextChange]);

  const analyze = () => {
    const trimmed = url.trim();
    if (trimmed.length < 4) return;
    // force a re-run even if the same URL is analyzed twice by toggling whitespace
    setSubmittedUrl((prev) => (prev === trimmed ? trimmed + " " : trimmed));
    setTimeout(() => setSubmittedUrl(trimmed), 0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      analyze();
    }
  };

  const clearAll = () => {
    setUrl("");
    setSubmittedUrl("");
  };

  const canAnalyze = url.trim().length >= 4 && !isStreaming;

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 card-glass rounded-xl border border-border/60 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="h-4 w-4 text-cyan" />
          <h3 className="text-sm font-bold uppercase tracking-widest">
            URL / Domain Risk Analyzer
          </h3>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">
            Enter any URL or domain to analyze
          </label>
          <div className="mt-1 flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="https://example.com/login"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={onKeyDown}
              className="bg-background/40 font-mono flex-1"
            />
            <Button
              onClick={analyze}
              disabled={!canAnalyze}
              className="bg-gradient-to-br from-cyan to-primary text-primary-foreground font-bold glow-cyan hover:scale-[1.02] transition-transform shrink-0"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Analyze URL
                </>
              )}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Tip: paste any URL you received and press Enter or click Analyze.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUrl(PHISHING_URL)}
            className="border-danger/40 text-danger hover:bg-danger/10"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Try phishing sample
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUrl(SAFE_URL)}
            className="border-safe/40 text-safe hover:bg-safe/10"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Try safe sample
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear
          </Button>
        </div>

        <div className="rounded-lg bg-background/40 border border-border/40 p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground/80 mb-1">What we check</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
            <li>• Lookalike domains</li>
            <li>• Suspicious TLDs</li>
            <li>• URL obfuscation</li>
            <li>• Brand impersonation</li>
            <li>• Credential harvesting</li>
            <li>• Recent threat patterns</li>
          </ul>
        </div>

        {error && (
          <p className="text-xs text-danger bg-danger/10 border border-danger/30 rounded p-2">
            {error}
          </p>
        )}
      </div>

      <div className="lg:col-span-2 space-y-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-cyan pulse-ring text-cyan" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
          </span>
          Live AI verdict
        </p>
        <VerdictPanel
          verdict={verdict}
          isStreaming={isStreaming}
          empty={!submittedUrl}
        />
      </div>
    </div>
  );
}
