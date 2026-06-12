import { createClient } from "@supabase/supabase-js";
import type { VaultEntry } from "@/types/passcheck";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client if config is available
export const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "Supabase credentials not found. Using mock client. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file."
    );
    // Return mock client as fallback
    return {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        onAuthStateChange: () => ({
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        }),
        signInWithPassword: async () => ({ error: null }),
        signUp: async () => ({ error: null }),
        verifyOtp: async () => ({ error: null }),
        signOut: async () => ({ error: null }),
        signInWithOAuth: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({ data: [], error: null })
          })
        }),
        insert: () => ({
          select: () => ({ data: null, error: null })
        })
      })
    } as any;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
})();

// Type for request logs
export interface RequestLog {
  id?: string;
  ip_address: string | null;
  action: string;
  status: string;
  user_agent: string | null;
  created_at?: string;
}

// Log API using Supabase or fallback to localStorage
export const logAPI = {
  async addLog(log: Omit<RequestLog, "id" | "created_at">): Promise<void> {
    try {
      // Try Supabase first
      if (supabaseUrl && supabaseAnonKey) {
        const { error } = await supabase.from("request_logs").insert([log]).select();
        if (error) throw error;
        return;
      }
    } catch (e) {
      console.warn("Failed to log to Supabase, using localStorage fallback:", e);
    }

    // Fallback to localStorage
    const logs = this.getLocalLogs();
    logs.unshift({
      ...log,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    });
    localStorage.setItem("request_logs", JSON.stringify(logs.slice(0, 100)));
  },

  async getLogs(limit = 50): Promise<RequestLog[]> {
    try {
      // Try Supabase first
      if (supabaseUrl && supabaseAnonKey) {
        const { data, error } = await supabase
          .from("request_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);
        if (!error && data) {
          return data;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch logs from Supabase, using localStorage fallback:", e);
    }

    // Fallback to localStorage
    return this.getLocalLogs().slice(0, limit);
  },

  getLocalLogs(): RequestLog[] {
    try {
      const raw = localStorage.getItem("request_logs");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
};

// Vault API with Supabase support
export const vaultAPI = {
  async saveEntry(userId: string, entry: VaultEntry) {
    try {
      // Try Supabase first
      if (supabaseUrl && supabaseAnonKey) {
        const { error } = await supabase.from("vault_entries").insert([
          {
            user_id: userId,
            ...entry
          }
        ]).select();
        if (!error) {
          return await this.getEntries(userId);
        }
      }
    } catch (e) {
      console.warn("Failed to save to Supabase, using localStorage fallback:", e);
    }

    // Fallback to localStorage
    const entries = await this.getEntries(userId);
    const newEntries = [entry, ...entries];
    localStorage.setItem(`vault-${userId}`, JSON.stringify(newEntries));
    return newEntries;
  },

  async getEntries(userId: string): Promise<VaultEntry[]> {
    try {
      // Try Supabase first
      if (supabaseUrl && supabaseAnonKey) {
        const { data, error } = await supabase
          .from("vault_entries")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            target: d.target,
            identity: d.identity,
            secret: d.secret,
            score: d.score,
            breach: d.breach,
            createdAt: d.created_at
          }));
        }
      }
    } catch (e) {
      console.warn("Failed to fetch from Supabase, using localStorage fallback:", e);
    }

    // Fallback to localStorage
    const raw = localStorage.getItem(`vault-${userId}`);
    return raw ? JSON.parse(raw) : [];
  },

  async deleteEntry(userId: string, entryId: string) {
    try {
      // Try Supabase first
      if (supabaseUrl && supabaseAnonKey) {
        const { error } = await supabase.from("vault_entries").delete().eq("id", entryId);
        if (!error) {
          return await this.getEntries(userId);
        }
      }
    } catch (e) {
      console.warn("Failed to delete from Supabase, using localStorage fallback:", e);
    }

    // Fallback to localStorage
    const entries = await this.getEntries(userId);
    const newEntries = entries.filter(e => e.id !== entryId);
    localStorage.setItem(`vault-${userId}`, JSON.stringify(newEntries));
    return newEntries;
  },
};
