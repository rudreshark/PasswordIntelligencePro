import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface VaultLoginProps {
  onLogin: () => void;
}

export function VaultLogin({ onLogin }: VaultLoginProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  // Check if vault password exists
  useEffect(() => {
    const hasVaultPassword = localStorage.getItem("vault-master-password-hash");
    setIsRegistering(!hasVaultPassword);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter a password");
      return;
    }

    if (isRegistering) {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }
      // Save a simple hash for now (for demo purposes)
      // In real life, use bcrypt or similar
      const hash = btoa(password); // Simple base64, not secure for production!
      localStorage.setItem("vault-master-password-hash", hash);
      toast.success("Vault master key created!");
      onLogin();
    } else {
      // Verify password
      const storedHash = localStorage.getItem("vault-master-password-hash");
      const hash = btoa(password);
      if (storedHash === hash) {
        toast.success("Welcome back! Vault unlocked!");
        onLogin();
      } else {
        toast.error("Incorrect master password!");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <Card className="w-full max-w-md p-8 space-y-6 bg-card/60 backdrop-blur border-border hover-lift card-glow animated-float">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {isRegistering ? "Set Up Your Vault" : "Access Your Vault"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isRegistering
              ? "Create a secure master password to protect your vault"
              : "Enter your master password to unlock your vault"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vault-password">Master Password</Label>
            <div className="relative">
              <Input
                id="vault-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter master password"
                className="pr-10 bg-background/60 border-border"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isRegistering && (
            <div className="space-y-2">
              <Label htmlFor="vault-confirm-password">Confirm Master Password</Label>
              <div className="relative">
                <Input
                  id="vault-confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm master password"
                  className="pr-10 bg-background/60 border-border"
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            {isRegistering ? "Create Vault" : "Unlock Vault"}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          <p>
            <ShieldCheck className="h-3 w-3 inline mr-1" />
            Your master password is used to protect your vault locally.
          </p>
        </div>
      </Card>
    </div>
  );
}
