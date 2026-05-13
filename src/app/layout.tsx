import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warsaw Rent vs Buy",
  description: "Interactive Warsaw district rent-vs-buy Monte Carlo calculator"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
