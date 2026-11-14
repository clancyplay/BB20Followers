export type Contestant = {
  name: string;
  handle: string;
  followers: number;
  pct24: number;
  pct7: number;
  pct30: number;
  entry: number;
  note?: string;
};

/** KOYRO snapshots ~13–14 Nov 2026; entry baselines from premiere/wildcard reports */
export const CONTESTANTS: Contestant[] = [
  {
    name: "Arishfa Khan",
    handle: "@arishfakhan138",
    followers: 30_380_000,
    pct24: 0.1,
    pct7: 1.0,
    pct30: 2.1,
    entry: 29_100_000,
  },
  {
    name: "Kanika Mann",
    handle: "@officialkanikamann",
    followers: 7_760_000,
    pct24: 0.0,
    pct7: 0.1,
    pct30: 1.8,
    entry: 7_300_000,
  },
  {
    name: "Amrapali Dubey",
    handle: "@aamrapali1101",
    followers: 6_220_000,
    pct24: 0.1,
    pct7: 0.9,
    pct30: 1.9,
    entry: 6_600_000,
  },
  {
    name: "ScoutOP (Tanmay)",
    handle: "@scoutop",
    followers: 5_840_000,
    pct24: -0.1,
    pct7: -0.7,
    pct30: 7.6,
    entry: 4_400_000,
  },
  {
    name: "Yung DSA",
    handle: "@yung_dsa",
    followers: 3_130_000,
    pct24: 4.9,
    pct7: 16.5,
    pct30: 48.1,
    entry: 120_000,
  },
  {
    name: "Nakull Dhull",
    handle: "@nakul_dhull",
    followers: 2_560_000,
    pct24: -0.1,
    pct7: -0.6,
    pct30: 41.6,
    entry: 1_200_000,
    note: "Wildcard ~Oct",
  },
  {
    name: "Mahhi Vij",
    handle: "@mahhivij",
    followers: 2_540_000,
    pct24: 0.1,
    pct7: 0.2,
    pct30: 1.6,
    entry: 2_200_000,
  },
  {
    name: "Qazi Touqeer",
    handle: "@qazitouqeer_official",
    followers: 2_440_000,
    pct24: 0.4,
    pct7: 3.3,
    pct30: 22.2,
    entry: 172_000,
  },
  {
    name: "Mary Kom",
    handle: "@mcmary.kom",
    followers: 2_210_000,
    pct24: 0.0,
    pct7: -0.1,
    pct30: 0.9,
    entry: 2_000_000,
  },
  {
    name: "Gullu (Kushal)",
    handle: "@fun.with.gullu.g",
    followers: 2_160_000,
    pct24: 0.2,
    pct7: 2.1,
    pct30: 17.6,
    entry: 1_400_000,
  },
  {
    name: "Uditi Singh",
    handle: "@uditisinghh",
    followers: 1_890_000,
    pct24: 1.0,
    pct7: 8.3,
    pct30: 22.5,
    entry: 1_000_000,
  },
  {
    name: "Love Gill",
    handle: "@lovegillkalakaar",
    followers: 1_500_000,
    pct24: -0.3,
    pct7: -1.3,
    pct30: 24.5,
    entry: 613_000,
  },
  {
    name: "Isha Rikhi",
    handle: "@isharikhi",
    followers: 1_280_000,
    pct24: 0.0,
    pct7: -0.1,
    pct30: -0.5,
    entry: 1_100_000,
  },
  {
    name: "Aasif Khan",
    handle: "@aasifkhan_1",
    followers: 794_080,
    pct24: 0.0,
    pct7: 1.5,
    pct30: 24.1,
    entry: 235_000,
  },
  {
    name: "Aman Gandhi",
    handle: "@gandhi_aman_",
    followers: 508_650,
    pct24: -0.1,
    pct7: -0.1,
    pct30: 3.2,
    entry: 428_000,
  },
  {
    name: "Rohed Khan",
    handle: "@rohedkhan__",
    followers: 208_730,
    pct24: 0.1,
    pct7: 0.8,
    pct30: 4.5,
    entry: 30_700,
  },
  {
    name: "Rhiti Tiwari",
    handle: "@rhititiwari",
    followers: 123_300,
    pct24: 0.0,
    pct7: -0.1,
    pct30: 2.5,
    entry: 17_200,
  },
  {
    name: "Manish Goel",
    handle: "@abhinetamanishgoel",
    followers: 92_290,
    pct24: 2.7,
    pct7: 29.6,
    pct30: 283.9,
    entry: 24_000,
    note: "Wildcard W6",
  },
];

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
