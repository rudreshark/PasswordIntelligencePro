import { useState } from "react";
import { Mail, ShieldCheck, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

type OtpVerificationProps = {
  email: string;
  onVerified: () => void;
};

export function OtpVerification({ email, onVerified }: OtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyOtp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email, otp);
      toast.success("Email verified!");
      onVerified();
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      toast.success("Verification code resent!");
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md p-8 space-y-6 bg-card/60 backdrop-blur border-border hover-lift card-glow animated-float">
      <div className="text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Verify Your Email</h2>
        <p className="text-sm text-muted-foreground">We've sent a 6-digit code to {email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} className="w-12 h-12" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
          <ShieldCheck className="h-4 w-4 mr-2" />
          {loading ? "Verifying..." : "Verify Email"}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2"
          disabled={resending}
        >
          <RotateCw className={`h-3 w-3 ${resending ? "animate-spin" : ""}`} />
          {resending ? "Resending..." : "Resend Code"}
        </button>
      </div>
    </Card>
  );
}
