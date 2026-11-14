import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  CONTESTANTS,
  fmt,
  fmtTotal,
  periodGain,
} from "./data";
import "./App.css";

export type SortKey =
  | "followers"
  | "today"
  | "week"
  | "month"
  | "sinceEntry"
  | "name";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "week", label: "This week" },
  { key: "today", label: "Today" },
  { key: "month", label: "30 days" },
  { key: "sinceEntry", label: "Since entry" },
  { key: "followers", label: "Total followers" },
  { key: "name", label: "Name A–Z" },
];

function gainClass(n: number): string {
  if (n > 0) return "pos";
  if (n < 0) return "neg";
  return "flat";
}

export default function App() {
  const [sortKey, setSortKey] = useState<SortKey>("week");
  const [asc, setAsc] = useState(false);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    return CONTESTANTS.map((c) => {
      const today = periodGain(c.followers, c.pct24);
      const week = periodGain(c.followers, c.pct7);
      const month = periodGain(c.followers, c.pct30);
      const sinceEntry = Math.round(c.followers - c.entry);
      return { ...c, today, week, month, sinceEntry };
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.handle.toLowerCase().includes(q)
      );
    }
    const copy = [...list];
    copy.sort((a, b) => {
      if (sortKey === "name") {
        const cmp = a.name.localeCompare(b.name);
        return asc ? cmp : -cmp;
      }
      const av = a[sortKey];
      const bv = b[sortKey];
      return asc ? av - bv : bv - av;
    });
    return copy;
  }, [rows, sortKey, asc, query]);

  const topToday = [...rows].sort((a, b) => b.today - a.today)[0];
  const topWeek = [...rows].sort((a, b) => b.week - a.week)[0];
  const topSince = [...rows].sort((a, b) => b.sinceEntry - a.sinceEntry)[0];
  const totalFollowers = rows.reduce((s, r) => s + r.followers, 0);
  const weekNet = rows.reduce((s, r) => s + r.week, 0);

  const chartMetric: Exclude<SortKey, "name"> =
    sortKey === "name" ? "week" : sortKey;

  const chartData = filtered.slice(0, 10).map((r) => ({
    name: r.name.split(" ")[0],
    value: Math.round(r[chartMetric] / 1000),
    raw: r[chartMetric],
  }));

  function onHeaderClick(key: SortKey) {
    if (sortKey === key) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(key === "name");
    }
  }

  function arrow(key: SortKey) {
    if (sortKey !== key) return "";
    return asc ? " ↑" : " ↓";
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Bigg Boss Hindi · Season 20</p>
          <h1>Instagram Follower Board</h1>
          <p className="sub">
            18 housemates · sort by today / week / since entry · data ~13–14 Nov
            2026 (KOYRO)
          </p>
        </div>
        <div className="stats">
          <div className="stat">
            <strong>{fmtTotal(totalFollowers)}</strong>
            <span>Combined reach</span>
          </div>
          <div className="stat">
            <strong className="pos">{fmt(topWeek.week)}</strong>
            <span>7d · {topWeek.name.split(" ")[0]}</span>
          </div>
          <div className="stat">
            <strong className="pos">{fmt(topToday.today)}</strong>
            <span>Today · {topToday.name.split(" ")[0]}</span>
          </div>
          <div className="stat">
            <strong className="pos">{fmt(topSince.sinceEntry)}</strong>
            <span>Since entry · {topSince.name.split(" ")[0]}</span>
          </div>
        </div>
      </header>

      <section className="toolbar">
        <div className="pills">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={sortKey === opt.key ? "pill active" : "pill"}
              onClick={() => {
                setSortKey(opt.key);
                setAsc(opt.key === "name");
              }}
            >
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            className="pill ghost"
            onClick={() => setAsc((v) => !v)}
          >
            {asc ? "Ascending" : "Descending"}
          </button>
        </div>
        <input
          className="search"
          placeholder="Search name or @handle…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </section>

      <section className="chart-card">
        <div className="card-head">
          <h2>
            Top {Math.min(10, filtered.length)} ·{" "}
            {SORT_OPTIONS.find((o) => o.key === chartMetric)?.label}
          </h2>
          <span className="muted">Net cast 7d: {fmt(weekNet)}</span>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "#9a9a9a", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}K`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={78}
                tick={{ fill: "#d0d0d0", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{
                  background: "#161616",
                  border: "1px solid #333",
                  borderRadius: 8,
                }}
                labelStyle={{ color: "#fff" }}
                formatter={(value) => [
                  `${Number(value).toLocaleString()}K`,
                  "Value",
                ]}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.raw >= 0 ? "#3dd68c" : "#f07178"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="table-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th className="clickable" onClick={() => onHeaderClick("name")}>
                  Contestant{arrow("name")}
                </th>
                <th>Handle</th>
                <th
                  className="clickable num"
                  onClick={() => onHeaderClick("followers")}
                >
                  Now{arrow("followers")}
                </th>
                <th
                  className="clickable num"
                  onClick={() => onHeaderClick("today")}
                >
                  Today{arrow("today")}
                </th>
                <th
                  className="clickable num"
                  onClick={() => onHeaderClick("week")}
                >
                  This week{arrow("week")}
                </th>
                <th
                  className="clickable num"
                  onClick={() => onHeaderClick("month")}
                >
                  30 days{arrow("month")}
                </th>
                <th
                  className="clickable num"
                  onClick={() => onHeaderClick("sinceEntry")}
                >
                  Since entry{arrow("sinceEntry")}
                </th>
                <th className="num">Entry ~</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.handle}>
                  <td className="muted">{i + 1}</td>
                  <td>
                    <div className="name-cell">
                      <span className="name">{r.name}</span>
                      {r.note ? <span className="note">{r.note}</span> : null}
                    </div>
                  </td>
                  <td className="handle">{r.handle}</td>
                  <td className="num">{fmtTotal(r.followers)}</td>
                  <td className={`num ${gainClass(r.today)}`}>{fmt(r.today)}</td>
                  <td className={`num ${gainClass(r.week)}`}>{fmt(r.week)}</td>
                  <td className={`num ${gainClass(r.month)}`}>{fmt(r.month)}</td>
                  <td className={`num ${gainClass(r.sinceEntry)}`}>
                    {fmt(r.sinceEntry)}
                  </td>
                  <td className="num muted">{fmtTotal(r.entry)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="foot">
        Source: koyro.in snapshots · Entry baselines from premiere / wildcard
        reports · Not official Bigg Boss stats · Project: BB20Followers
      </footer>
    </div>
  );
}
