import { ScenarioPicker } from "./ScenarioPicker";
import { SliderRow } from "./SliderRow";
import { useCalcStore, useCurrentDistrict, useCurrentScenario } from "@/store/useCalcStore";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const pln = (v: number) => `${Math.round(v).toLocaleString("pl-PL")} PLN`;

export function CalculatorPanel() {
  const settings = useCalcStore((s) => s.settings);
  const set = useCalcStore((s) => s.set);
  const district = useCurrentDistrict();
  const scenario = useCurrentScenario();
  const price = (settings.pricePerM2Override ?? district.pricePerM2) * scenario.sizeM2;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-elegant)]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">{district.name}</h2>
            <Badge variant="secondary" className="text-[10px]">{district.band}</Badge>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Estimated price</div>
            <div className="text-sm font-semibold tabular-nums">{pln(price)}</div>
          </div>
        </div>
        <ScenarioPicker />
      </div>

      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="mortgage">Mortgage</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="mt-4 space-y-5 rounded-2xl border border-border bg-card p-4">
          <SliderRow
            label="Years in home"
            value={settings.yearsInHome}
            onChange={(v) => set("yearsInHome", v)}
            min={1}
            max={30}
            step={1}
            format={(v) => `${v} yrs`}
          />
          <SliderRow
            label="Home appreciation"
            value={settings.investmentReturn === 0 ? 0 : 0.05}
            onChange={() => {}}
            min={0}
            max={0.1}
            step={0.005}
            format={pct}
            hint={`Set by district band (${district.band}). Slider override coming soon.`}
          />
          <SliderRow
            label="Rent growth"
            value={settings.rentGrowth}
            onChange={(v) => set("rentGrowth", v)}
            min={0}
            max={0.12}
            step={0.005}
            format={pct}
          />
          <SliderRow
            label="Investment return"
            value={settings.investmentReturn}
            onChange={(v) => set("investmentReturn", v)}
            min={0}
            max={0.15}
            step={0.005}
            format={pct}
            hint="ETF / portfolio annual nominal return"
          />
          <SliderRow
            label="Inflation"
            value={settings.inflation}
            onChange={(v) => set("inflation", v)}
            min={0}
            max={0.12}
            step={0.005}
            format={pct}
          />
        </TabsContent>

        <TabsContent value="mortgage" className="mt-4 space-y-5 rounded-2xl border border-border bg-card p-4">
          <SliderRow
            label="Mortgage rate"
            value={settings.rateAnnual}
            onChange={(v) => set("rateAnnual", v)}
            min={0.02}
            max={0.15}
            step={0.0025}
            format={pct}
          />
          <SliderRow
            label="Down payment"
            value={settings.downPaymentPct}
            onChange={(v) => set("downPaymentPct", v)}
            min={0.1}
            max={0.5}
            step={0.01}
            format={pct}
          />
          <SliderRow
            label="Term"
            value={settings.termYears}
            onChange={(v) => set("termYears", v)}
            min={5}
            max={35}
            step={1}
            format={(v) => `${v} yrs`}
          />
          <SliderRow
            label="Origination fee"
            value={settings.originationPct}
            onChange={(v) => set("originationPct", v)}
            min={0}
            max={0.05}
            step={0.0025}
            format={pct}
          />
          <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
            <Label className="text-xs">Rate mode</Label>
            <div className="flex items-center gap-2 text-xs">
              <span className={settings.rateMode === "fixed" ? "text-foreground" : "text-muted-foreground"}>Fixed</span>
              <Switch
                checked={settings.rateMode === "variable"}
                onCheckedChange={(c) => set("rateMode", c ? "variable" : "fixed")}
              />
              <span className={settings.rateMode === "variable" ? "text-foreground" : "text-muted-foreground"}>WIBOR/WIRON</span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
            <Label className="text-xs">Refinancing allowed</Label>
            <Switch checked={settings.refinance} onCheckedChange={(c) => set("refinance", c)} />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
            <Label className="text-xs">Secondary market (PCC 2%)</Label>
            <Switch checked={settings.secondary} onCheckedChange={(c) => set("secondary", c)} />
          </div>
        </TabsContent>

        <TabsContent value="costs" className="mt-4 space-y-5 rounded-2xl border border-border bg-card p-4">
          <SliderRow
            label="HOA per m²"
            value={settings.hoaMonthly}
            onChange={(v) => set("hoaMonthly", v)}
            min={3}
            max={25}
            step={0.5}
            format={(v) => `${v.toFixed(1)} PLN/m²`}
          />
          <SliderRow
            label="HOA escalation"
            value={settings.hoaEscalation}
            onChange={(v) => set("hoaEscalation", v)}
            min={0}
            max={0.1}
            step={0.005}
            format={pct}
          />
          <SliderRow
            label="Maintenance reserve"
            value={settings.maintenancePctOfPrice}
            onChange={(v) => set("maintenancePctOfPrice", v)}
            min={0}
            max={0.03}
            step={0.001}
            format={pct}
            hint="Annual % of property value set aside for upkeep"
          />
          <SliderRow
            label="Insurance"
            value={settings.insuranceAnnual}
            onChange={(v) => set("insuranceAnnual", v)}
            min={200}
            max={3000}
            step={50}
            format={(v) => `${v.toLocaleString("pl-PL")} PLN/yr`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
