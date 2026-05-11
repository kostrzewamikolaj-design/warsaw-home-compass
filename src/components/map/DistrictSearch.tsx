import { useState } from "react";
import { DISTRICTS } from "@/data/districts";
import { useCalcStore } from "@/store/useCalcStore";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function DistrictSearch() {
  const [q, setQ] = useState("");
  const selected = useCalcStore((s) => s.settings.districtSlug);
  const select = useCalcStore((s) => s.selectDistrict);
  const filtered = DISTRICTS.filter((d) =>
    d.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-elegant)]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search Warsaw district…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="mt-2 max-h-56 overflow-y-auto">
        {filtered.map((d) => (
          <button
            key={d.slug}
            onClick={() => select(d.slug)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-muted",
              selected === d.slug && "bg-primary/15 text-primary",
            )}
          >
            <span>{d.name}</span>
            <span className="text-xs text-muted-foreground">{d.pricePerM2.toLocaleString("pl-PL")} PLN/m²</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="px-2 py-3 text-sm text-muted-foreground">No districts match.</div>
        )}
      </div>
    </div>
  );
}
