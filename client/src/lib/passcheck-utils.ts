import type { Analysis } from "./password";

export function scoreToToken(label: Analysis["label"]) {
  switch (label) {
    case "Fortress":
    case "Strong":
      return {
        color: "text-[color:var(--success)]",
        bg: "bg-[color:var(--success)]/15",
        ring: "ring-[color:var(--success)]/30",
      };
    case "Moderate":
      return {
        color: "text-[color:var(--warning)]",
        bg: "bg-[color:var(--warning)]/15",
        ring: "ring-[color:var(--warning)]/30",
      };
    case "Weak":
    case "Critical":
      return {
        color: "text-[color:var(--destructive)]",
        bg: "bg-[color:var(--destructive)]/15",
        ring: "ring-[color:var(--destructive)]/30",
      };
    default:
      return { color: "text-muted-foreground", bg: "bg-muted/30", ring: "ring-border" };
  }
}
