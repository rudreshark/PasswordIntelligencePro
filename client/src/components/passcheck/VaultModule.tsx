import { useState, useEffect } from "react";
import { Database, Lock, Eye, EyeOff, Copy, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyze, checkHIBP, type BreachStatus } from "@/lib/password";
import { scoreToToken } from "@/lib/passcheck-utils";
import type { VaultEntry } from "@/types/passcheck";
import { VAULT_KEY } from "@/types/passcheck";
import { BreachPill } from "./BreachPill";
import { VaultLogin } from "./VaultLogin";

export function VaultModule({ breachEnabled }: { breachEnabled: boolean }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [target, setTarget] = useState("");
  const [identity, setIdentity] = useState("");
  const [secret, setSecret] = useState("");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  // Check login status
  useEffect(() => {
    // No login check needed first, we'll show login page
  }, []);

  // load vault data after login
  useEffect(() => {
    if (!isLoggedIn) return;
    try {
      const raw = localStorage.getItem(VAULT_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [isLoggedIn]);

  const persist = (next: VaultEntry[]) => {
    setEntries(next);
    localStorage.setItem(VAULT_KEY, JSON.stringify(next));
  };

  const add = async () => {
    if (!target || !identity || !secret) {
      toast.error("All three fields are required");
      return;
    }
    let breach: BreachStatus = "unknown";
    if (breachEnabled) {
      try {
        const c = await checkHIBP(secret);
        breach = c > 0 ? "breached" : "safe";
      } catch {
        breach = "unknown";
      }
    }
    const a = analyze(secret, breach);
    const entry: VaultEntry = {
      id: crypto.randomUUID(),
      target,
      identity,
      secret,
      score: a.score,
      breach,
      createdAt: Date.now(),
    };
    persist([entry, ...entries]);
    setTarget("");
    setIdentity("");
    setSecret("");
    toast.success("Vault entry stored locally");
  };

  const remove = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
  };

  if (!isLoggedIn) {
    return <VaultLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/60 backdrop-blur border-border p-5 hover-lift card-glow">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-wide uppercase">Local Vault</h3>
          <Badge variant="outline" className="ml-auto font-mono text-[10px]">
            LocalStorage
          </Badge>
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          <div className="md:col-span-1">
            <Label className="text-xs">Application Target</Label>
            <Input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="example.com"
              className="bg-background/60 border-border mt-1"
            />
          </div>
          <div className="md:col-span-1">
            <Label className="text-xs">Access Identity</Label>
            <Input
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="user@host"
              className="bg-background/60 border-border mt-1"
            />
          </div>
          <div className="md:col-span-1">
            <Label className="text-xs">Key String</Label>
            <Input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="secret"
              className="bg-background/60 border-border mt-1 font-mono"
            />
          </div>
          <div className="md:col-span-1 flex items-end">
            <Button onClick={add} className="w-full bg-primary hover:bg-primary/90">
              <Lock className="h-4 w-4 mr-2" /> Store
            </Button>
          </div>
        </div>

        <p className="text-[11px] text-[color:var(--warning)] mt-3 flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3" />
          Records are stored in your browser's LocalStorage on this device. This is local
          persistence, not hardened enterprise vault storage.
        </p>
      </Card>

      <Card className="bg-card/60 backdrop-blur border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left p-3">Target</th>
                <th className="text-left p-3">Identity</th>
                <th className="text-left p-3">Key</th>
                <th className="text-left p-3">Score</th>
                <th className="text-left p-3">Breach</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground text-sm">
                    Vault is empty.
                  </td>
                </tr>
              ) : (
                entries.map((e) => {
                  const reveal = revealed[e.id];
                  const token = scoreToToken(
                    e.score >= 90
                      ? "Fortress"
                      : e.score >= 70
                        ? "Strong"
                        : e.score >= 50
                          ? "Moderate"
                          : "Weak",
                  );
                  return (
                    <tr key={e.id} className="border-b border-border/60 hover:bg-background/30">
                      <td className="p-3 font-medium">{e.target}</td>
                      <td className="p-3 text-muted-foreground font-mono text-xs">{e.identity}</td>
                      <td className="p-3 font-mono text-xs">
                        {reveal ? e.secret : "•".repeat(Math.min(16, e.secret.length))}
                      </td>
                      <td className="p-3">
                        <span
                          className={`${token.bg} ${token.color} px-1.5 py-0.5 rounded text-[10px] font-mono`}
                        >
                          {e.score}
                        </span>
                      </td>
                      <td className="p-3">
                        <BreachPill status={e.breach} count={0} />
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setRevealed({ ...revealed, [e.id]: !reveal })}
                          >
                            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(e.secret);
                              toast.success("Copied");
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => remove(e.id)}
                            className="text-[color:var(--destructive)] hover:text-[color:var(--destructive)]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
