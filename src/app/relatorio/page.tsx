import type { Metadata } from "next";
import { buildSales, STORES } from "@/lib/sales";
import Report from "./Report";

export const metadata: Metadata = { title: "Relatório de faturação" };

export default function RelatorioPage() {
  return <Report rows={buildSales()} stores={STORES} />;
}
