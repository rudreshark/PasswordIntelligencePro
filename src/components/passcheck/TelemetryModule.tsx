import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Analysis, BreachStatus } from "@/lib/password";
import { CipherInput } from "./CipherInput";

export function TelemetryModule(props: {
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
}) {
  const {
    alpha,
    beta,
    setAlpha,
    setBeta,
    showAlpha,
    showBeta,
    setShowAlpha,
    setShowBeta,
    aAnalysis,
    bAnalysis,
    alphaBreach,
    betaBreach,
  } = props;

  const radarData = aAnalysis.radar.map((r, i) => ({
    axis: r.axis,
    Alpha: r.value,
    Beta: bAnalysis.radar[i].value,
  }));

  return (
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
          <Badge variant="outline" className="font-mono text-[10px]">
            5-axis
          </Badge>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
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
            <span className="h-2 w-2 rounded-full bg-[color:var(--warning)]" /> Beta{" "}
            {bAnalysis.score}
          </span>
        </div>
      </Card>
    </div>
  );
}
