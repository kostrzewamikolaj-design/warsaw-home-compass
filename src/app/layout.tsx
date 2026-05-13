import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warsaw Home Compass",
  description: "Polska platforma do porównywania najmu i zakupu mieszkania w warszawskich dzielnicach."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
