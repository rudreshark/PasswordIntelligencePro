import { Switch } from "@/components/ui/switch";

export function PoolToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 rounded-md border border-border bg-background/40 px-3 py-2 cursor-pointer hover:bg-background/70">
      <span className="text-xs">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </label>
  );
}
