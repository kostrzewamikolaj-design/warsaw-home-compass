import { SCENARIOS } from "@/data/scenarios";
import { useCalcStore } from "@/store/useCalcStore";
import { cn } from "@/lib/utils";
import { User, Users, Home, TrendingUp } from "lucide-react";

const ICONS = {
  single: User,
  couple: Users,
  family: Home,
  investor: TrendingUp,
} as const;

export function ScenarioPicker() {
  const id = useCalcStore((s) => s.settings.scenarioId);
  const setKey = useCalcStore((s) => s.set);
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {SCENARIOS.map((sc) => {
        const Icon = ICONS[sc.id as keyof typeof ICONS] ?? User;
        const active = sc.id === id;
        return (
          <button
            key={sc.id}
            onClick={() => setKey("scenarioId", sc.id)}
            className={cn(
              "group flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
              active
                ? "border-primary bg-primary/10 shadow-[var(--shadow-glow)]"
                : "border-border bg-card hover:border-primary/50",
            )}
          >
            <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
            <span className="text-xs font-semibold leading-tight">{sc.label}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{sc.description}</span>
          </button>
        );
      })}
    </div>
  );
}
