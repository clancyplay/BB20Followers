import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
  fmtPct,
  fmtTotal,
  periodGain,
  sinceEntryPct,
  type Contestant,
} from "./data";
import { refreshFromKoyro } from "./koyro";
import { SOCIAL, HOTSTAR, instagramProfileUrl } from "./links";
import BroadcastBar from "./BroadcastBar";
import "./App.css";

type StatusFilter = "all" | "active" | "eliminated";

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
  growthPct: number;
};

function buildRows(list: Contestant[]): Row[] {
  return list.map((c) => {
    const today = periodGain(c.followers, c.pct24);
    const week = periodGain(c.followers, c.pct7);
    const month = periodGain(c.followers, c.pct30);
    const sinceEntry = Math.round(c.followers - c.entry);
    const growthPct = sinceEntryPct(c.followers, c.entry);
    return { ...c, today, week, month, sinceEntry, growthPct };
  });
}

function CategoryPerson({
  row,
  value,
  sub,
  tone = "neutral",
}: {
  row: Row;
  value: string;
  sub: string;
  tone?: "pos" | "neg" | "neutral" | "out";
}) {
  return (
    <a
      className={`cat-person tone-${tone}`}
      href={instagramProfileUrl(row.handle)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img className="cat-avatar" src={avatarUrl(row.avatarId)} alt="" />
      <div className="cat-copy">
        <strong>
          {row.name}
          {row.status === "eliminated" ? (
            <span className="out-chip">OUT</span>
          ) : null}
        </strong>
        <span className="cat-value">{value}</span>
        <span className="cat-sub">{sub}</span>
      </div>
    </a>
  );
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("13 Nov 2026");
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  const rows = useMemo(() => buildRows(contestants), [contestants]);
  const activeRows = useMemo(
    () => rows.filter((r) => r.status === "active"),
    [rows]
  );
  const eliminatedRows = useMemo(
    () =>
      [...rows.filter((r) => r.status === "eliminated")].sort((a, b) => {
        const wa = Number(a.exitNote?.match(/Week\s+(\d+)/i)?.[1] ?? 99);
        const wb = Number(b.exitNote?.match(/Week\s+(\d+)/i)?.[1] ?? 99);
        return wa - wb;
      }),
    [rows]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;
    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    }
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
  }, [rows, sortKey, asc, query, statusFilter]);

  const topWeek = [...activeRows].sort((a, b) => b.week - a.week)[0];
  const totalFollowers = rows.reduce((s, r) => s + r.followers, 0);
  const weekNet = rows.reduce((s, r) => s + r.week, 0);

  const chartMetric: Exclude<SortKey, "name"> =
    sortKey === "name" ? "week" : sortKey;
  const metricLabel =
    SORT_OPTIONS.find((o) => o.key === chartMetric)?.label ?? "This week";

  /** Podium race = still inside the house only */
  const raceBoard = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = activeRows;
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.handle.toLowerCase().includes(q)
      );
    }
    const key = sortKey === "name" ? "week" : sortKey;
    const copy = [...list];
    copy.sort((a, b) => (asc ? a[key] - b[key] : b[key] - a[key]));
    return copy;
  }, [activeRows, sortKey, asc, query]);

  const podiumFirst = raceBoard[0] ?? null;
  const podiumRest = raceBoard.slice(1, 3);

  const hotStreak = [...activeRows].sort((a, b) => b.pct7 - a.pct7).slice(0, 3);
  const underFire = [...activeRows].sort((a, b) => a.week - b.week).slice(0, 3);
  const darkHorses = [...activeRows]
    .sort((a, b) => b.growthPct - a.growthPct)
    .slice(0, 3);
  const megaReach = [...activeRows]
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 3);

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

  const refreshingRef = useRef(false);

  async function onRefresh(opts?: { quiet?: boolean }) {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    if (!opts?.quiet) setRefreshMsg(null);
    try {
      const result = await refreshFromKoyro();
      setContestants(result.contestants);
      setUpdatedAt(result.updatedAt);
      setRefreshMsg(`Synced ${result.contestants.length} housemates`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Refresh failed";
      setRefreshMsg(msg);
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const AUTO_MS = 5 * 60 * 1000;
    void onRefresh({ quiet: true });

    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void onRefresh({ quiet: true });
      }
    }, AUTO_MS);

    function onVisible() {
      if (document.visibilityState === "visible") {
        void onRefresh({ quiet: true });
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <div className="page">
      <div className="atmosphere" aria-hidden="true">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
        <div className="scanlines" />
      </div>

      <BroadcastBar />

      <Link className="game-ghar-strip" to="/games/house-chaos">
        <span className="gg-live">
          <span className="live-dot" /> Ghar
        </span>
        <span className="gg-copy">Play live · collect · hit bosses · fight rivals</span>
        <span className="gg-cta">Play →</span>
      </Link>

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
              className={`icon-btn refresh ${refreshing ? "spinning" : ""}`}
              onClick={() => void onRefresh()}
              disabled={refreshing}
              title={refreshing ? "Refreshing…" : "Refresh live data"}
              aria-label={refreshing ? "Refreshing…" : "Refresh live data"}
            >
              <span className="refresh-icon" aria-hidden="true">
                ↻
              </span>
            </button>
            <a
              className="icon-btn stream"
              href={HOTSTAR.show}
              target="_blank"
              rel="noopener noreferrer"
              title="Stream on Hotstar"
              aria-label="Stream on Hotstar"
            >
              ▶
            </a>
            <Link
              className="icon-btn games"
              to="/games"
              title="BB Games Arena"
              aria-label="BB Games Arena"
            >
              🎮
            </Link>
            <a
              className="icon-btn ig"
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              title={`Follow ${SOCIAL.instagramHandle}`}
              aria-label={`Follow ${SOCIAL.instagramHandle}`}
            >
              IG
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
          <strong>
            {activeRows.length}
            <span className="stat-split">/{rows.length}</span>
          </strong>
          <span>Still inside</span>
        </div>
        <div className="stat">
          <strong className="pos">{fmt(topWeek?.week ?? 0)}</strong>
          <span>7d · {topWeek?.name.split(" ")[0] ?? "—"}</span>
        </div>
        <div className="stat">
          <strong className="neg">{eliminatedRows.length}</strong>
          <span>Evicted / out</span>
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
        <div className="toolbar-right">
          <div className="status-filters" role="group" aria-label="House status">
            {(
              [
                ["all", "All"],
                ["active", "Inside"],
                ["eliminated", "Evicted"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={
                  statusFilter === key ? "status-chip active" : "status-chip"
                }
                onClick={() => setStatusFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            className="search"
            placeholder="Search name or @handle…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
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
            <span className="muted">#2 & #3 inside · {metricLabel}</span>
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

      <section className="category-grid" aria-label="Story categories">
        <article className="category-card">
          <header>
            <h2>Hot streak</h2>
            <span>Fastest % this week · inside</span>
          </header>
          <div className="category-list">
            {hotStreak.map((r) => (
              <CategoryPerson
                key={r.handle}
                row={r}
                value={`${fmt(r.week)} · ${fmtPct(r.pct7)}`}
                sub="7-day pace"
                tone="pos"
              />
            ))}
          </div>
        </article>

        <article className="category-card hate">
          <header>
            <h2>Under fire</h2>
            <span>Worst net this week · hate / cooling</span>
          </header>
          <div className="category-list">
            {underFire.map((r) => (
              <CategoryPerson
                key={r.handle}
                row={r}
                value={fmt(r.week)}
                sub={`${fmtPct(r.pct7)} · 7 days`}
                tone="neg"
              />
            ))}
          </div>
        </article>

        <article className="category-card">
          <header>
            <h2>Dark horses</h2>
            <span>Biggest % jump since entry</span>
          </header>
          <div className="category-list">
            {darkHorses.map((r) => (
              <CategoryPerson
                key={r.handle}
                row={r}
                value={`${fmt(r.sinceEntry)} · ${fmtPct(r.growthPct)}`}
                sub={`${fmtTotal(r.entry)} → ${fmtTotal(r.followers)}`}
                tone="pos"
              />
            ))}
          </div>
        </article>

        <article className="category-card">
          <header>
            <h2>Mega reach</h2>
            <span>Most followed · still inside</span>
          </header>
          <div className="category-list">
            {megaReach.map((r) => (
              <CategoryPerson
                key={r.handle}
                row={r}
                value={fmtTotal(r.followers)}
                sub={`Week ${fmt(r.week)}`}
                tone="neutral"
              />
            ))}
          </div>
        </article>
      </section>

      <section className="eliminated-panel" aria-label="Evicted contestants">
        <div className="panel-head">
          <h2>Out of the house</h2>
          <span className="muted">
            {eliminatedRows.length} gone · names + exit week
          </span>
        </div>
        <div className="eliminated-grid">
          {eliminatedRows.map((r) => (
            <a
              key={r.handle}
              className="eliminated-card"
              href={instagramProfileUrl(r.handle)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="cat-avatar"
                src={avatarUrl(r.avatarId)}
                alt=""
                loading="lazy"
              />
              <div className="cat-copy">
                <strong>
                  {r.name}
                  <span className="out-chip">OUT</span>
                </strong>
                <span className="cat-sub">{r.exitNote ?? "Evicted"}</span>
                <span className={`cat-value ${gainClass(r.week)}`}>
                  {fmtTotal(r.followers)} · week {fmt(r.week)}
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

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
                <th className="vote-col">Vote</th>
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
                          <span className="name">
                            {r.name}
                            {r.status === "eliminated" ? (
                              <span className="out-chip">OUT</span>
                            ) : null}
                          </span>
                          {r.status === "eliminated" && r.exitNote ? (
                            <span className="note">{r.exitNote}</span>
                          ) : r.note ? (
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
                    <td className="vote-col">
                      {r.status === "active" ? (
                        <a
                          className="vote-btn"
                          href={HOTSTAR.vote}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Vote for ${r.name} on JioHotstar`}
                        >
                          Vote
                        </a>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
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
          <Link to="/games">BB Games Arena</Link>
          <span aria-hidden="true">·</span>
          <a href={HOTSTAR.show} target="_blank" rel="noopener noreferrer">
            Stream on Hotstar
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
          5 Sept reports · not official Bigg Boss / Colors / JioHotstar stats ·
          vote only via official JioHotstar app
        </p>
      </footer>
    </div>
  );
}
