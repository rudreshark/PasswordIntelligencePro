import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Analysis, BreachStatus } from "@/lib/password";
import { scoreToToken } from "@/lib/passcheck-utils";
import { Metric } from "./Metric";
import { ClassPill } from "./ClassPill";
import { BreachPill } from "./BreachPill";

export function CipherInput(props: {
  label: string;
  tag: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  analysis: Analysis;
  breach: { status: BreachStatus; count: number };
}) {
  const { label, tag, value, onChange, show, onToggleShow, analysis, breach } = props;
  const token = scoreToToken(analysis.label);

  return (
    <Card
      className={`bg-card/60 backdrop-blur border-border p-4 ring-1 ${token.ring} hover-lift card-glow`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-primary text-lg leading-none">{tag}</span>
          <h3 className="text-sm font-semibold tracking-wide">{label}</h3>
        </div>
        <Badge className={`${token.bg} ${token.color} border-0 font-mono`}>
          {analysis.label} · {analysis.score}
        </Badge>
      </div>

      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type a candidate cipher…"
          className="font-mono pr-10 bg-background/60 border-border h-11"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-3 space-y-2">
        <Progress value={analysis.score} className="h-1.5" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
          <Metric label="LEN" value={String(analysis.length)} />
          <Metric label="POOL" value={String(analysis.poolSize)} />
          <Metric label="ENTROPY" value={`${analysis.entropyBits.toFixed(1)}b`} />
          <Metric label="CRACK" value={analysis.crackEstimate} />
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <ClassPill on={analysis.flags.hasLower}>a-z</ClassPill>
          <ClassPill on={analysis.flags.hasUpper}>A-Z</ClassPill>
          <ClassPill on={analysis.flags.hasDigit}>0-9</ClassPill>
          <ClassPill on={analysis.flags.hasSymbol}>sym</ClassPill>
          <BreachPill status={breach.status} count={breach.count} />
        </div>

        <ul className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/60 mt-2">
          {analysis.reasons.map((r, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="text-primary mt-0.5">›</span> {r}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
