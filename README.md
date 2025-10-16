# Inlits – Stories, Ideas, and Communities Unite

Inlits is a learning-and-storytelling platform that helps readers discover content, follow creators, and track progress across articles, e‑books, audiobooks, and podcasts. The app now runs on Remix (with Vite) and provides a unified `/user/:username` profile for both creators and consumers.

---

## Features

- **Unified Profiles** – a single profile route for every member with creator insights (identity, contributions, circles, achievements) plus creator dashboards when applicable.
- **Flexible Content Types** – articles, e-books, audiobooks, podcasts, and series rendered with rich layouts and offline caching.
- **Creator Toolkit** – dashboards for publishing and managing content, analytics, appointments, and earnings.
- **Community Engagement** – book clubs, discussions, study groups, and learning challenges.
- **Personalized Experience** – saved shelves, learning goals, recommendations, and quick category filters.
- **Resilient UX** – cached home feed, Supabase retry helpers, and graceful fallbacks for images and network blips.

---

## Tech Stack

| Layer        | Tools |
|--------------|-------|
| Web          | [Remix](https://remix.run/) + [Vite](https://vitejs.dev/), React 18, TypeScript, Zustand |
| Styling      | Tailwind CSS, Tailwind Merge, Lucide Icons |
| Backend      | Supabase (Auth, Postgres, Realtime, Edge Functions) |
| DX & Quality | ESLint 9, TypeScript strict mode, Vite PWA plugin |

---

## Quick Start

1. **Clone & Install**
   ```bash
   git clone <YOUR-REPO-URL>
   cd inlits
   npm install
   ```

2. **Environment**
   Copy `.env.example` (if available) or create `.env` with the Supabase keys:
   ```bash
   VITE_SUPABASE_URL=<your-url>
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```

3. **Run Dev Server**
   ```bash
   npm run dev
   ```
   Remix’s Vite dev server will start at `http://localhost:5173` (auto-picks a new port if occupied).

4. **Type Check & Lint (optional)**
   ```bash
   npm run typecheck
   npm run lint
   ```

5. **Production Build**
   ```bash
   npm run build
   npm run preview      # optional local preview
   ```

---

## Available Scripts

| Script            | Description |
|-------------------|-------------|
| `npm run dev`     | Remix + Vite development server (with HMR). |
| `npm run build`   | Production build (client + server bundles). |
| `npm run preview` | Serve the production build locally. |
| `npm run start`   | Run the built Remix server (after `build`). |
| `npm run lint`    | ESLint with the project config. |
| `npm run typecheck` | TypeScript project check. |

---

## Project Structure

```
├── app/                   # Remix application (routes, loaders, components)
│   ├── components/        # UI building blocks (shared)
│   ├── lib/               # Auth, API helpers, hooks, store
│   ├── routes/            # Remix route modules
│   ├── pages/             # Legacy React pages bridged through Remix
│   ├── root.tsx, entry.*  # Remix app shell & entry points
├── public/                # Static assets (PWA, redirects)
├── supabase/              # SQL, edge functions, migrations (if checked in)
├── eslint.config.js
├── tailwind.config.js
├── vite.config.ts         # Remix+Vite integration & plugins
├── remix.env.d.ts         # Remix environment types
└── package.json
```

> **Note**: We keep some legacy React pages under `app/pages` and expose them through Remix routes for backwards compatibility. When migrating new routes, prefer Remix file-based routing in `app/routes`.

---

## Deployment (Netlify Example)

1. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured in Netlify’s dashboard.
2. Push to GitHub.
3. In Netlify, create a new site from that repo.
4. Netlify auto-detects the build (`npm run build`) and publish directory (`build`).
5. For manual deploys via CLI:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init    # or netlify link
   npm run build
   netlify deploy --prod
   ```

The generated PWA assets (`sw.js`, manifest) are emitted under `build/client` during the Remix+Vite build.

---

## Suggested Checks Before Shipping

- `npm run build` (verifies client + server bundles)
- `npm run typecheck` and `npm run lint`
- Smoke-test a creator vs consumer session (sign in/out, dashboard, `/user/:username`, `/dashboard/:username`)
- Confirm Supabase keys / OAuth callbacks configured on the target environment

---

## Contributing

Issues and PRs are welcome. When contributing:

1. Fork & branch: `git checkout -b feature/my-change`
2. Make changes + run `npm run lint` and `npm run typecheck`
3. Commit with context
4. Open a PR describing the change and any deployment considerations

---

## License

Copyright © Inlits. All rights reserved.
