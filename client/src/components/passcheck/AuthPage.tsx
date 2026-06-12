import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { OtpVerification } from "./OtpVerification";
import { VaultCreation } from "./VaultCreation";
import { BackgroundGrid } from "./BackgroundGrid";

type AuthStage = "login" | "register" | "otp" | "vault";

export function AuthPage() {
  const [stage, setStage] = useState<AuthStage>("login");
  const [pendingEmail, setPendingEmail] = useState("");

  const handleOtpSent = (email: string) => {
    setPendingEmail(email);
    setStage("otp");
  };

  const handleVerified = () => {
    setStage("vault");
  };

  const handleVaultComplete = () => {
    // Redirect to main app or reload
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <BackgroundGrid />
      
      {stage === "login" && (
        <LoginForm onSwitchToRegister={() => setStage("register")} />
      )}
      
      {stage === "register" && (
        <RegisterForm 
          onSwitchToLogin={() => setStage("login")}
          onOtpSent={handleOtpSent}
        />
      )}
      
      {stage === "otp" && (
        <OtpVerification 
          email={pendingEmail}
          onVerified={handleVerified}
        />
      )}
      
      {stage === "vault" && (
        <VaultCreation onComplete={handleVaultComplete} />
      )}
    </div>
  );
}
