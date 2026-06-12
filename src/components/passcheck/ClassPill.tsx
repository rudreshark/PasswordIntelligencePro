export function ClassPill({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
        on
          ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]"
          : "border-border bg-background/30 text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}
