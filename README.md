# BB20Followers

Bigg Boss Hindi Season 20 Instagram follower board — sortable web app with BB20 branding and live KOYRO refresh.

Built for [**@bigbossgossipverse**](https://www.instagram.com/bigbossgossipverse/).

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

Production-style (static + KOYRO proxy):

```bash
npm run build
npm start
```

## Features

- Sort by today / week / 30 days / since entry / total / name
- Search by contestant name or Instagram handle
- **Refresh live data** — pulls latest KOYRO season snapshot
- Contestant avatars, BB20 logo / eye motif, gold + multicolor iris theme
- Links to Instagram + GitHub

## Deploy (Railway)

No database needed. One Node service serves the SPA and proxies `/koyro/*` to KOYRO (rate-limited).

```bash
railway init -n BB20Followers
railway up
railway domain
```

## Data

- Live counts / % from [KOYRO](https://koyro.in/shows/bigg-boss/season-20)
- Entry baselines from premiere / wildcard reports
- **Amrapali entry = 6.0M** (5 Sept report)
- Fallbacks in `src/data.ts`
