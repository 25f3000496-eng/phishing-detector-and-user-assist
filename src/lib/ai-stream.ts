export type ChatMsg = { role: "user" | "assistant"; content: string };

export async function streamAI(opts: {
  body: any;
  onDelta: (chunk: string) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const resp = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts.body),
    signal: opts.signal,
  });

  if (!resp.ok || !resp.body) {
    let msg = "Failed to start stream";
    try {
      const data = await resp.json();
      msg = data.error || msg;
    } catch {}
    throw new Error(msg);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) opts.onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) opts.onDelta(content);
      } catch {}
    }
  }
}

export type Verdict = {
  verdict: "safe" | "suspicious" | "phishing";
  score: number;
  confidence: number;
  summary: string;
  signals: { label: string; severity: "low" | "medium" | "high"; detail: string }[];
  recommendation: string;
};

/** Best-effort extraction of a JSON object from a (possibly partial) LLM stream string. */
export function tryParseVerdict(raw: string): Partial<Verdict> | null {
  if (!raw) return null;
  let s = raw.trim();
  // strip markdown fences if present
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = s.indexOf("{");
  if (start === -1) return null;
  s = s.slice(start);
  // try direct parse
  try {
    return JSON.parse(s);
  } catch {}
  // attempt to close braces for partial JSON
  let depth = 0;
  let inStr = false;
  let escape = false;
  let lastValidEnd = -1;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) lastValidEnd = i;
    }
  }
  if (lastValidEnd > 0) {
    try {
      return JSON.parse(s.slice(0, lastValidEnd + 1));
    } catch {}
  }
  return null;
}
