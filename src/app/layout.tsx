import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warszawa: najem czy zakup",
  description: "Interaktywny kalkulator najmu i zakupu mieszkania w warszawskich dzielnicach"
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
