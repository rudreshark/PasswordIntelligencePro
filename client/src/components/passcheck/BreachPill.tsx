import type { BreachStatus } from "@/lib/password";

export function BreachPill({ status, count }: { status: BreachStatus; count: number }) {
  if (status === "unknown")
    return (
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-background/30 text-muted-foreground">
        breach: off
      </span>
    );
  if (status === "checking")
    return (
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-primary/40 bg-primary/10 text-primary">
        scanning…
      </span>
    );
  if (status === "safe")
    return (
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]">
        no breach hit
      </span>
    );
  return (
    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[color:var(--destructive)]/50 bg-[color:var(--destructive)]/15 text-[color:var(--destructive)]">
      breached · {count.toLocaleString()}
    </span>
  );
}
