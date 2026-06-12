export interface CloudStorageEntry {
  id: string;
  [key: string]: any;
}

export interface CloudStorage {
  get<T extends CloudStorageEntry>(key: string): Promise<T[]>;
  set<T extends CloudStorageEntry>(key: string, data: T[]): Promise<void>;
}

// LocalStorage implementation (fallback)
export class LocalStorageCloudStorage implements CloudStorage {
  async get<T extends CloudStorageEntry>(key: string): Promise<T[]> {
    try {
      const value = localStorage.getItem(key);
      if (!value) return [];
      return JSON.parse(value) as T[];
    } catch {
      return [];
    }
  }

  async set<T extends CloudStorageEntry>(key: string, data: T[]): Promise<void> {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

// Supabase implementation (placeholder - uncomment and add your supabase credentials to use)
/*
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class SupabaseCloudStorage implements CloudStorage {
  async get<T extends CloudStorageEntry>(tableName: string): Promise<T[]> {
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching from Supabase:", error);
      return [];
    }
    
    return data as T[];
  }

  async set<T extends CloudStorageEntry>(tableName: string, data: T[]): Promise<void> {
    // For simplicity, this deletes all and re-inserts (you can optimize this!)
    const { error: deleteError } = await supabase.from(tableName).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (deleteError) {
      console.error("Error deleting from Supabase:", deleteError);
    }
    
    if (data.length > 0) {
      const { error: insertError } = await supabase.from(tableName).insert(data);
      if (insertError) {
        console.error("Error inserting into Supabase:", insertError);
      }
    }
  }
}
*/

// Export the active storage (use LocalStorage for now)
export const cloudStorage: CloudStorage = new LocalStorageCloudStorage();
