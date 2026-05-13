import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Kalkulator najmu i zakupu mieszkania w Warszawie",
  description: "Porównaj najem, zakup na kredyt i alternatywne inwestowanie kapitału w warszawskich dzielnicach."
};

export default function CalculatorPage() {
  return <Dashboard />;
}
