export type Contestant = {
  name: string;
  handle: string;
  followers: number;
  pct24: number;
  pct7: number;
  pct30: number;
  entry: number;
  avatarId: string;
  note?: string;
};

/** Entry baselines from premiere / wildcard / 5 Sept reports. Live counts refresh from KOYRO. */
export const CONTESTANTS: Contestant[] = [
  {
    name: "Arishfa Khan",
    handle: "@arishfakhan138",
    followers: 30_389_473,
    pct24: 0.15,
    pct7: 1.02,
    pct30: 2.14,
    entry: 29_100_000,
    avatarId: "34e2df4c-7fe5-4fc7-9e94-6d04a5254adc",
  },
  {
    name: "Kanika Mann",
    handle: "@officialkanikamann",
    followers: 7_755_934,
    pct24: 0.01,
    pct7: 0.16,
    pct30: 1.75,
    entry: 7_300_000,
    avatarId: "d4c3e6b4-185f-480d-b081-b10a84e43995",
  },
  {
    name: "Amrapali Dubey",
    handle: "@aamrapali1101",
    followers: 6_223_480,
    pct24: 0.16,
    pct7: 0.93,
    pct30: 1.99,
    entry: 6_000_000,
    avatarId: "80635d97-8263-4b77-a2c6-e83cf99f19f6",
  },
  {
    name: "ScoutOP (Tanmay)",
    handle: "@scoutop",
    followers: 5_840_562,
    pct24: 0.07,
    pct7: -0.68,
    pct30: 7.63,
    entry: 4_400_000,
    avatarId: "4dff4fda-6782-4e5b-9b5f-62d504d3cf8d",
  },
  {
    name: "Yung DSA",
    handle: "@yung_dsa",
    followers: 3_149_950,
    pct24: 4.91,
    pct7: 17.38,
    pct30: 48.92,
    entry: 120_000,
    avatarId: "06ea68d9-40d7-49d2-9f90-68c027f0af45",
  },
  {
    name: "Nakull Dhull",
    handle: "@nakul_dhull",
    followers: 2_556_505,
    pct24: -0.11,
    pct7: -0.52,
    pct30: 37.55,
    entry: 1_200_000,
    avatarId: "18b96210-4be9-4199-95b7-4d51fbb0a21b",
    note: "Wildcard ~Oct",
  },
  {
    name: "Mahhi Vij",
    handle: "@mahhivij",
    followers: 2_536_225,
    pct24: 0.06,
    pct7: 0.22,
    pct30: 1.56,
    entry: 2_200_000,
    avatarId: "478eded1-5842-47dd-822c-1c65e96a4a58",
  },
  {
    name: "Qazi Touqeer",
    handle: "@qazitouqeer_official",
    followers: 2_438_727,
    pct24: 0.48,
    pct7: 3.34,
    pct30: 22.26,
    entry: 172_000,
    avatarId: "9ce14673-39bd-4298-83e4-7b4b77d159ac",
  },
  {
    name: "Mary Kom",
    handle: "@mcmary.kom",
    followers: 2_207_999,
    pct24: -0.04,
    pct7: -0.06,
    pct30: 0.82,
    entry: 2_000_000,
    avatarId: "761f15c6-117e-40de-97ff-98f039b2a76f",
  },
  {
    name: "Gullu (Kushal)",
    handle: "@fun.with.gullu.g",
    followers: 2_157_952,
    pct24: 0.17,
    pct7: 2.09,
    pct30: 17.09,
    entry: 1_400_000,
    avatarId: "7dd1ac26-1570-4818-a940-0f96c9ab55bc",
  },
  {
    name: "Uditi Singh",
    handle: "@uditisinghh",
    followers: 1_891_985,
    pct24: 0.96,
    pct7: 8.43,
    pct30: 22.69,
    entry: 1_000_000,
    avatarId: "fb7e0234-c523-4b0d-b2a3-9b73a2e872a3",
  },
  {
    name: "Love Gill",
    handle: "@lovegillkalakaar",
    followers: 1_497_097,
    pct24: -0.33,
    pct7: -1.36,
    pct30: 24.22,
    entry: 613_000,
    avatarId: "a85ca3b3-602d-4d2b-818c-d1b12c82b382",
  },
  {
    name: "Isha Rikhi",
    handle: "@isharikhi",
    followers: 1_277_432,
    pct24: -0.01,
    pct7: -0.07,
    pct30: -0.45,
    entry: 1_100_000,
    avatarId: "90f07122-129e-488a-ad28-f405c3d3c064",
  },
  {
    name: "Aasif Khan",
    handle: "@aasifkhan_1",
    followers: 794_211,
    pct24: 0.05,
    pct7: 1.43,
    pct30: 24.2,
    entry: 235_000,
    avatarId: "a729b57f-d560-45c4-ade3-e2e42683797a",
  },
  {
    name: "Aman Gandhi",
    handle: "@gandhi_aman_",
    followers: 508_627,
    pct24: -0.06,
    pct7: -0.16,
    pct30: 3.15,
    entry: 428_000,
    avatarId: "ebf1c0f9-6762-4058-98e4-2ca9bc309a0f",
  },
  {
    name: "Rohed Khan",
    handle: "@rohedkhan__",
    followers: 208_789,
    pct24: 0.1,
    pct7: 0.84,
    pct30: 4.33,
    entry: 30_700,
    avatarId: "534b503d-7aa1-471d-8998-e7e8a14215de",
  },
  {
    name: "Rhiti Tiwari",
    handle: "@rhititiwari",
    followers: 123_392,
    pct24: 0.04,
    pct7: 0.02,
    pct30: 2.49,
    entry: 17_200,
    avatarId: "00246a99-89f1-498f-954d-337669ad2c06",
  },
  {
    name: "Manish Goel",
    handle: "@abhinetamanishgoel",
    followers: 93_403,
    pct24: 3.49,
    pct7: 30.48,
    pct30: 288.58,
    entry: 24_000,
    avatarId: "d5fdecfb-d304-4e27-b0be-f3dc5a4d39fe",
    note: "Wildcard W6",
  },
];

export function avatarUrl(avatarId: string): string {
  return `/koyro/api/contestants/${avatarId}/avatar`;
}

export function periodGain(current: number, pct: number): number {
  if (pct === 0) return 0;
  const previous = current / (1 + pct / 100);
  return Math.round(current - previous);
}

export function fmt(n: number): string {
  const abs = Math.abs(n);
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  if (abs >= 1_000_000) {
    const v = abs / 1_000_000;
    return `${sign}${v >= 10 ? v.toFixed(1) : v.toFixed(2)}M`;
  }
  if (abs >= 1_000) {
    const v = abs / 1_000;
    return `${sign}${v >= 100 ? Math.round(v) : v.toFixed(1)}K`;
  }
  return `${sign}${abs}`;
}

export function fmtTotal(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
