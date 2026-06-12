import { useState, useEffect, useMemo } from "react";
import { RefreshCw, KeyRound, Copy, Activity, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  analyze,
  generatePassword,
  generatePassphrase,
  checkHIBP,
  type BreachStatus,
} from "@/lib/password";
import { scoreToToken } from "@/lib/passcheck-utils";
import { Metric } from "./Metric";
import { PoolToggle } from "./PoolToggle";

export function GeneratorModule({
  breachEnabled,
  onUse,
}: {
  breachEnabled: boolean;
  onUse: (p: string) => void;
}) {
  const [length, setLength] = useState(20);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [mode, setMode] = useState<"password" | "passphrase">("password");
  const [wordCount, setWordCount] = useState(4);
  const [output, setOutput] = useState("");
  const [working, setWorking] = useState(false);
  const [breach, setBreach] = useState<BreachStatus>("unknown");

  const generate = async () => {
    setWorking(true);
    setBreach("unknown");
    try {
      let candidate = "";
      const maxRetries = breachEnabled ? 5 : 1;
      for (let i = 0; i < maxRetries; i++) {
        candidate =
          mode === "password"
            ? generatePassword({ length, lower, upper, digits, symbols })
            : generatePassphrase(wordCount, "-");
        if (!breachEnabled) break;
        setBreach("checking");
        const count = await checkHIBP(candidate).catch(() => 0);
        if (count === 0) {
          setBreach("safe");
          break;
        }
        if (i === maxRetries - 1) setBreach("breached");
      }
      setOutput(candidate);
    } finally {
      setWorking(false);
    }
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const analysis = useMemo(() => analyze(output, breach), [output, breach]);
  const token = scoreToToken(analysis.label);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="bg-card/60 backdrop-blur border-border p-5 space-y-5 hover-lift card-glow">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-wide uppercase">CSPRNG Array</h3>
          <Badge variant="outline" className="ml-auto font-mono text-[10px]">
            crypto.getRandomValues
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === "password" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("password")}
            className={mode === "password" ? "bg-primary hover:bg-primary/90" : ""}
          >
            Password
          </Button>
          <Button
            type="button"
            variant={mode === "passphrase" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("passphrase")}
            className={mode === "passphrase" ? "bg-primary hover:bg-primary/90" : ""}
          >
            Passphrase
          </Button>
        </div>

        {mode === "password" ? (
          <>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <Label>Length</Label>
                <span className="font-mono text-primary">{length}</span>
              </div>
              <Slider
                value={[length]}
                min={8}
                max={64}
                step={1}
                onValueChange={(v) => setLength(v[0])}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <PoolToggle label="Lowercase a-z" value={lower} onChange={setLower} />
              <PoolToggle label="Uppercase A-Z" value={upper} onChange={setUpper} />
              <PoolToggle label="Digits 0-9" value={digits} onChange={setDigits} />
              <PoolToggle label="Symbols !@#" value={symbols} onChange={setSymbols} />
            </div>
          </>
        ) : (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <Label>Word count</Label>
              <span className="font-mono text-primary">{wordCount}</span>
            </div>
            <Slider
              value={[wordCount]}
              min={3}
              max={8}
              step={1}
              onValueChange={(v) => setWordCount(v[0])}
            />
          </div>
        )}

        <Button
          onClick={generate}
          disabled={working}
          className="w-full bg-primary hover:bg-primary/90"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${working ? "animate-spin" : ""}`} />
          {working ? "Generating…" : "Regenerate"}
        </Button>

        <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-3">
          Never base your password on personal data — names, interests, birthdays. Predictability is
          the enemy of entropy.
        </p>
      </Card>

      <Card
        className={`bg-card/60 backdrop-blur border-border p-5 space-y-4 ring-1 ${token.ring} hover-lift card-glow`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Output
          </h3>
          <Badge className={`${token.bg} ${token.color} border-0 font-mono`}>
            {analysis.label}
          </Badge>
        </div>

        <div className="rounded-lg border border-border bg-background/70 p-4 font-mono text-lg break-all min-h-[80px] flex items-center">
          {output || <span className="text-muted-foreground text-sm">—</span>}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(output);
              toast.success("Copied to clipboard");
            }}
          >
            <Copy className="h-4 w-4 mr-2" /> Copy
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onUse(output);
              toast.success("Loaded into Cipher Alpha");
            }}
          >
            <Activity className="h-4 w-4 mr-2" /> Send to Telemetry
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-1">
          <Metric label="ENTROPY" value={`${analysis.entropyBits.toFixed(1)}b`} />
          <Metric label="POOL" value={String(analysis.poolSize)} />
          <Metric label="CRACK" value={analysis.crackEstimate} />
        </div>

        {breach === "breached" && (
          <div className="flex items-center gap-3 text-xs text-[color:var(--destructive)] border border-[color:var(--destructive)]/40 rounded-md p-2 bg-[color:var(--destructive)]/10">
            <AlertTriangle className="h-4 w-4" />
            Could not produce a non-breached candidate after retries — regenerate.
          </div>
        )}
      </Card>
    </div>
  );
}
