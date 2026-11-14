import { CONTESTANTS, type Contestant } from "./data";

type Growth = {
  absolute?: number;
  percentage?: number;
};

type KoyroRow = {
  contestant?: {
    name?: string;
    instagramHandle?: string;
    id?: string;
  };
  currentInstagram?: number;
  igGrowth24h?: Growth;
  igGrowth7d?: Growth;
  igGrowth30d?: Growth;
  lastUpdated?: string;
};

function findEscapedArray(html: string, key: string): string {
  const marker = `\\"${key}\\":[`;
  const start = html.indexOf(marker);
  if (start < 0) throw new Error("KOYRO payload not found");

  const from = start + `\\"${key}\\":`.length;
  let depth = 0;
  let end = -1;
  for (let i = from; i < html.length; i++) {
    const ch = html[i];
    // Payload uses \" for quotes; bare [ ] still mark array depth
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end < 0) throw new Error("KOYRO payload incomplete");
  return html.slice(from, end);
}

function unescapeNextPayload(raw: string): string {
  return raw
    .replace(/\$undefined/g, "null")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\u0026/g, "&")
    .replace(/\\\\/g, "\\");
}

function extractInitialAnalytics(html: string): KoyroRow[] {
  const escaped = findEscapedArray(html, "initialAnalytics");
  let jsonText = unescapeNextPayload(escaped);
  // Drop unresolved RSC refs like "$22:props:..."
  jsonText = jsonText.replace(/"\$[^"]*"/g, "null");

  const parsed = JSON.parse(jsonText) as KoyroRow[];
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("KOYRO returned empty rankings");
  }
  return parsed;
}

function mergeWithBaselines(rows: KoyroRow[]): Contestant[] {
  const byHandle = new Map(
    CONTESTANTS.map((c) => [c.handle.replace(/^@/, "").toLowerCase(), c])
  );

  const merged: Contestant[] = [];
  for (const row of rows) {
    const handleRaw = row.contestant?.instagramHandle?.toLowerCase();
    if (!handleRaw || row.currentInstagram == null) continue;
    const base = byHandle.get(handleRaw);
    if (!base) continue;

    merged.push({
      ...base,
      name: row.contestant?.name ?? base.name,
      handle: `@${handleRaw}`,
      followers: Math.round(row.currentInstagram),
      pct24: Number(row.igGrowth24h?.percentage ?? base.pct24),
      pct7: Number(row.igGrowth7d?.percentage ?? base.pct7),
      pct30: Number(row.igGrowth30d?.percentage ?? base.pct30),
      avatarId: row.contestant?.id ?? base.avatarId,
    });
  }

  if (merged.length < 10) {
    throw new Error(`Only matched ${merged.length} contestants`);
  }

  const seen = new Set(merged.map((m) => m.handle.toLowerCase()));
  for (const c of CONTESTANTS) {
    if (!seen.has(c.handle.toLowerCase())) merged.push(c);
  }
  return merged;
}

export type RefreshResult = {
  contestants: Contestant[];
  updatedAt: string;
};

export async function refreshFromKoyro(
  signal?: AbortSignal
): Promise<RefreshResult> {
  const res = await fetch("/koyro/shows/bigg-boss/season-20", {
    signal,
    headers: { Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`KOYRO HTTP ${res.status}`);
  const html = await res.text();
  const rows = extractInitialAnalytics(html);
  const contestants = mergeWithBaselines(rows);
  const updatedAt =
    rows.find((r) => r.lastUpdated)?.lastUpdated ??
    new Date().toISOString().slice(0, 10);
  return { contestants, updatedAt };
}
