/**
 * Writes lightweight SVG sprites under public/ghar/ for the Ghar game.
 * Run: node scripts/gen-ghar-sprites.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../public/ghar");
mkdirSync(dir, { recursive: true });

function svg(w, h, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
}

const sprites = {
  sofa: svg(
    180,
    64,
    `<rect x="2" y="8" width="176" height="52" rx="10" fill="#6b3a2a"/><rect x="10" y="14" width="160" height="28" rx="6" fill="#a35a45"/><rect x="14" y="16" width="48" height="24" rx="4" fill="#b86a55"/><rect x="66" y="16" width="48" height="24" rx="4" fill="#b86a55"/><rect x="118" y="16" width="48" height="24" rx="4" fill="#b86a55"/>`
  ),
  chair: svg(
    40,
    40,
    `<rect x="4" y="16" width="32" height="22" rx="4" fill="#5c3a28"/><rect x="6" y="2" width="28" height="16" rx="3" fill="#7a5040"/>`
  ),
  table: svg(
    80,
    55,
    `<rect x="2" y="2" width="76" height="51" rx="5" fill="#4a3020"/><rect x="8" y="8" width="64" height="39" rx="3" fill="#6a4830"/><rect x="12" y="12" width="56" height="31" fill="none" stroke="#e8c547" stroke-opacity=".3" stroke-width="2"/>`
  ),
  bed: svg(
    100,
    140,
    `<rect x="2" y="2" width="96" height="136" rx="8" fill="#3a2a40"/><rect x="8" y="14" width="84" height="110" rx="5" fill="#d8c8e8"/><rect x="12" y="18" width="76" height="28" rx="4" fill="#fff0f8"/><rect x="8" y="60" width="84" height="64" rx="4" fill="#e63980"/>`
  ),
  fridge: svg(
    52,
    90,
    `<rect x="2" y="2" width="48" height="86" rx="4" fill="#c8d0d8"/><rect x="6" y="40" width="40" height="3" fill="#a0a8b0"/><rect x="40" y="14" width="4" height="18" fill="#8890a0"/><rect x="40" y="52" width="4" height="18" fill="#8890a0"/>`
  ),
  stove: svg(
    80,
    56,
    `<rect x="2" y="2" width="76" height="52" rx="4" fill="#2a2a30"/><circle cx="26" cy="24" r="10" fill="#e63946"/><circle cx="54" cy="24" r="10" fill="#e63946"/><rect x="12" y="40" width="56" height="8" rx="2" fill="#888"/>`
  ),
  sink: svg(
    60,
    44,
    `<rect x="2" y="2" width="56" height="40" rx="4" fill="#5a6870"/><rect x="10" y="12" width="40" height="22" rx="6" fill="#8ab0c0"/><rect x="27" y="4" width="6" height="10" fill="#ccc"/>`
  ),
  counter: svg(
    120,
    40,
    `<rect x="0" y="0" width="120" height="40" fill="#5a4030"/><rect x="0" y="0" width="120" height="12" fill="#7a5840"/>`
  ),
  pool: svg(
    200,
    120,
    `<rect x="2" y="2" width="196" height="116" rx="18" fill="#0a3a50"/><rect x="12" y="12" width="176" height="96" rx="14" fill="#1e90ff"/><ellipse cx="70" cy="40" rx="40" ry="10" fill="#fff" fill-opacity=".25"/><rect x="2" y="2" width="196" height="116" rx="18" fill="none" stroke="#e8c547" stroke-width="4"/>`
  ),
  plant: svg(
    34,
    34,
    `<rect x="10" y="20" width="14" height="12" fill="#8b4513"/><circle cx="17" cy="14" r="11" fill="#2ec4b6"/><circle cx="11" cy="16" r="7" fill="#1a8a7a"/><circle cx="23" cy="14" r="6" fill="#1a8a7a"/>`
  ),
  bush: svg(
    48,
    42,
    `<circle cx="14" cy="24" r="14" fill="#1a6a40"/><circle cx="34" cy="24" r="14" fill="#1a6a40"/><circle cx="24" cy="14" r="15" fill="#228b4a"/>`
  ),
  tv: svg(
    130,
    32,
    `<rect x="2" y="2" width="126" height="28" rx="3" fill="#1a1a20"/><rect x="8" y="6" width="114" height="20" rx="2" fill="#3a80c0"/><text x="65" y="20" text-anchor="middle" fill="#e8c547" font-size="10" font-family="sans-serif" font-weight="700">TV</text>`
  ),
  carpet: svg(
    200,
    140,
    `<rect x="2" y="2" width="196" height="136" rx="10" fill="#8b1a2a"/><rect x="2" y="2" width="196" height="136" rx="10" fill="none" stroke="#e8c547" stroke-width="4"/><rect x="16" y="16" width="168" height="108" fill="none" stroke="#fff" stroke-opacity=".15"/>`
  ),
  mess: svg(
    48,
    32,
    `<ellipse cx="24" cy="16" rx="22" ry="12" fill="#5a4030" transform="rotate(12 24 16)"/><ellipse cx="16" cy="14" rx="10" ry="7" fill="#7a5a40"/><rect x="26" y="10" width="12" height="7" fill="#c45a30"/>`
  ),
  plate: svg(
    22,
    14,
    `<ellipse cx="11" cy="7" rx="10" ry="6" fill="#e8e0d0" stroke="#bbb"/>`
  ),
  bottle: svg(
    14,
    22,
    `<rect x="2" y="6" width="10" height="14" fill="#2a6a40"/><rect x="4" y="1" width="6" height="6" fill="#1a4a30"/>`
  ),
  lamp: svg(
    26,
    44,
    `<rect x="10" y="20" width="6" height="22" fill="#3a3020"/><path d="M2 22 L13 2 L24 22 Z" fill="#f5d76e"/>`
  ),
  crate: svg(
    40,
    32,
    `<rect x="2" y="2" width="36" height="28" rx="3" fill="#8b6914"/><rect x="6" y="6" width="28" height="20" fill="none" stroke="#5a4010"/><line x1="2" y1="16" x2="38" y2="16" stroke="#5a4010"/>`
  ),
  trash: svg(
    34,
    40,
    `<rect x="4" y="8" width="26" height="30" rx="4" fill="#3a4a3a"/><rect x="1" y="2" width="32" height="8" fill="#2a3a2a"/>`
  ),
  pot: svg(
    28,
    24,
    `<rect x="2" y="8" width="24" height="14" rx="4" fill="#444"/><rect x="6" y="2" width="16" height="8" fill="#222"/><circle cx="14" cy="4" r="5" fill="#e63946" fill-opacity=".5"/>`
  ),
  lounger: svg(
    80,
    34,
    `<rect x="2" y="2" width="76" height="30" rx="4" fill="#e8c547"/><rect x="6" y="6" width="24" height="22" fill="#ff6b35"/>`
  ),
  umbrella: svg(
    48,
    48,
    `<path d="M4 28 A20 20 0 0 1 44 28 Z" fill="#e63946"/><line x1="24" y1="28" x2="24" y2="46" stroke="#f7f0dd" stroke-width="3"/>`
  ),
  bench: svg(
    100,
    36,
    `<rect x="2" y="2" width="96" height="32" rx="4" fill="#6a4a30"/><rect x="6" y="6" width="88" height="12" fill="#8a6a50"/>`
  ),
  micbooth: svg(
    120,
    95,
    `<rect x="2" y="2" width="116" height="91" rx="10" fill="#1a1028" stroke="#7b2cbf" stroke-width="3"/><circle cx="60" cy="36" r="12" fill="#e8c547"/><rect x="56" y="36" width="8" height="36" fill="#aaa"/><text x="60" y="84" text-anchor="middle" fill="#f5d76e" font-size="11" font-family="sans-serif" font-weight="700">MIC</text>`
  ),
  camera: svg(
    32,
    55,
    `<rect x="12" y="22" width="8" height="30" fill="#333"/><rect x="2" y="2" width="28" height="24" rx="4" fill="#222"/><circle cx="16" cy="14" r="6" fill="#1e90ff"/>`
  ),
  curtain: svg(
    22,
    200,
    `<rect x="0" y="0" width="22" height="200" fill="#5a1a80"/><rect x="2" y="20" width="18" height="4" fill="#000" fill-opacity=".2"/><rect x="2" y="60" width="18" height="4" fill="#000" fill-opacity=".2"/><rect x="2" y="100" width="18" height="4" fill="#000" fill-opacity=".2"/><rect x="2" y="140" width="18" height="4" fill="#000" fill-opacity=".2"/>`
  ),
  wardrobe: svg(
    100,
    44,
    `<rect x="2" y="2" width="96" height="40" rx="3" fill="#4a3028"/><line x1="50" y1="2" x2="50" y2="42" stroke="#2a1810"/><circle cx="36" cy="22" r="3" fill="#e8c547"/><circle cx="64" cy="22" r="3" fill="#e8c547"/>`
  ),
  floor_wood: svg(
    64,
    64,
    `<rect width="64" height="64" fill="#3d2a18"/><path d="M0 16H64M0 32H64M0 48H64" stroke="#000" stroke-opacity=".18"/>`
  ),
  floor_tile: svg(
    64,
    64,
    `<rect width="32" height="32" fill="#5a4030"/><rect x="32" width="32" height="32" fill="#4a3220"/><rect y="32" width="32" height="32" fill="#4a3220"/><rect x="32" y="32" width="32" height="32" fill="#5a4030"/>`
  ),
  floor_grass: svg(
    64,
    64,
    `<rect width="64" height="64" fill="#1a4a3a"/><rect x="8" y="10" width="10" height="8" fill="#2ec4b6" fill-opacity=".25"/><rect x="40" y="28" width="10" height="8" fill="#2ec4b6" fill-opacity=".25"/><rect x="20" y="44" width="10" height="8" fill="#2ec4b6" fill-opacity=".25"/>`
  ),
  floor_purple: svg(
    64,
    64,
    `<rect width="32" height="32" fill="#3a2050"/><rect x="32" width="32" height="32" fill="#2a1840"/><rect y="32" width="32" height="32" fill="#2a1840"/><rect x="32" y="32" width="32" height="32" fill="#3a2050"/>`
  ),
  floor_gold: svg(
    64,
    64,
    `<rect width="32" height="32" fill="#5a4820"/><rect x="32" width="32" height="32" fill="#3a3010"/><rect y="32" width="32" height="32" fill="#3a3010"/><rect x="32" y="32" width="32" height="32" fill="#5a4820"/>`
  ),
  pickup_maggi: svg(
    48,
    48,
    `<rect x="4" y="8" width="40" height="32" rx="8" fill="#f5d76e" stroke="#fff6c8" stroke-width="2"/><text x="24" y="30" text-anchor="middle" font-size="12" font-weight="700" font-family="sans-serif">MG</text>`
  ),
  pickup_tomato: svg(
    48,
    48,
    `<rect x="4" y="8" width="40" height="32" rx="8" fill="#e63946" stroke="#fff6c8" stroke-width="2"/><text x="24" y="30" text-anchor="middle" font-size="12" font-weight="700" font-family="sans-serif" fill="#fff">TM</text>`
  ),
  pickup_mic: svg(
    48,
    48,
    `<rect x="4" y="8" width="40" height="32" rx="8" fill="#7b2cbf" stroke="#fff6c8" stroke-width="2"/><text x="24" y="30" text-anchor="middle" font-size="11" font-weight="700" font-family="sans-serif" fill="#fff">MIC</text>`
  ),
  pickup_luxury: svg(
    48,
    48,
    `<rect x="4" y="8" width="40" height="32" rx="8" fill="#2ec4b6" stroke="#fff6c8" stroke-width="2"/><text x="24" y="30" text-anchor="middle" font-size="11" font-weight="700" font-family="sans-serif">LUX</text>`
  ),
  pickup_captain: svg(
    48,
    48,
    `<rect x="4" y="8" width="40" height="32" rx="8" fill="#e8c547" stroke="#fff6c8" stroke-width="2"/><text x="24" y="30" text-anchor="middle" font-size="11" font-weight="700" font-family="sans-serif">CAP</text>`
  ),
  body_self: svg(
    64,
    64,
    `<ellipse cx="32" cy="52" rx="16" ry="6" fill="#000" fill-opacity=".3"/><ellipse cx="24" cy="48" rx="6" ry="4" fill="#2a1a10"/><ellipse cx="40" cy="48" rx="6" ry="4" fill="#2a1a10"/><ellipse cx="32" cy="36" rx="15" ry="16" fill="#e8c547"/><ellipse cx="32" cy="34" rx="10" ry="11" fill="#f5d76e"/><ellipse cx="16" cy="34" rx="5" ry="8" fill="#e8c547" transform="rotate(-20 16 34)"/><ellipse cx="48" cy="34" rx="5" ry="8" fill="#e8c547" transform="rotate(20 48 34)"/>`
  ),
  body_other: svg(
    64,
    64,
    `<ellipse cx="32" cy="52" rx="16" ry="6" fill="#000" fill-opacity=".3"/><ellipse cx="24" cy="48" rx="6" ry="4" fill="#2a1a10"/><ellipse cx="40" cy="48" rx="6" ry="4" fill="#2a1a10"/><ellipse cx="32" cy="36" rx="15" ry="16" fill="#3a90d0"/><ellipse cx="32" cy="34" rx="10" ry="11" fill="#5ab0e8"/><ellipse cx="16" cy="34" rx="5" ry="8" fill="#3a90d0" transform="rotate(-20 16 34)"/><ellipse cx="48" cy="34" rx="5" ry="8" fill="#3a90d0" transform="rotate(20 48 34)"/>`
  ),
  body_bot: svg(
    64,
    64,
    `<ellipse cx="32" cy="52" rx="16" ry="6" fill="#000" fill-opacity=".3"/><ellipse cx="24" cy="48" rx="6" ry="4" fill="#2a1a10"/><ellipse cx="40" cy="48" rx="6" ry="4" fill="#2a1a10"/><ellipse cx="32" cy="36" rx="15" ry="16" fill="#7a8899"/><ellipse cx="32" cy="34" rx="10" ry="11" fill="#9aabbc"/><ellipse cx="16" cy="34" rx="5" ry="8" fill="#7a8899" transform="rotate(-20 16 34)"/><ellipse cx="48" cy="34" rx="5" ry="8" fill="#7a8899" transform="rotate(20 48 34)"/>`
  ),
  body_attack: svg(
    64,
    64,
    `<ellipse cx="32" cy="52" rx="16" ry="6" fill="#000" fill-opacity=".3"/><ellipse cx="24" cy="48" rx="6" ry="4" fill="#2a1a10"/><ellipse cx="40" cy="48" rx="6" ry="4" fill="#2a1a10"/><ellipse cx="32" cy="36" rx="15" ry="16" fill="#ff6b35"/><ellipse cx="32" cy="34" rx="10" ry="11" fill="#ff8a55"/><ellipse cx="16" cy="34" rx="5" ry="8" fill="#ff6b35" transform="rotate(-20 16 34)"/><ellipse cx="48" cy="34" rx="5" ry="8" fill="#ff6b35" transform="rotate(20 48 34)"/>`
  ),
  enemy_bb: svg(
    64,
    64,
    `<ellipse cx="32" cy="54" rx="15" ry="5" fill="#000" fill-opacity=".3"/><rect x="14" y="28" width="36" height="28" rx="8" fill="#e8c547"/><circle cx="32" cy="20" r="14" fill="#1a1208" stroke="#e8c547" stroke-width="3"/><text x="32" y="24" text-anchor="middle" fill="#e8c547" font-size="11" font-weight="700" font-family="sans-serif">BB</text>`
  ),
  enemy_sk: svg(
    64,
    64,
    `<ellipse cx="32" cy="54" rx="15" ry="5" fill="#000" fill-opacity=".3"/><rect x="14" y="28" width="36" height="28" rx="8" fill="#1e90ff"/><circle cx="32" cy="20" r="14" fill="#1a1208" stroke="#1e90ff" stroke-width="3"/><text x="32" y="24" text-anchor="middle" fill="#1e90ff" font-size="11" font-weight="700" font-family="sans-serif">SK</text>`
  ),
  enemy_ed: svg(
    64,
    64,
    `<ellipse cx="32" cy="54" rx="15" ry="5" fill="#000" fill-opacity=".3"/><rect x="14" y="28" width="36" height="28" rx="8" fill="#e63946"/><circle cx="32" cy="20" r="14" fill="#1a1208" stroke="#e63946" stroke-width="3"/><text x="32" y="24" text-anchor="middle" fill="#e63946" font-size="11" font-weight="700" font-family="sans-serif">ED</text>`
  ),
  enemy_cam: svg(
    64,
    64,
    `<ellipse cx="32" cy="54" rx="15" ry="5" fill="#000" fill-opacity=".3"/><rect x="14" y="28" width="36" height="28" rx="8" fill="#7b2cbf"/><circle cx="32" cy="20" r="14" fill="#1a1208" stroke="#7b2cbf" stroke-width="3"/><text x="32" y="24" text-anchor="middle" fill="#7b2cbf" font-size="9" font-weight="700" font-family="sans-serif">CAM</text>`
  ),
};

for (const [name, content] of Object.entries(sprites)) {
  writeFileSync(join(dir, `${name}.svg`), content);
}

console.log(`Wrote ${Object.keys(sprites).length} sprites to public/ghar/`);
