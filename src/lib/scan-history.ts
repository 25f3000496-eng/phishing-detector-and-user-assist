import { useEffect, useState } from "react";
import type { Verdict } from "./ai-stream";

export type ScanRecord = {
  id: string;
  ts: number;
  kind: "email" | "url";
  verdict: "safe" | "suspicious" | "phishing";
  score: number;
  summary?: string;
  target: string; // brief identifier (subject or url)
};

const KEY = "phishguard.scan-history.v1";
const EVENT = "phishguard:history-changed";
const MAX = 500;

function read(): ScanRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(records: ScanRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(records.slice(0, MAX)));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function recordScan(rec: Omit<ScanRecord, "id" | "ts">) {
  const all = read();
  const entry: ScanRecord = {
    ...rec,
    id: crypto.randomUUID(),
    ts: Date.now(),
  };
  // Dedupe: if last entry within 3s has same target+kind, replace it
  const last = all[0];
  if (
    last &&
    last.kind === entry.kind &&
    last.target === entry.target &&
    Date.now() - last.ts < 3000
  ) {
    all[0] = entry;
  } else {
    all.unshift(entry);
  }
  write(all);
}

export function clearHistory() {
  write([]);
}

export function useScanHistory(): ScanRecord[] {
  const [records, setRecords] = useState<ScanRecord[]>(() => read());

  useEffect(() => {
    const update = () => setRecords(read());
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return records;
}

export function summarize(records: ScanRecord[]) {
  const total = records.length;
  let safe = 0;
  let suspicious = 0;
  let phishing = 0;
  for (const r of records) {
    if (r.verdict === "safe") safe++;
    else if (r.verdict === "suspicious") suspicious++;
    else if (r.verdict === "phishing") phishing++;
  }
  return { total, safe, suspicious, phishing };
}

// Verdict type re-export for convenience
export type { Verdict };
