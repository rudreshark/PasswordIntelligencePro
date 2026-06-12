import { useState, useEffect } from "react";
import { Shield, RefreshCw } from "lucide-react";

interface WAFLog {
  id: string;
  ip: string;
  timestamp: number;
  userAgent: string;
  path: string;
}

export function WAFStatus() {
  const [status, setStatus] = useState<"loading" | "protected" | "error">("loading");

  useEffect(() => {
    const logRequest = async () => {
      try {
        // Fetch IP
        let ip = "unknown";
        try {
          const res = await fetch("https://api.ipify.org?format=json");
          const data = await res.json();
          ip = data.ip;
        } catch (e) {
          console.warn("Could not fetch IP");
        }

        // Log to localStorage
        const existingLogs: WAFLog[] = JSON.parse(localStorage.getItem("waf-logs") || "[]");
        const newLog: WAFLog = {
          id: crypto.randomUUID(),
          ip,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          path: window.location.pathname,
        };
        
        // Keep last 100 logs
        const updatedLogs = [newLog, ...existingLogs].slice(0, 100);
        localStorage.setItem("waf-logs", JSON.stringify(updatedLogs));
        
        setStatus("protected");
      } catch (error) {
        setStatus("error");
      }
    };
    
    logRequest();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-card/80 backdrop-blur border border-border rounded-lg p-3 shadow-xl hover-lift card-glow z-50">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className={`w-6 h-6 ${
            status === "protected" ? "text-green-500" : 
            status === "error" ? "text-red-500" : "text-primary"
          }`} />
          {status === "protected" && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
        <div className="text-sm">
          <div className="font-medium">WAF Active</div>
          <div className="text-xs text-muted-foreground">Security Monitoring</div>
        </div>
      </div>
    </div>
  );
}
