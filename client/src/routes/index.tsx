import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Shield,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  RefreshCw,
  Lock,
  Activity,
  KeyRound,
  Database,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Cpu,
  Wifi,
  WifiOff,
} from "lucide-react";
import { VaultLogin } from "@/components/passcheck/VaultLogin";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import {
  analyze,
  generatePassword,
  generatePassphrase,
  checkHIBP,
  DEFAULT_POLICIES,
  type Analysis,
  type BreachStatus,
} from "@/lib/password";
import { cloudStorage } from "@/lib/cloud";
import { logAPI } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PassIntell Pro — Premium Password Intelligence" },
      {
        name: "description",
        content:
          "Premium client-side password intelligence: dual telemetry, CSPRNG generation, k-anonymity breach checks, encrypted vault, and compliance audit.",
      },
      { property: "og:title", content: "PassIntell Pro — Premium Password Intelligence" },
      {
        property: "og:description",
        content:
          "Advanced offline-first password analysis, generation and breach intelligence in a single dashboard.",
      },
    ],
  }),
  component: PassCheckMatrix,
});

/* ---------------------------------- types --------------------------------- */

interface VaultEntry {
  id: string;
  target: string;
  identity: string;
  secret: string;
  score: number;
  breach: BreachStatus;
  createdAt: number;
}

const VAULT_KEY = "passcheck.vault.v1";
const BREACH_PREF_KEY = "passcheck.breachCheck.v1";

/* -------------------------------- helpers --------------------------------- */

const scoreToToken = (label: Analysis["label"]) => {
  switch (label) {
    case "Fortress":
    case "Strong":
      return { color: "text-[color:var(--success)]", bg: "bg-[color:var(--success)]/15", ring: "ring-[color:var(--success)]/30" };
    case "Moderate":
      return { color: "text-[color:var(--warning)]", bg: "bg-[color:var(--warning)]/15", ring: "ring-[color:var(--warning)]/30" };
    case "Weak":
    case "Critical":
      return { color: "text-[color:var(--destructive)]", bg: "bg-[color:var(--destructive)]/15", ring: "ring-[color:var(--destructive)]/30" };
    default:
      return { color: "text-muted-foreground", bg: "bg-muted/30", ring: "ring-border" };
  }
};

function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* ---------------------------- breach hook -------------------------------- */

function useBreachCheck(password: string, enabled: boolean) {
  const [status, setStatus] = useState<BreachStatus>("unknown");
  const [count, setCount] = useState(0);
  const debounced = useDebounced(password, 500);
  const reqId = useRef(0);

  useEffect(() => {
    if (!enabled || !debounced) {
      setStatus("unknown");
      setCount(0);
      return;
    }
    const id = ++reqId.current;
    setStatus("checking");
    checkHIBP(debounced)
      .then((c) => {
        if (id !== reqId.current) return;
        setCount(c);
        setStatus(c > 0 ? "breached" : "safe");
      })
      .catch(() => {
        if (id !== reqId.current) return;
        setStatus("unknown");
      });
  }, [debounced, enabled]);

  return { status, count };
}

/* ----------------------------- background ------------------------------- */
function BackgroundGrid() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
        }}
      />
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-primary)" }}
      />
    </div>
  );
}

