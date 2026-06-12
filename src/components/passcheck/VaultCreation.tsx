import { useState } from "react";
import { 
  MessageSquare, 
  CreditCard, 
  GraduationCap, 
  ShoppingCart, 
  Briefcase,
  Plus,
  User,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { generatePassword, analyze } from "@/lib/password";
import { CATEGORIES } from "@/types/categories";
import type { VaultEntry } from "@/types/passcheck";

type VaultCreationProps = {
  onComplete: () => void;
};

const ICON_MAP: Record<string, any> = {
  MessageSquare,
  CreditCard,
  GraduationCap,
  ShoppingCart,
  Briefcase
};

export function VaultCreation({ onComplete }: VaultCreationProps) {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [selectedApp, setSelectedApp] = useState(CATEGORIES[0].apps[0]);
  const [username, setUsername] = useState("");

  const handleAddEntry = async () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    // Generate a secure password using existing logic
    const password = generatePassword({ 
      length: 20, 
      lower: true, 
      upper: true, 
      digits: true, 
      symbols: true 
    });

    // Analyze the password
    const analysis = analyze(password, "unknown");

    const newEntry: VaultEntry = {
      id: crypto.randomUUID(),
      target: selectedApp,
      identity: username,
      secret: password,
      score: analysis.score,
      breach: "unknown",
      createdAt: Date.now()
    };

    // Save to local storage (or Supabase)
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem("passcheck.vault.v1", JSON.stringify(updatedEntries));

    toast.success("Entry added to vault!");
    setUsername("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-semibold tracking-tight">Create Your Vault</h2>
        <p className="text-muted-foreground">Add your first few accounts to get started</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/60 backdrop-blur border-border hover-lift card-glow">
          <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full">
              {CATEGORIES.map((cat) => {
                const Icon = ICON_MAP[cat.icon];
                return (
                  <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{cat.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {CATEGORIES.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} className="space-y-4 mt-4">
                <Label>Select App</Label>
                <div className="grid grid-cols-2 gap-2">
                  {cat.apps.map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedApp === app 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username / Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="you@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-background/60 border-border"
                />
              </div>
            </div>

            <Button onClick={handleAddEntry} className="w-full bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add to Vault
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-card/60 backdrop-blur border-border hover-lift card-glow">
          <h3 className="text-lg font-semibold mb-4">Your Entries</h3>
          {entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No entries yet. Add your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="p-3 rounded-lg border border-border bg-background/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{entry.target}</p>
                    <p className="text-sm text-muted-foreground">{entry.identity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                      Score: {entry.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {entries.length > 0 && (
            <Button onClick={onComplete} className="w-full mt-6">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Complete Setup
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
