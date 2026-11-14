export const SOCIAL = {
  instagram: "https://www.instagram.com/bigbossgossipverse/",
  instagramHandle: "@bigbossgossipverse",
} as const;

export function instagramProfileUrl(handle: string): string {
  const clean = handle.replace(/^@/, "").trim();
  return `https://www.instagram.com/${clean}/`;
}
