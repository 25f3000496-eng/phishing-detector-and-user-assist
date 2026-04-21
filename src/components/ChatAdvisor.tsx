import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { streamAI, type ChatMsg } from "@/lib/ai-stream";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Is this email safe to reply to?",
  "What should I do if I already clicked the link?",
  "How can I tell a real bank email from a fake one?",
  "What is smishing?",
];

export function ChatAdvisor({ context }: { context: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your **PhishGuard Safety Advisor**. Paste a message you're unsure about, ask me about a link, or pick a quick question below — I'll help you decide what to do. 🛡️",
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const send = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: ChatMsg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsStreaming(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.content !== messages[messages.length - 1]?.content) {
          // only replace the trailing assistant we just appended
          if (prev.length > next.length) {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantSoFar } : m,
            );
          }
        }
        return [...next, { role: "assistant", content: assistantSoFar }];
      });
    };

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      await streamAI({
        body: {
          mode: "chat",
          payload: { history: next, context },
        },
        signal: ac.signal,
        onDelta: upsert,
      });
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setMessages((prev) => [
          ...prev.filter((m) => m !== prev[prev.length - 1] || m.role === "user"),
          {
            role: "assistant",
            content: `⚠️ ${e?.message ?? "Something went wrong. Please try again."}`,
          },
        ]);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-gradient-to-br from-cyan to-primary text-primary-foreground glow-cyan flex items-center justify-center transition-transform hover:scale-105",
          open && "scale-90 opacity-0 pointer-events-none",
        )}
        aria-label="Open safety advisor"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-safe pulse-ring text-safe" />
      </button>

      {/* Panel */}
      <div
        className={cn(
          "fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-5 sm:bottom-5 z-50 sm:w-[400px] max-h-[80vh] flex flex-col rounded-2xl border border-border/70 bg-card shadow-2xl card-glass transition-all origin-bottom-right",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan to-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold">Safety Advisor</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                AI • Real time
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-background/60 border border-border/60",
              )}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none [&>*]:my-1 [&_strong]:text-cyan [&_a]:text-cyan [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:my-0.5">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
          ))}
          {isStreaming && messages[messages.length - 1]?.role === "user" && (
            <div className="bg-background/60 border border-border/60 rounded-2xl px-3.5 py-2.5 text-sm inline-flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan" />
              Thinking…
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-background/60 border border-border/60 hover:border-cyan/60 hover:text-cyan transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="p-3 border-t border-border/60 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about a suspicious message…"
            className="flex-1 bg-background/60 rounded-lg px-3 py-2 text-sm outline-none border border-border/60 focus:border-cyan/60"
            disabled={isStreaming}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isStreaming || !input.trim()}
            className="bg-gradient-to-br from-cyan to-primary text-primary-foreground"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  );
}
