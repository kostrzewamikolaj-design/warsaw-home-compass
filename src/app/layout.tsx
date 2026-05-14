import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warsaw Home Compass",
  description: "Narzędzie do porównania najmu i zakupu mieszkania w Warszawie."
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
