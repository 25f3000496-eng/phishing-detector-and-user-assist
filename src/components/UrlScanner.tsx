import { useState } from "react";
import { Link2, FlaskConical } from "lucide-react";
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

  const { verdict, isStreaming, error } = useLiveVerdict({ kind: "url", url });

  if (typeof window !== "undefined") {
    const ctx = url
      ? `URL scan in progress.\nURL: ${url}\nCurrent verdict: ${verdict?.verdict ?? "pending"} (score ${verdict?.score ?? 0})`
      : "";
    queueMicrotask(() => onContextChange(ctx));
  }

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
          <label className="text-xs text-muted-foreground">Suspicious URL or domain</label>
          <Input
            placeholder="https://example.com/login"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 bg-background/40 font-mono"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUrl(PHISHING_URL)}
            className="border-danger/40 text-danger hover:bg-danger/10"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Phishing URL
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUrl(SAFE_URL)}
            className="border-safe/40 text-safe hover:bg-safe/10"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Safe URL
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setUrl("")}>
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
        <VerdictPanel verdict={verdict} isStreaming={isStreaming} empty={!url} />
      </div>
    </div>
  );
}
