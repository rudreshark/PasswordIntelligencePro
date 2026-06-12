import { useState } from "react";
import { Shield, Eye, EyeOff, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { checkHIBP, type BreachStatus } from "@/lib/password";

export function BreachModule({
  breachEnabled,
  setBreachEnabled,
}: {
  breachEnabled: boolean;
  setBreachEnabled: (v: boolean) => void;
}) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [result, setResult] = useState<{ count: number; status: BreachStatus } | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!pw) return;
    setBusy(true);
    setResult({ count: 0, status: "checking" });
    try {
      const count = await checkHIBP(pw);
      setResult({ count, status: count > 0 ? "breached" : "safe" });
    } catch {
      setResult({ count: 0, status: "unknown" });
      toast.error("HIBP check failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="bg-card/60 backdrop-blur border-border p-5 space-y-4 hover-lift card-glow">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-wide uppercase">Breach Verification</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Computes a local SHA-1 of the input and sends only the first 5 hex characters to the HIBP
          range API (k-anonymity model). The raw password never leaves your browser.
        </p>

        <div className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2.5">
          <Label className="text-xs">Enable HIBP lookups</Label>
          <Switch checked={breachEnabled} onCheckedChange={setBreachEnabled} />
        </div>

        <div className="relative">
          <Input
            type={show ? "text" : "password"}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Enter cipher to check"
            className="font-mono pr-10 bg-background/60 border-border"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Button
          onClick={run}
          disabled={!pw || busy || !breachEnabled}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {busy ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Shield className="h-4 w-4 mr-2" />
          )}
          Run breach scan
        </Button>
        {!breachEnabled && (
          <p className="text-[11px] text-[color:var(--warning)]">
            HIBP lookups are currently disabled — enable them above or via the header toggle.
          </p>
        )}
      </Card>

      <Card className="bg-card/60 backdrop-blur border-border p-5 space-y-4 hover-lift card-glow">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Result
        </h3>
        {!result ? (
          <div className="text-muted-foreground text-sm">No scan run yet.</div>
        ) : result.status === "checking" ? (
          <div className="text-primary text-sm flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" /> Querying HIBP…
          </div>
        ) : result.status === "safe" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[color:var(--success)]/10 border border-[color:var(--success)]/30">
              <CheckCircle2 className="h-7 w-7 text-[color:var(--success)]" />
              <div>
                <div className="font-semibold">Not found in known breaches</div>
                <div className="text-xs text-muted-foreground">
                  This does not guarantee absolute safety — only that this exact string is not in
                  HIBP's corpus.
                </div>
              </div>
            </div>
          </div>
        ) : result.status === "breached" ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-[color:var(--destructive)]/10 border border-[color:var(--destructive)]/30">
            <XCircle className="h-7 w-7 text-[color:var(--destructive)]" />
            <div>
              <div className="font-semibold text-[color:var(--destructive)]">
                Breached — seen {result.count.toLocaleString()} times
              </div>
              <div className="text-xs text-muted-foreground">
                Discard this credential. It is in public breach corpora.
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">Check unavailable.</div>
        )}
      </Card>
    </div>
  );
}
