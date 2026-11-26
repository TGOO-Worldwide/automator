import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: process.env.APP_NAME ?? "Nova aplicação",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
