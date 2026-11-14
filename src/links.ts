export const SOCIAL = {
  instagram: "https://www.instagram.com/bigbossgossipverse/",
  instagramHandle: "@bigbossgossipverse",
} as const;

/** Official JioHotstar / Hotstar destinations */
export const HOTSTAR = {
  show: "https://www.hotstar.com/in/tv/bigg-boss/s-1510",
  /** Opens show hub — vote tab is inside the app/player */
  vote: "https://www.hotstar.com/in/tv/bigg-boss/s-1510",
  episodes: "https://www.hotstar.com/in/tv/bigg-boss/s-1510",
  live: "https://www.hotstar.com/in/tv/bigg-boss/s-1510",
} as const;

export function instagramProfileUrl(handle: string): string {
  const clean = handle.replace(/^@/, "").trim();
  return `https://www.instagram.com/${clean}/`;
}
