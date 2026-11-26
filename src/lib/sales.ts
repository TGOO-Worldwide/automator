// Dados simulados de faturação (sem banco de dados).
// Gerados com uma semente fixa: os valores são sempre os mesmos a cada carregamento.

export type StoreId = "boston" | "belgica" | "italia";

export type Store = {
  id: StoreId;
  name: string;
  country: string;
  currency: "USD" | "EUR";
  min: number;
  max: number;
  /** Probabilidade de um dia útil não ter faturação. */
  zeroChance: number;
  seed: number;
};

export const STORES: Store[] = [
  { id: "boston", name: "Boston", country: "Estados Unidos", currency: "USD", min: 370, max: 25980, zeroChance: 0, seed: 1101 },
  { id: "belgica", name: "Bélgica", country: "Bélgica", currency: "EUR", min: 900, max: 9620, zeroChance: 0.22, seed: 2202 },
  { id: "italia", name: "Itália", country: "Itália", currency: "EUR", min: 480, max: 14000, zeroChance: 0.28, seed: 3303 },
];

export type DayRow = {
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  weekday: number; // 1 = segunda ... 5 = sexta
  values: Record<StoreId, number>;
};

/** Período: do 1º dia de três meses atrás até hoje. */
export const PERIOD_START = new Date(Date.UTC(2026, 7, 1)); // 1 de agosto de 2026
export const PERIOD_END = new Date(Date.UTC(2026, 10, 26)); // 26 de novembro de 2026

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function amount(store: Store, rand: () => number) {
  if (rand() < store.zeroChance) return 0;
  // Leve concentração nos valores mais baixos, com dias fortes de vez em quando.
  const r = Math.pow(rand(), 1.35);
  const raw = store.min + (store.max - store.min) * r;
  const cents = Math.round(raw * 100) / 100;
  return Math.min(store.max, Math.max(store.min, cents));
}

export function buildSales(): DayRow[] {
  const rands = Object.fromEntries(STORES.map((s) => [s.id, mulberry32(s.seed)])) as Record<StoreId, () => number>;
  const rows: DayRow[] = [];
  for (let d = new Date(PERIOD_START); d <= PERIOD_END; d.setUTCDate(d.getUTCDate() + 1)) {
    const wd = d.getUTCDay();
    if (wd === 0 || wd === 6) continue; // sem sábado e domingo
    const iso = d.toISOString().slice(0, 10);
    const values = {} as Record<StoreId, number>;
    for (const s of STORES) values[s.id] = amount(s, rands[s.id]);
    rows.push({ date: iso, month: iso.slice(0, 7), weekday: wd, values });
  }
  return rows;
}
