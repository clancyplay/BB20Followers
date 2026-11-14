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
  avatarUrl,
  fmt,
  fmtTotal,
  periodGain,
  type Contestant,
} from "./data";
import { refreshFromKoyro } from "./koyro";
import { SOCIAL } from "./links";
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

type Row = Contestant & {
  today: number;
  week: number;
  month: number;
  sinceEntry: number;
};

function buildRows(list: Contestant[]): Row[] {
  return list.map((c) => {
    const today = periodGain(c.followers, c.pct24);
    const week = periodGain(c.followers, c.pct7);
    const month = periodGain(c.followers, c.pct30);
    const sinceEntry = Math.round(c.followers - c.entry);
    return { ...c, today, week, month, sinceEntry };
  });
}

export default function App() {
  const [contestants, setContestants] = useState(CONTESTANTS);
  const [sortKey, setSortKey] = useState<SortKey>("week");
  const [asc, setAsc] = useState(false);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("13 Nov 2026");
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  const rows = useMemo(() => buildRows(contestants), [contestants]);

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

  async function onRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const result = await refreshFromKoyro();
      setContestants(result.contestants);
      setUpdatedAt(result.updatedAt);
      setRefreshMsg(`Synced ${result.contestants.length} housemates`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Refresh failed";
      setRefreshMsg(msg);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="page">
      <div className="atmosphere" aria-hidden="true">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
        <div className="scanlines" />
      </div>

      <header className="hero">
        <div className="hero-brand">
          <img
            className="hero-logo"
            src="/bb20/logo.jpg"
            alt="Bigg Boss 20"
          />
          <img className="hero-eye" src="/bb20/eye.svg" alt="" />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="live-dot" /> Colors TV · JioHotstar · Season 20
          </p>
          <h1>
            <span className="brand-line">BIGG BOSS 20</span>
            <span className="title-line">Instagram Follower Board</span>
          </h1>
          <p className="sub">
            18 housemates · Tathas-two · live social scoreboard from KOYRO
            snapshots
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className={`refresh-btn ${refreshing ? "spinning" : ""}`}
              onClick={onRefresh}
              disabled={refreshing}
            >
              <span className="refresh-icon" aria-hidden="true">
                ↻
              </span>
              {refreshing ? "Refreshing…" : "Refresh live data"}
            </button>
            <a
              className="social-btn ig"
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram · {SOCIAL.instagramHandle}
            </a>
            <a
              className="social-btn gh"
              href={SOCIAL.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <span className="data-stamp">Updated · {updatedAt}</span>
            {refreshMsg ? <span className="refresh-msg">{refreshMsg}</span> : null}
          </div>
        </div>
      </header>

      <section className="stats" aria-label="Season highlights">
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
      </section>

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

      <section className="chart-panel">
        <div className="panel-head">
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
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(232,197,71,0.12)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "#b8a878", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}K`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={78}
                tick={{ fill: "#f3e9c8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(245,215,110,0.06)" }}
                contentStyle={{
                  background: "#120e08",
                  border: "1px solid rgba(232,197,71,0.35)",
                  borderRadius: 10,
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
                    fill={d.raw >= 0 ? "#2EC4B6" : "#E63946"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="table-panel">
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
                      <img
                        className="avatar"
                        src={avatarUrl(r.avatarId)}
                        alt=""
                        loading="lazy"
                      />
                      <div className="name-meta">
                        <span className="name">{r.name}</span>
                        {r.note ? <span className="note">{r.note}</span> : null}
                      </div>
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
        <div className="foot-links">
          <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer">
            {SOCIAL.instagramHandle}
          </a>
          <span aria-hidden="true">·</span>
          <a href={SOCIAL.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="https://koyro.in/shows/bigg-boss/season-20"
            target="_blank"
            rel="noopener noreferrer"
          >
            KOYRO data
          </a>
        </div>
        <p>
          Fan board by Big Boss Gossip Verse · entry baselines from premiere /
          5 Sept reports · not official Bigg Boss / Colors / JioHotstar stats
        </p>
      </footer>
    </div>
  );
}