/* -------------------------------- header --------------------------------- */
function Header({
  breachEnabled,
  setBreachEnabled,
  wafActive,
  ipAddress,
}: {
  breachEnabled: boolean;
  setBreachEnabled: (v: boolean) => void;
  wafActive: boolean;
  ipAddress: string;
}) {
  return (
    <header className="relative border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">
              PassIntell Pro
            </h1>
            <p className="text-xs text-muted-foreground">
              Securing your digital identity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* WAF Popup Badge */}
          <div className="relative group">
            <Badge className="bg-[color:var(--success)]/15 text-[color:var(--success)] border border-[color:var(--success)]/30 font-mono gap-1.5 cursor-pointer">
              <Shield className="h-3 w-3 animate-pulse" /> WAF Active
            </Badge>
            {/* Popup */}
            <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-xl p-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">WAF Status</span>
                  <span className="flex items-center gap-1 text-[color:var(--success)] text-xs">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--success)] animate-pulse" /> Active
                  </span>
                </div>
                <div className="border-t border-border pt-2">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Your IP Address</span>
                  <div className="font-mono text-sm text-foreground mt-1">{ipAddress}</div>
                </div>
              </div>
            </div>
          </div>
          
          <Badge variant="outline" className="font-mono gap-1.5 border-border bg-card">
            <Cpu className="h-3 w-3 text-primary" /> Web Crypto
          </Badge>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            {breachEnabled ? (
              <Wifi className="h-3.5 w-3.5 text-[color:var(--success)]" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <Label htmlFor="breach-toggle" className="text-xs cursor-pointer">
              HIBP
            </Label>
            <Switch id="breach-toggle" checked={breachEnabled} onCheckedChange={setBreachEnabled} />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------- cipher input component ------------------------- */
function CipherInput(props: {
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
    <Card className={`bg-card/60 backdrop-blur border-border p-4 ring-1 ${token.ring}`}>
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
          <div className="rounded-md border border-border bg-background/50 px-2 py-1.5">
            <div className="text-muted-foreground text-[9px] tracking-widest">LEN</div>
            <div className="text-foreground">{analysis.length}</div>
          </div>
          <div className="rounded-md border border-border bg-background/50 px-2 py-1.5">
            <div className="text-muted-foreground text-[9px] tracking-widest">POOL</div>
            <div className="text-foreground">{analysis.poolSize}</div>
          </div>
          <div className="rounded-md border border-border bg-background/50 px-2 py-1.5">
            <div className="text-muted-foreground text-[9px] tracking-widest">ENTROPY</div>
            <div className="text-foreground">{analysis.entropyBits.toFixed(1)}b</div>
          </div>
          <div className="rounded-md border border-border bg-background/50 px-2 py-1.5">
            <div className="text-muted-foreground text-[9px] tracking-widest">CRACK</div>
            <div className="text-foreground">{analysis.crackEstimate}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              analysis.flags.hasLower
                ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]"
                : "border-border bg-background/30 text-muted-foreground"
            }`}
          >
            a-z
          </span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              analysis.flags.hasUpper
                ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]"
                : "border-border bg-background/30 text-muted-foreground"
            }`}
          >
            A-Z
          </span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              analysis.flags.hasDigit
                ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]"
                : "border-border bg-background/30 text-muted-foreground"
            }`}
          >
            0-9
          </span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              analysis.flags.hasSymbol
                ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]"
                : "border-border bg-background/30 text-muted-foreground"
            }`}
          >
            sym
          </span>
          {breach.status === "unknown" ? (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-background/30 text-muted-foreground">
              breach: off
            </span>
          ) : breach.status === "checking" ? (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-primary/40 bg-primary/10 text-primary">
              scanning…
            </span>
          ) : breach.status === "safe" ? (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]">
              no breach hit
            </span>
          ) : (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[color:var(--destructive)]/50 bg-[color:var(--destructive)]/15 text-[color:var(--destructive)]">
              breached · {breach.count.toLocaleString()}
            </span>
          )}
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

