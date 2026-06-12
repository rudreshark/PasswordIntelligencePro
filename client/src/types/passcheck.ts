import type { Analysis, BreachStatus } from "@/lib/password";

export interface VaultEntry {
  id: string;
  target: string;
  identity: string;
  secret: string;
  score: number;
  breach: BreachStatus;
  createdAt: number;
}

export const VAULT_KEY = "passcheck.vault.v1";
export const BREACH_PREF_KEY = "passcheck.breachCheck.v1";
