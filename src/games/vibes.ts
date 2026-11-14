export type VibeMap = Record<string, number>;

export type VibesPayload = {
  love: VibeMap;
  hate: VibeMap;
};

const STORAGE_KEY = "bb20-my-vibes-v1";

export type MyVibes = {
  love: string | null;
  hate: string | null;
};

export function loadMyVibes(): MyVibes {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { love: null, hate: null };
    const parsed = JSON.parse(raw) as MyVibes;
    return {
      love: typeof parsed.love === "string" ? parsed.love : null,
      hate: typeof parsed.hate === "string" ? parsed.hate : null,
    };
  } catch {
    return { love: null, hate: null };
  }
}

export function saveMyVibes(next: MyVibes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function fetchVibes(): Promise<VibesPayload> {
  const res = await fetch("/api/vibes");
  if (!res.ok) throw new Error("Could not load vibes");
  return (await res.json()) as VibesPayload;
}

export async function sendVibe(
  handle: string,
  type: "love" | "hate"
): Promise<VibesPayload> {
  const res = await fetch("/api/vibes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handle, type }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error || "Vote failed");
  }
  return (await res.json()) as VibesPayload;
}
