import { useCallback, useEffect, useRef, useState } from "react";
import { streamAI, tryParseVerdict, type Verdict } from "@/lib/ai-stream";
import { recordScan } from "@/lib/scan-history";

export type ScannerInput =
  | { kind: "email"; sender: string; subject: string; content: string }
  | { kind: "url"; url: string };

const DEBOUNCE_MS = 700;

function inputSignature(input: ScannerInput): string {
  return input.kind === "email"
    ? `${input.sender}::${input.subject}::${input.content}`.trim()
    : input.url.trim();
}

function isMeaningful(input: ScannerInput): boolean {
  if (input.kind === "url") return input.url.trim().length >= 4;
  return (input.content.trim().length >= 12) || (input.subject.trim().length >= 4);
}

export function useLiveVerdict(input: ScannerInput) {
  const [verdict, setVerdict] = useState<Partial<Verdict> | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSigRef = useRef<string>("");

  const run = useCallback(async (target: ScannerInput) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setIsStreaming(true);
    setError(null);
    let raw = "";

    try {
      await streamAI({
        body: {
          mode: "verdict",
          payload:
            target.kind === "email"
              ? {
                  sender: target.sender,
                  subject: target.subject,
                  content: target.content,
                }
              : { url: target.url },
        },
        signal: ac.signal,
        onDelta: (chunk) => {
          raw += chunk;
          const parsed = tryParseVerdict(raw);
          if (parsed) setVerdict(parsed);
        },
      });
      const final = tryParseVerdict(raw);
      if (final) {
        setVerdict(final);
        if (
          final.verdict &&
          typeof final.score === "number" &&
          ["safe", "suspicious", "phishing"].includes(final.verdict)
        ) {
          recordScan({
            kind: target.kind,
            verdict: final.verdict as "safe" | "suspicious" | "phishing",
            score: final.score,
            summary: final.summary,
            target:
              target.kind === "url"
                ? target.url.trim().slice(0, 120)
                : (target.subject || target.sender || target.content)
                    .trim()
                    .slice(0, 120),
          });
        }
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError(e?.message ?? "Analysis failed");
      }
    } finally {
      if (abortRef.current === ac) {
        setIsStreaming(false);
      }
    }
  }, []);

  useEffect(() => {
    const sig = inputSignature(input);
    if (sig === lastSigRef.current) return;
    lastSigRef.current = sig;

    if (timerRef.current) clearTimeout(timerRef.current);

    if (!isMeaningful(input)) {
      abortRef.current?.abort();
      setVerdict(null);
      setIsStreaming(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      run(input);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSignature(input)]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { verdict, isStreaming, error };
}