/* --------------------------- telemetry module ---------------------------- */
function TelemetryModule(props: {
  alpha: string;
  beta: string;
  setAlpha: (v: string) => void;
  setBeta: (v: string) => void;
  showAlpha: boolean;
  showBeta: boolean;
  setShowAlpha: (v: boolean) => void;
  setShowBeta: (v: boolean) => void;
  aAnalysis: Analysis;
  bAnalysis: Analysis;
  alphaBreach: { status: BreachStatus; count: number };
  betaBreach: { status: BreachStatus; count: number };
  breachEnabled: boolean;
  onAnalyze: () => void;
}) {
  const {
    alpha, beta, setAlpha, setBeta, showAlpha, showBeta,
    setShowAlpha, setShowBeta, aAnalysis, bAnalysis, alphaBreach, betaBreach,
    onAnalyze
  } = props;

  const radarData = aAnalysis.radar.map((r, i) => ({
    axis: r.axis,
    Alpha: r.value,
    Beta: bAnalysis.radar[i].value,
  }));

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <CipherInput
            label="Candidate Cipher Alpha"
            tag="α"
            value={alpha}
            onChange={setAlpha}
            show={showAlpha}
            onToggleShow={() => setShowAlpha(!showAlpha)}
            analysis={aAnalysis}
            breach={alphaBreach}
          />
          <CipherInput
            label="Candidate Cipher Beta"
            tag="β"
            value={beta}
            onChange={setBeta}
            show={showBeta}
            onToggleShow={() => setShowBeta(!showBeta)}
            analysis={bAnalysis}
            breach={betaBreach}
          />
        </div>

        <Card className="bg-card/60 backdrop-blur border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
              Telemetry Radar
            </h3>
            <Badge variant="outline" className="font-mono text-[10px]">5-axis</Badge>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} stroke="var(--border)" />
                <Radar
                  name="Alpha"
                  dataKey="Alpha"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.35}
                />
                <Radar
                  name="Beta"
                  dataKey="Beta"
                  stroke="var(--warning)"
                  fill="var(--warning)"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs mt-2">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" /> Alpha {aAnalysis.score}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[color:var(--warning)]" /> Beta {bAnalysis.score}
            </span>
          </div>
        </Card>
      </div>
      
      <div className="flex justify-center">
        <Button onClick={onAnalyze} className="bg-primary hover:bg-primary/90">
          <Activity className="h-4 w-4 mr-2" /> Analyze Passwords
        </Button>
      </div>
    </div>
  );
}

