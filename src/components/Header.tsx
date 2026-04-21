import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border/60 bg-background/40 backdrop-blur-md sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-cyan to-primary flex items-center justify-center glow-cyan">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight">
              PHISHGUARD <span className="gradient-text">AI</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:block">
              AI-powered phishing defense, real-time
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2 text-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inset-0 rounded-full bg-safe pulse-ring text-safe" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-safe" />
          </span>
          <span className="text-safe font-medium">API Online</span>
          <span className="text-muted-foreground hidden md:inline">
            • Live AI assist
          </span>
        </div>
      </div>
    </header>
  );
}
