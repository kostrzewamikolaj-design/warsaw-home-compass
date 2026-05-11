export interface Scenario {
  id: string;
  label: string;
  description: string;
  sizeM2: number;
  rentMultiplier: number; // adjusts seed rent (which is for 50 m²) for typical asking
}

export const SCENARIOS: Scenario[] = [
  { id: "single", label: "Single (studio)", description: "30 m² studio for one buyer", sizeM2: 30, rentMultiplier: 1 },
  { id: "couple", label: "Couple (2-room)", description: "50 m² 2-room apartment", sizeM2: 50, rentMultiplier: 1 },
  { id: "family", label: "Family (3-room)", description: "75 m² 3-room family flat", sizeM2: 75, rentMultiplier: 1 },
  { id: "investor", label: "Rental investor", description: "45 m² buy-to-let", sizeM2: 45, rentMultiplier: 1 },
];

export const DEFAULT_SCENARIO_ID = "couple";