/* --------------------------- generator module ---------------------------- */
function GeneratorModule({
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
      <Card className="bg-card/60 backdrop-blur border-border p-5 space-y-5">
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
              <label className="flex items-center justify-between gap-2 rounded-md border border-border bg-background/40 px-3 py-2 cursor-pointer hover:bg-background/70">
                <span className="text-xs">Lowercase a-z</span>
                <Switch checked={lower} onCheckedChange={setLower} />
              </label>
              <label className="flex items-center justify-between gap-2 rounded-md border border-border bg-background/40 px-3 py-2 cursor-pointer hover:bg-background/70">
                <span className="text-xs">Uppercase A-Z</span>
                <Switch checked={upper} onCheckedChange={setUpper} />
              </label>
              <label className="flex items-center justify-between gap-2 rounded-md border border-border bg-background/40 px-3 py-2 cursor-pointer hover:bg-background/70">
                <span className="text-xs">Digits 0-9</span>
                <Switch checked={digits} onCheckedChange={setDigits} />
              </label>
              <label className="flex items-center justify-between gap-2 rounded-md border border-border bg-background/40 px-3 py-2 cursor-pointer hover:bg-background/70">
                <span className="text-xs">Symbols !@#</span>
                <Switch checked={symbols} onCheckedChange={setSymbols} />
              </label>
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

        <Button onClick={generate} disabled={working} className="w-full bg-primary hover:bg-primary/90">
          <RefreshCw className={`h-4 w-4 mr-2 ${working ? "animate-spin" : ""}`} />
          {working ? "Generating…" : "Regenerate"}
        </Button>

        <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-3">
          Never base your password on personal data — names, interests, birthdays. Predictability is
          the enemy of entropy.
        </p>
      </Card>

      <Card className={`bg-card/60 backdrop-blur border-border p-5 space-y-4 ring-1 ${token.ring}`}>
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
              toast.success("Loaded into Cipher Alpha & switched to Telemetry");
            }}
          >
            <Activity className="h-4 w-4 mr-2" /> Send to Telemetry
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-1">
          <div className="rounded-md border border-border bg-background/50 px-2 py-1.5">
            <div className="text-muted-foreground text-[9px] tracking-widest">ENTROPY</div>
            <div className="text-foreground">{analysis.entropyBits.toFixed(1)}b</div>
          </div>
          <div className="rounded-md border border-border bg-background/50 px-2 py-1.5">
            <div className="text-muted-foreground text-[9px] tracking-widest">POOL</div>
            <div className="text-foreground">{analysis.poolSize}</div>
          </div>
          <div className="rounded-md border border-border bg-background/50 px-2 py-1.5">
            <div className="text-muted-foreground text-[9px] tracking-widest">CRACK</div>
            <div className="text-foreground">{analysis.crackEstimate}</div>
          </div>
        </div>

        {breach === "breached" && (
          <div className="flex items-center gap-2 text-xs text-[color:var(--destructive)] border border-[color:var(--destructive)]/40 rounded-md p-2 bg-[color:var(--destructive)]/10">
            <AlertTriangle className="h-4 w-4" />
            Could not produce a non-breached candidate after retries — regenerate.
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------------------- breach module ------------------------------- */
function BreachModule({
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
      <Card className="bg-card/60 backdrop-blur border-border p-5 space-y-4">
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

        <Button onClick={run} disabled={!pw || busy || !breachEnabled} className="w-full bg-primary hover:bg-primary/90">
          {busy ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
          Run breach scan
        </Button>
        {!breachEnabled && (
          <p className="text-[11px] text-[color:var(--warning)]">
            HIBP lookups are currently disabled — enable them above or via the header toggle.
          </p>
        )}
      </Card>

      <Card className="bg-card/60 backdrop-blur border-border p-5 space-y-4">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Result</h3>
        {!result ? (
          <div className="text-muted-foreground text-sm">No scan run yet.</div>
        ) : result.status === "checking" ? (
          <div className="text-primary text-sm flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" /> Querying HIBP…
          </div>
        ) : result.status === "safe" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[color:var(--success)]/10 border border-[color:var(--success)]/30">
              <CheckCircle2 className="h-6 w-6 text-[color:var(--success)]" />
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
            <XCircle className="h-6 w-6 text-[color:var(--destructive)]" />
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

/* ----------------------------- vault module ------------------------------- */
function VaultModule({ breachEnabled }: { breachEnabled: boolean }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [target, setTarget] = useState("");
  const [identity, setIdentity] = useState("");
  const [secret, setSecret] = useState("");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  
  // Check if user is already logged in (session-like)
  useEffect(() => {
    const session = localStorage.getItem("vault-session");
    if (session) {
      setIsLoggedIn(true);
    }
  }, []);

  // load
  useEffect(() => {
    if (isLoggedIn) {
      loadVault();
    }
  }, [isLoggedIn]);

  const loadVault = () => {
    try {
      const raw = localStorage.getItem(VAULT_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setEntries(data);
      }
    } catch {
      console.error("Failed to load vault");
    }
  };

  const handleLogin = () => {
    localStorage.setItem("vault-session", "active");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("vault-session");
    setIsLoggedIn(false);
  };

  const persist = (next: VaultEntry[]) => {
    setEntries(next);
    localStorage.setItem(VAULT_KEY, JSON.stringify(next));
  };

  const generateRandomPassword = () => {
    const newPassword = generatePassword({
      length: 16,
      lower: true,
      upper: true,
      digits: true,
      symbols: true,
    });
    setSecret(newPassword);
    toast.success("Password generated!");
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
    toast.success("Vault entry stored!");
  };

  const remove = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
  };

  if (!isLoggedIn) {
    return <VaultLogin onLogin={handleLogin} />;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/60 backdrop-blur border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-bold tracking-wide">✨ PASSINTELL PRO VAULT ✨</h3>
          <Badge variant="outline" className="ml-auto font-mono text-[10px]">
            Local Storage
          </Badge>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleLogout}
          >
            Logout
          </Button>
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
            <div className="flex gap-2 mt-1">
              <Input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="secret"
                className="bg-background/60 border-border font-mono flex-1"
              />
              <Button 
                onClick={generateRandomPassword} 
                variant="secondary" 
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Generate
              </Button>
            </div>
          </div>
          <div className="md:col-span-1 flex items-end">
            <Button 
              onClick={add} 
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Lock className="h-4 w-4 mr-2" /> Store
            </Button>
          </div>
        </div>

        <p className="text-[11px] text-[color:var(--warning)] mt-3 flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3" />
          Records are stored in your browser's LocalStorage.
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
                    e.score >= 90 ? "Fortress" : e.score >= 70 ? "Strong" : e.score >= 50 ? "Moderate" : "Weak"
                  );
                  return (
                    <tr key={e.id} className="border-b border-border/60 hover:bg-background/30">
                      <td className="p-3 font-medium">{e.target}</td>
                      <td className="p-3 text-muted-foreground font-mono text-xs">{e.identity}</td>
                      <td className="p-3 font-mono text-xs">
                        {reveal ? e.secret : "•".repeat(Math.min(16, e.secret.length))}
                      </td>
                      <td className="p-3">
                        <span className={`${token.bg} ${token.color} px-1.5 py-0.5 rounded text-[10px] font-mono`}>
                          {e.score}
                        </span>
                      </td>
                      <td className="p-3">
                        {e.breach === "unknown" ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-background/30 text-muted-foreground">
                            breach: off
                          </span>
                        ) : e.breach === "safe" ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]">
                            no breach hit
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[color:var(--destructive)]/50 bg-[color:var(--destructive)]/15 text-[color:var(--destructive)]">
                            breached
                          </span>
                        )}
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

/* ---------------------------- audit module ------------------------------- */
function AuditModule({ alpha, beta }: { alpha: Analysis; beta: Analysis }) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(DEFAULT_POLICIES.map((p) => [p.id, true]))
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
  const violations: { subject: string; rule: typeof DEFAULT_POLICIES[number] }[] = [];
  for (const s of subjects)
    for (const r of activePolicies) if (!r.test(s.analysis)) violations.push({ subject: s.name, rule: r });

  const compliant = subjects.length > 0 && violations.length === 0;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="bg-card/60 backdrop-blur border-border p-5 lg:col-span-1">
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

      <Card className="bg-card/60 backdrop-blur border-border p-5 lg:col-span-2 space-y-4">
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
              <div className="font-semibold">All {subjects.length} subject(s) pass active policies.</div>
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

/* ============================= main page ================================ */
function PassCheckMatrix() {
  const [activeTab, setActiveTab] = useState("telemetry");
  const [alpha, setAlpha] = useState("");
  const [beta, setBeta] = useState("");
  const [showAlpha, setShowAlpha] = useState(false);
  const [showBeta, setShowBeta] = useState(false);
  const [breachEnabled, setBreachEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(BREACH_PREF_KEY) === "1";
  });
  
  // WAF / IP state
  const [ip, setIp] = useState<string>("Loading...");

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem(BREACH_PREF_KEY, breachEnabled ? "1" : "0");
  }, [breachEnabled]);

  const alphaBreach = useBreachCheck(alpha, breachEnabled);
  const betaBreach = useBreachCheck(beta, breachEnabled);

  const aAnalysis = useMemo(() => analyze(alpha, alphaBreach.status), [alpha, alphaBreach.status]);
  const bAnalysis = useMemo(() => analyze(beta, betaBreach.status), [beta, betaBreach.status]);

  // Initialize IP & WAF log
  useEffect(() => {
    const init = async () => {
      let detectedIp: string | null = null;
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        if (res.ok) {
          const data = await res.json();
          detectedIp = data.ip;
        }
      } catch (e) {
        try {
          const res = await fetch("https://api.my-ip.com/ip");
          if (res.ok) {
            detectedIp = (await res.text()).trim();
          }
        } catch (e2) {
          console.warn("Failed to detect IP");
        }
      }
      
      const finalIp = detectedIp || "IP Detection Unavailable";
      setIp(finalIp);
      
      // Log initial visit
      try {
        await logAPI.addLog({
          ip_address: finalIp === "IP Detection Unavailable" ? null : finalIp,
          action: "PassIntell Pro Loaded",
          status: "Success",
          user_agent: navigator.userAgent || null
        });
      } catch (e) {
        // Fail silently if no Supabase config
      }
    };
    init();
  }, []);

  const handleSendToTelemetry = (password: string) => {
    setAlpha(password);
    setActiveTab("telemetry");
  };

  const handleAnalyze = async () => {
    toast.success("Analysis complete!");
    try {
      await logAPI.addLog({
        ip_address: ip === "Loading..." || ip === "IP Detection Unavailable" ? null : ip,
        action: "Password Analysis Performed",
        status: "Success",
        user_agent: navigator.userAgent || null
      });
    } catch (e) {
      // Fail silently
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BackgroundGrid />
      <Header 
        breachEnabled={breachEnabled} 
        setBreachEnabled={setBreachEnabled}
        wafActive={true}
        ipAddress={ip}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full bg-card/60 backdrop-blur border border-border h-auto p-1">
            <TabsTrigger value="telemetry" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2 py-2.5">
              <Activity className="h-4 w-4" /> Telemetry
            </TabsTrigger>
            <TabsTrigger value="generator" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2 py-2.5">
              <KeyRound className="h-4 w-4" /> Generator
            </TabsTrigger>
            <TabsTrigger value="breach" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2 py-2.5">
              <Shield className="h-4 w-4" /> Breach Intel
            </TabsTrigger>
            <TabsTrigger value="vault" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2 py-2.5">
              <Database className="h-4 w-4" /> Vault
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2 py-2.5">
              <ClipboardCheck className="h-4 w-4" /> Audit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="telemetry" className="mt-6">
            <TelemetryModule
              alpha={alpha}
              beta={beta}
              setAlpha={setAlpha}
              setBeta={setBeta}
              showAlpha={showAlpha}
              showBeta={showBeta}
              setShowAlpha={setShowAlpha}
              setShowBeta={setShowBeta}
              aAnalysis={aAnalysis}
              bAnalysis={bAnalysis}
              alphaBreach={alphaBreach}
              betaBreach={betaBreach}
              breachEnabled={breachEnabled}
              onAnalyze={handleAnalyze}
            />
          </TabsContent>

          <TabsContent value="generator" className="mt-6">
            <GeneratorModule breachEnabled={breachEnabled} onUse={handleSendToTelemetry} />
          </TabsContent>

          <TabsContent value="breach" className="mt-6">
            <BreachModule breachEnabled={breachEnabled} setBreachEnabled={setBreachEnabled} />
          </TabsContent>

          <TabsContent value="vault" className="mt-6">
            <VaultModule breachEnabled={breachEnabled} />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <AuditModule alpha={aAnalysis} beta={bAnalysis} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="container mx-auto px-4 py-8 max-w-7xl text-xs text-muted-foreground border-t border-border mt-12 space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Terms of Service</h3>
          <p>
            PassIntell Pro is a client-side password intelligence tool. The service is provided "as is" without any warranties. 
            Users are solely responsible for the security and management of their passwords and vault data. 
            We do not store, transmit, or have access to any of your personal data or passwords.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          <p>
            PassIntell Pro runs entirely in your browser. Optional breach checks use the{" "}
            <a
              href="https://haveibeenpwned.com/API/v3#PwnedPasswords"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              HIBP Pwned Passwords
            </a>{" "}
            k-anonymity range API — only the first 5 chars of a local SHA-1 hash leave your device.
          </p>
          <div className="text-right space-y-1">
            <p className="font-medium">© {new Date().getFullYear()} PassIntell Pro. All rights reserved.</p>
            <p className="text-[10px]">Developed by rudresha rk</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
