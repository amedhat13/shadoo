import { useState } from "react";
import { Button } from "@/components/ui/button";

const PROTOTYPES = [
  { id: "visit-journey", label: "Agent Visit Journey (mobile)", src: "/mobile-flow/visit-journey.html" },
  { id: "client-dashboard", label: "Client Dashboard", src: "/mobile-flow/client-dashboard.html" },
] as const;

export default function MobileFlowPrototype() {
  const [active, setActive] = useState<string>(PROTOTYPES[0].id);
  const current = PROTOTYPES.find((p) => p.id === active) ?? PROTOTYPES[0];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4">
          <h1 className="text-lg font-semibold tracking-wide uppercase">Design handoff prototype</h1>
          <div className="ms-auto flex gap-2">
            {PROTOTYPES.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant={p.id === active ? "default" : "outline"}
                onClick={() => setActive(p.id)}
              >
                {p.label}
              </Button>
            ))}
            <Button size="sm" variant="ghost" asChild>
              <a href={current.src} target="_blank" rel="noreferrer">
                Open in new tab
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <iframe
          key={current.id}
          title={current.label}
          src={current.src}
          className="h-[calc(100vh-140px)] w-full rounded-lg border bg-background"
        />
      </main>
    </div>
  );
}
