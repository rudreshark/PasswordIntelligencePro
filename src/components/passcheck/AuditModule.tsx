import { useState, useEffect } from "react";
import { ClipboardCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { analyze, DEFAULT_POLICIES, type Analysis } from "@/lib/password";
import type { VaultEntry } from "@/types/passcheck";
import { VAULT_KEY } from "@/types/passcheck";

export function AuditModule({ alpha, beta }: { alpha: Analysis; beta: Analysis }) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(DEFAULT_POLICIES.map((p) => [p.id, true])),
  );
  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(VAULT_KEY);
      if (raw) setVaultEntries(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const subjects: { name: string; analysis: Analysis }[] = [];
  if (alpha.length) subjects.push({ name: "Candidate Alpha", analysis: alpha });
  if (beta.length) subjects.push({ name: "Candidate Beta", analysis: beta });
  for (const v of vaultEntries) {
    subjects.push({ name: `Vault · ${v.target}`, analysis: analyze(v.secret, v.breach) });
  }

  const activePolicies = DEFAULT_POLICIES.filter((p) => enabled[p.id]);
  const violations: { subject: string; rule: (typeof DEFAULT_POLICIES)[number] }[] = [];
  for (const s of subjects)
    for (const r of activePolicies)
      if (!r.test(s.analysis)) violations.push({ subject: s.name, rule: r });

  const compliant = subjects.length > 0 && violations.length === 0;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="bg-card/60 backdrop-blur border-border p-5 lg:col-span-1 hover-lift card-glow">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-wide uppercase">Policy Rules</h3>
        </div>
        <div className="space-y-2">
          {DEFAULT_POLICIES.map((p) => (
            <label
              key={p.id}
              className="flex items-start justify-between gap-3 rounded-md border border-border bg-background/40 p-2.5 cursor-pointer"
            >
              <div>
                <div className="text-xs font-medium">{p.label}</div>
                <div className="text-[10px] text-muted-foreground">{p.description}</div>
              </div>
              <Switch
                checked={enabled[p.id]}
                onCheckedChange={(v) => setEnabled({ ...enabled, [p.id]: v })}
              />
            </label>
          ))}
        </div>
      </Card>

      <Card className="bg-card/60 backdrop-blur border-border p-5 lg:col-span-2 space-y-4 hover-lift card-glow">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide uppercase">Audit Results</h3>
          {subjects.length === 0 ? (
            <Badge variant="outline">No subjects</Badge>
          ) : compliant ? (
            <Badge className="bg-[color:var(--success)]/15 text-[color:var(--success)] border-0 font-mono">
              100% COMPLIANT
            </Badge>
          ) : (
            <Badge className="bg-[color:var(--destructive)]/15 text-[color:var(--destructive)] border-0 font-mono">
              {violations.length} VIOLATION{violations.length !== 1 ? "S" : ""}
            </Badge>
          )}
        </div>

        <Separator className="bg-border" />

        {subjects.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            Enter a candidate cipher in the Telemetry tab or add vault entries to begin auditing.
          </div>
        ) : compliant ? (
          <div className="flex items-center gap-3 p-6 rounded-lg bg-[color:var(--success)]/10 border border-[color:var(--success)]/30">
            <CheckCircle2 className="h-7 w-7 text-[color:var(--success)]" />
            <div>
              <div className="font-semibold">
                All {subjects.length} subject(s) pass active policies.
              </div>
              <div className="text-xs text-muted-foreground">
                No remediation actions required at this time.
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {violations.map((v, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-md border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/5 p-3"
              >
                <AlertTriangle className="h-4 w-4 text-[color:var(--destructive)] mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-mono text-[color:var(--destructive)]">{v.subject}</span>{" "}
                    <span className="text-muted-foreground">violates</span>{" "}
                    <span className="font-medium">{v.rule.label}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Remediation: {v.rule.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
