export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/50 px-2 py-1.5">
      <div className="text-muted-foreground text-[9px] tracking-widest">{label}</div>
      <div className="text-foreground">{value}</div>
    </div>
  );
}
