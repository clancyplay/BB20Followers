/** Episode schedule: daily 9:00 PM IST on JioHotstar (Colors ~10:30 PM). */
export const EPISODE_HOUR_IST = 21;
export const EPISODE_MINUTE_IST = 0;

export type NewsItem = {
  id: string;
  source: "JioHotstar" | "Colors" | "BB Gossip";
  title: string;
  href: string;
  tag: string;
};

export const NEWS_FEED: NewsItem[] = [
  {
    id: "1",
    source: "JioHotstar",
    title: "Watch Bigg Boss 20 episodes & 24×7 live on JioHotstar",
    href: "https://www.hotstar.com/in/tv/bigg-boss/s-1510",
    tag: "Stream",
  },
  {
    id: "2",
    source: "JioHotstar",
    title: "Official voting only inside the JioHotstar app — free, daily limit resets",
    href: "https://www.hotstar.com/in/tv/bigg-boss/s-1510",
    tag: "Vote",
  },
  {
    id: "3",
    source: "Colors",
    title: "Weekend Ka Vaar with Salman Khan — Saturdays & Sundays",
    href: "https://www.hotstar.com/in/tv/bigg-boss/s-1510",
    tag: "WKV",
  },
  {
    id: "4",
    source: "BB Gossip",
    title: "Track Instagram follower race of all BB20 housemates live",
    href: "/",
    tag: "Board",
  },
  {
    id: "5",
    source: "JioHotstar",
    title: "Catch up on older episodes from Season 20 catalogue anytime",
    href: "https://www.hotstar.com/in/tv/bigg-boss/s-1510",
    tag: "Episodes",
  },
];

export type EpisodeTeaser = {
  title: string;
  blurb: string;
  kind: "Daily" | "Weekend Ka Vaar" | "Special";
};

/** Rough teaser by weekday (IST). Edit anytime for spoilers-free hints. */
export function episodeTeaserFor(date: Date): EpisodeTeaser {
  const day = date.getDay(); // 0 Sun … 6 Sat
  if (day === 0 || day === 6) {
    return {
      kind: "Weekend Ka Vaar",
      title: "Salman Khan special expected",
      blurb:
        "Nominations heat, confrontations, and possible eviction / lifeline drama. Keep Hotstar ready.",
    };
  }
  if (day === 1) {
    return {
      kind: "Daily",
      title: "Post-Vaar fallout",
      blurb:
        "House reacts to weekend twists. Captains, alliances, and ration / task talk usually dominate.",
    };
  }
  if (day === 2 || day === 3) {
    return {
      kind: "Daily",
      title: "Task & nomination build-up",
      blurb:
        "Expect luxury budget tasks, fights over captaincy, and nomination setup for the week.",
    };
  }
  return {
    kind: "Daily",
    title: "Mid-week chaos",
    blurb:
      "Friendships tested, secret rooms / twists possible, and fan favourite vs villain narratives heat up.",
  };
}

/** Next episode air time as Date (local), assuming daily 21:00 Asia/Kolkata. */
export function nextEpisodeAt(now = new Date()): Date {
  // Convert "now" to IST parts via Intl
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(now).map((p) => [p.type, p.value])
  );
  const y = Number(parts.year);
  const m = Number(parts.month);
  const d = Number(parts.day);
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);

  // Build IST timestamp for today's episode using a fixed offset trick:
  // Asia/Kolkata is UTC+5:30 year-round.
  const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
  let episodeUtc =
    Date.UTC(y, m - 1, d, EPISODE_HOUR_IST, EPISODE_MINUTE_IST, 0) -
    istOffsetMs;

  const nowIstMinutes = hour * 60 + minute;
  const episodeIstMinutes = EPISODE_HOUR_IST * 60 + EPISODE_MINUTE_IST;
  if (nowIstMinutes >= episodeIstMinutes) {
    episodeUtc += 24 * 60 * 60 * 1000;
  }
  return new Date(episodeUtc);
}

export function formatCountdown(ms: number): {
  h: string;
  m: string;
  s: string;
  live: boolean;
} {
  if (ms <= 0) return { h: "00", m: "00", s: "00", live: true };
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { h: pad(h), m: pad(m), s: pad(s), live: false };
}
