import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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
import { SOCIAL, instagramProfileUrl } from "./links";
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

function metricValue(row: Row, key: Exclude<SortKey, "name">): number {
  return row[key];
}

function formatMetric(row: Row, key: Exclude<SortKey, "name">): string {
  if (key === "followers") return fmtTotal(row.followers);
  return fmt(row[key]);
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
  const metricLabel =
    SORT_OPTIONS.find((o) => o.key === chartMetric)?.label ?? "This week";

  const podiumFirst = filtered[0] ?? null;
  const podiumRest = filtered.slice(1, 3);

  const chartData = filtered.slice(0, 10).map((r) => ({
    name: r.name.split(" ")[0],
    value: Math.round(metricValue(r, chartMetric) / 1000),
    raw: metricValue(r, chartMetric),
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
            src="/bb20/logo.png"
            alt="Bigg Boss 20"
          />
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
            18 housemates · live social scoreboard · tap any profile to open
            Instagram
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
              Follow {SOCIAL.instagramHandle}
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

      <section className="toolbar" aria-label="Sort controls">
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

      {podiumFirst ? (
        <section className="podium-first" aria-label="Top player">
          <div className="podium-badge">#1 · {metricLabel}</div>
          <a
            className="podium-first-card"
            href={instagramProfileUrl(podiumFirst.handle)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="podium-avatar big"
              src={avatarUrl(podiumFirst.avatarId)}
              alt=""
            />
            <div className="podium-copy">
              <h2>{podiumFirst.name}</h2>
              <p className="podium-handle">{podiumFirst.handle}</p>
              <div className="podium-metrics">
                <div>
                  <strong className={gainClass(metricValue(podiumFirst, chartMetric))}>
                    {formatMetric(podiumFirst, chartMetric)}
                  </strong>
                  <span>{metricLabel}</span>
                </div>
                <div>
                  <strong>{fmtTotal(podiumFirst.followers)}</strong>
                  <span>Total followers</span>
                </div>
                <div>
                  <strong className={gainClass(podiumFirst.week)}>
                    {fmt(podiumFirst.week)}
                  </strong>
                  <span>This week</span>
                </div>
              </div>
            </div>
          </a>
        </section>
      ) : null}

      {podiumRest.length > 0 ? (
        <section className="podium-rest" aria-label="Runners up">
          <div className="podium-rest-head">
            <h2>Chasing the lead</h2>
            <span className="muted">#2 & #3 · {metricLabel}</span>
          </div>
          <div className="podium-rest-grid">
            {podiumRest.map((r, idx) => (
              <a
                key={r.handle}
                className="podium-runner"
                href={instagramProfileUrl(r.handle)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="runner-rank">#{idx + 2}</span>
                <img
                  className="podium-avatar"
                  src={avatarUrl(r.avatarId)}
                  alt=""
                />
                <div className="runner-copy">
                  <strong>{r.name}</strong>
                  <span className="handle-inline">{r.handle}</span>
                  <span
                    className={`runner-metric ${gainClass(metricValue(r, chartMetric))}`}
                  >
                    {formatMetric(r, chartMetric)}
                    <em> · {metricLabel}</em>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="chart-panel">
        <div className="panel-head">
          <h2>
            Top {Math.min(10, filtered.length)} · {metricLabel}
          </h2>
          <span className="muted">Net cast 7d: {fmt(weekNet)}</span>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 56, left: 8, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(232,197,71,0.12)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "#d4c49a", fontSize: 12 }}
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
                  border: "1px solid rgba(232,197,71,0.45)",
                  borderRadius: 10,
                  color: "#f7f0dd",
                }}
                labelStyle={{ color: "#f5d76e" }}
                itemStyle={{ color: "#f7f0dd" }}
                formatter={(value) => [
                  `${Number(value).toLocaleString()}K`,
                  metricLabel,
                ]}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.raw >= 0 ? "#2EC4B6" : "#E63946"}
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(v) => `${v}K`}
                  style={{ fill: "#f5d76e", fontSize: 11, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="table-panel">
        <div className="panel-head table-head">
          <h2>Full house board</h2>
          <span className="muted">{filtered.length} contestants</span>
        </div>
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
              {filtered.map((r, i) => {
                const ig = instagramProfileUrl(r.handle);
                return (
                  <tr key={r.handle}>
                    <td className="muted">{i + 1}</td>
                    <td>
                      <a
                        className="name-cell profile-link"
                        href={ig}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Open ${r.name} on Instagram`}
                      >
                        <img
                          className="avatar"
                          src={avatarUrl(r.avatarId)}
                          alt=""
                          loading="lazy"
                        />
                        <div className="name-meta">
                          <span className="name">{r.name}</span>
                          {r.note ? (
                            <span className="note">{r.note}</span>
                          ) : null}
                        </div>
                      </a>
                    </td>
                    <td>
                      <a
                        className="handle"
                        href={ig}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {r.handle}
                      </a>
                    </td>
                    <td className="num">{fmtTotal(r.followers)}</td>
                    <td className={`num ${gainClass(r.today)}`}>
                      {fmt(r.today)}
                    </td>
                    <td className={`num ${gainClass(r.week)}`}>
                      {fmt(r.week)}
                    </td>
                    <td className={`num ${gainClass(r.month)}`}>
                      {fmt(r.month)}
                    </td>
                    <td className={`num ${gainClass(r.sinceEntry)}`}>
                      {fmt(r.sinceEntry)}
                    </td>
                    <td className="num muted">{fmtTotal(r.entry)}</td>
                  </tr>
                );
              })}
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
