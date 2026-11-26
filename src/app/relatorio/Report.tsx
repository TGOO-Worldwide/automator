"use client";

import { useMemo, useState } from "react";
import type { DayRow, Store, StoreId } from "@/lib/sales";

const MONTH_NAMES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function money(v: number, currency: Store["currency"]) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency, minimumFractionDigits: 2 }).format(v);
}
function monthLabel(m: string) {
  const [y, mm] = m.split("-").map(Number);
  return `${MONTH_NAMES[mm - 1]} ${y}`;
}
function dateLabel(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

type Stats = { total: number; days: number; selling: number; zero: number; avg: number; best: number; bestDate: string };

function stats(rows: DayRow[], id: StoreId): Stats {
  let total = 0, selling = 0, best = 0, bestDate = "";
  for (const r of rows) {
    const v = r.values[id];
    total += v;
    if (v > 0) selling++;
    if (v > best) { best = v; bestDate = r.date; }
  }
  return { total, days: rows.length, selling, zero: rows.length - selling, avg: selling ? total / selling : 0, best, bestDate };
}

export default function Report({ rows, stores }: { rows: DayRow[]; stores: Store[] }) {
  const months = useMemo(() => [...new Set(rows.map((r) => r.month))], [rows]);
  const [month, setMonth] = useState<string>("all");

  const visible = month === "all" ? rows : rows.filter((r) => r.month === month);
  const chartMonth = month === "all" ? months[months.length - 1] : month;
  const chartRows = rows.filter((r) => r.month === chartMonth);

  const first = rows[0]?.date;
  const last = rows[rows.length - 1]?.date;

  return (
    <main className="report">
      <header className="report-head">
        <p className="eyebrow">Relatório de faturação</p>
        <h1>Lojas · {monthLabel(months[0])} a {monthLabel(months[months.length - 1])}</h1>
        <p className="lead">
          De {dateLabel(first)}/{first.slice(0, 4)} a {dateLabel(last)}/{last.slice(0, 4)}, apenas dias úteis (sem sábado e domingo).
          Valores simulados, gerados na própria página.
        </p>
      </header>

      <nav className="months" aria-label="Período">
        <button type="button" aria-pressed={month === "all"} onClick={() => setMonth("all")}>Período completo</button>
        {months.map((m) => (
          <button key={m} type="button" aria-pressed={month === m} onClick={() => setMonth(m)}>
            {monthLabel(m)}
          </button>
        ))}
      </nav>

      <section className="cards">
        {stores.map((s) => {
          const st = stats(visible, s.id);
          return (
            <article key={s.id} className="card" data-store={s.id}>
              <h2>{s.name} <span>{s.country} · {s.currency}</span></h2>
              <p className="total">{money(st.total, s.currency)}</p>
              <dl>
                <div><dt>Dias úteis</dt><dd>{st.days}</dd></div>
                <div><dt>Dias com faturação</dt><dd>{st.selling}</dd></div>
                <div><dt>Dias sem faturação</dt><dd>{st.zero}</dd></div>
                <div><dt>Média por dia faturado</dt><dd>{money(st.avg, s.currency)}</dd></div>
                <div><dt>Melhor dia</dt><dd>{money(st.best, s.currency)} <small>({dateLabel(st.bestDate)})</small></dd></div>
              </dl>
            </article>
          );
        })}
      </section>

      <section>
        <h2 className="section-title">Resumo mensal</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mês</th>
                {stores.map((s) => <th key={s.id} className="num">{s.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {months.map((m) => {
                const mr = rows.filter((r) => r.month === m);
                return (
                  <tr key={m} data-active={month === m}>
                    <td>{monthLabel(m)}{m === months[months.length - 1] && <small> (até {dateLabel(last)})</small>}</td>
                    {stores.map((s) => <td key={s.id} className="num">{money(stats(mr, s.id).total, s.currency)}</td>)}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                {stores.map((s) => <td key={s.id} className="num">{money(stats(rows, s.id).total, s.currency)}</td>)}
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section>
        <h2 className="section-title">Faturação diária · {monthLabel(chartMonth)}</h2>
        <div className="charts">
          {stores.map((s) => <DailyChart key={s.id} store={s} rows={chartRows} />)}
        </div>
      </section>

      <section>
        <h2 className="section-title">Detalhe por dia{month === "all" ? "" : ` · ${monthLabel(month)}`}</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Dia</th>
                {stores.map((s) => <th key={s.id} className="num">{s.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.date}>
                  <td>{dateLabel(r.date)}</td>
                  <td className="muted">{WEEKDAYS[r.weekday]}</td>
                  {stores.map((s) => (
                    <td key={s.id} className="num">
                      {r.values[s.id] > 0 ? money(r.values[s.id], s.currency) : <span className="zero">sem faturação</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function DailyChart({ store, rows }: { store: Store; rows: DayRow[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = 150, pad = 4;
  const bw = W / Math.max(rows.length, 1);
  const top = store.max;
  const h = hover !== null ? rows[hover] : null;

  return (
    <figure className="chart" data-store={store.id}>
      <figcaption>
        <strong>{store.name}</strong>
        <span>
          {h ? `${dateLabel(h.date)} (${WEEKDAYS[h.weekday]}): ${h.values[store.id] > 0 ? money(h.values[store.id], store.currency) : "sem faturação"}` : `máx. da escala ${money(top, store.currency)}`}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`Faturação diária de ${store.name}`} onMouseLeave={() => setHover(null)}>
        <line x1="0" x2={W} y1={H - 0.5} y2={H - 0.5} className="axis" />
        {rows.map((r, i) => {
          const v = r.values[store.id];
          const bh = v > 0 ? Math.max(2, (v / top) * (H - pad)) : 0;
          return (
            <g key={r.date} onMouseEnter={() => setHover(i)}>
              <rect x={i * bw} y={0} width={bw} height={H} fill="transparent" />
              {v > 0 ? (
                <rect x={i * bw + bw * 0.15} y={H - bh} width={bw * 0.7} height={bh} rx="1.5" className="bar" data-on={hover === i} />
              ) : (
                <rect x={i * bw + bw * 0.35} y={H - 3} width={bw * 0.3} height={3} className="zero-mark" />
              )}
            </g>
          );
        })}
      </svg>
      <div className="chart-x">
        <span>{rows[0] && dateLabel(rows[0].date)}</span>
        <span>{rows[rows.length - 1] && dateLabel(rows[rows.length - 1].date)}</span>
      </div>
    </figure>
  );
}
