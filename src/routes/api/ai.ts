import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            mode: "verdict" | "chat";
            payload: any;
          };
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return new Response(
              JSON.stringify({ error: "AI not configured" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          let messages: { role: string; content: string }[] = [];

          if (body.mode === "verdict") {
            const { sender, subject, content, url } = body.payload ?? {};
            const system = `You are PhishGuard AI — a real-time phishing & scam risk advisor.
Analyse the user input and respond with a STRICT JSON object only, no prose, no markdown fences.
Schema:
{
  "verdict": "safe" | "suspicious" | "phishing",
  "score": number (0-100, higher = more dangerous),
  "confidence": number (0-100),
  "summary": string (1 short sentence),
  "signals": [ { "label": string, "severity": "low"|"medium"|"high", "detail": string } ],
  "recommendation": string (one clear action the user should take right now)
}
Be decisive and concise. If input is empty or trivial, return verdict "safe" with score 0 and a friendly summary.`;
            const userText = url
              ? `Analyse this URL/domain for phishing risk:\nURL: ${url}`
              : `Analyse this email/message for phishing risk.\nFrom: ${sender ?? "(unknown)"}\nSubject: ${subject ?? "(none)"}\nBody:\n${content ?? "(empty)"}`;
            messages = [
              { role: "system", content: system },
              { role: "user", content: userText },
            ];
          } else {
            const { history, context } = body.payload ?? {};
            const system = `You are PhishGuard's Safety Advisor — a friendly real-time guide that helps users decide what to do with suspicious emails, links, and messages.
Style:
- Warm, calm, plain English. No jargon dumps.
- Always end with a clear next step ("don't click that link", "report to IT", "delete it", etc.).
- Use short markdown: bullet lists, **bold** key actions.
- Never invent details about a specific email; if user hasn't shared it, ask.
${context ? `\nCurrent scan context the user has open:\n${context}` : ""}`;
            messages = [
              { role: "system", content: system },
              ...(history ?? []),
            ];
          }

          const upstream = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages,
                stream: true,
              }),
            },
          );

          if (!upstream.ok) {
            if (upstream.status === 429) {
              return new Response(
                JSON.stringify({ error: "Rate limit reached. Try again in a moment." }),
                { status: 429, headers: { "Content-Type": "application/json" } },
              );
            }
            if (upstream.status === 402) {
              return new Response(
                JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace." }),
                { status: 402, headers: { "Content-Type": "application/json" } },
              );
            }
            const t = await upstream.text();
            console.error("AI upstream error", upstream.status, t);
            return new Response(
              JSON.stringify({ error: "AI gateway error" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          return new Response(upstream.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
            },
          });
        } catch (e) {
          console.error("AI route error", e);
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
