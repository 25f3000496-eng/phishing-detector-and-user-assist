import { useEffect, useState } from "react";
import { Mail, FlaskConical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { VerdictPanel } from "./VerdictPanel";
import { useLiveVerdict } from "@/hooks/use-live-verdict";

const PHISHING_SAMPLE = {
  sender: "security-alert@paypa1-support.com",
  subject: "URGENT: Your account will be suspended in 24 hours",
  content:
    "Dear customer, We detected unusual activity on your account. To avoid permanent suspension, please verify your identity immediately by clicking: http://paypa1-verify.tk/login?id=8273\n\nFailure to act within 24 hours will result in account closure. Do not share this email.",
};

const LEGIT_SAMPLE = {
  sender: "no-reply@github.com",
  subject: "[GitHub] A new SSH key was added to your account",
  content:
    "Hi there,\n\nA new SSH key was added to your GitHub account. If you did this, you can ignore this message. If you did not, please review your security settings at https://github.com/settings/keys.\n\nThanks,\nThe GitHub Team",
};

export function EmailScanner({
  onContextChange,
}: {
  onContextChange: (ctx: string) => void;
}) {
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const { verdict, isStreaming, error } = useLiveVerdict({
    kind: "email",
    sender,
    subject,
    content,
  });

  // expose context to chat (in effect to avoid SSR/CSR mismatch)
  useEffect(() => {
    const ctx =
      sender || subject || content
        ? `Email scan in progress.\nFrom: ${sender}\nSubject: ${subject}\nBody: ${content.slice(0, 400)}\nCurrent verdict: ${verdict?.verdict ?? "pending"} (score ${verdict?.score ?? 0})`
        : "";
    onContextChange(ctx);
  }, [sender, subject, content, verdict, onContextChange]);

  const load = (s: typeof PHISHING_SAMPLE) => {
    setSender(s.sender);
    setSubject(s.subject);
    setContent(s.content);
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 card-glass rounded-xl border border-border/60 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-4 w-4 text-cyan" />
          <h3 className="text-sm font-bold uppercase tracking-widest">
            Email / Message Analysis
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Sender email</label>
            <Input
              placeholder="someone@example.com"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              className="mt-1 bg-background/40"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Subject line</label>
            <Input
              placeholder="Subject of the message"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 bg-background/40"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Message body</label>
            <Textarea
              placeholder="Paste the full email or SMS content here…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="mt-1 bg-background/40 font-mono text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => load(PHISHING_SAMPLE)}
              className="border-danger/40 text-danger hover:bg-danger/10"
            >
              <FlaskConical className="h-3.5 w-3.5" />
              Load phishing sample
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => load(LEGIT_SAMPLE)}
              className="border-safe/40 text-safe hover:bg-safe/10"
            >
              <FlaskConical className="h-3.5 w-3.5" />
              Load legit sample
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSender("");
                setSubject("");
                setContent("");
              }}
            >
              Clear
            </Button>
          </div>
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
          empty={!sender && !subject && !content}
        />
      </div>
    </div>
  );
}
