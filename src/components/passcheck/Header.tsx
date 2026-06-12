import { Shield, Cpu, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function Header({
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
    <header className="relative border-b border-border bg-card/60 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-5 max-w-7xl flex items-center justify-end gap-4 flex-wrap">
        <div className="flex items-center gap-3">
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
