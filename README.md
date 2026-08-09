# The Heart of Noticing

A somatic breathwork website for Lancaster County, PA. Interactive tree visualization with acorn navigation nodes, animated breathing paths, and a glassmorphism editorial modal system.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite 6** (build tool, HMR)
- **Tailwind CSS 3** (utility-first styling)
- **Framer Motion** (animations, gestures, layout transitions)
- **Lucide React** (icons)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview
```

The dev server runs on `http://localhost:5173` by default.

## Project Structure

```
src/
├── App.tsx          # Main component: tree scene, acorn nodes, modals, body explorer
├── main.tsx         # React entry point
├── index.css        # Global Tailwind directives
└── components/      # Reusable UI primitives
```

The application is a single-page interactive experience:
- An animated SVG tree background with traced breath paths
- 5 interactive acorn nodes (The Guide, Notice the Body, Notice the Earth, Notice the Room, Stay Close)
- An interactive "body explorer" with brain/heart/gut/feet segments
- Glassmorphism modals with smooth blur transitions
- Haptic feedback on supported mobile devices (`navigator.vibrate`)

## Asset Hosting

All images and GIFs are hosted on Cloudflare R2:
- Tree artwork, bird sprites, acorn icon
- Emily portrait (animated GIF)
- Stencil artwork (animated GIF)

## Notes

- The "use client" directive at the top of `App.tsx` is harmless in a Vite SPA (it's a no-op string outside Next.js).
- Designed mobile-first; optimized for touch interactions.

## Deploying to Cloudflare Pages

This project is pre-configured for Cloudflare Pages:

- **`public/_redirects`** — SPA fallback so any unknown path serves `index.html` (state-based navigation works on refresh).
- **`public/_headers`** — Cache & security headers:
  - `Cache-Control: public, max-age=31536000, immutable` for `/assets/*` (hashed Vite bundles)
  - `Cache-Control: public, max-age=0, must-revalidate` for `/*` (always-fresh HTML)
  - `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Quick deploy

1. Push this repo to GitHub ✅ (already done)
2. In Cloudflare dashboard → **Pages** → **Create a project** → **Connect to Git**
3. Select the `Chefboi512/heart-of-noticing` repo
4. Set the build settings:

   | Field | Value |
   |---|---|
   | **Framework preset** | Vite |
   | **Build command** | `pnpm build` |
   | **Build output directory** | `dist` |
   | **Root directory** | (leave blank) |
   | **Node version** | 20 (or latest) |

5. Click **Save and Deploy** — first build takes ~1–2 min

### CLI deploy (alternative)

```bash
npm install -g wrangler
pnpm build
wrangler pages deploy dist --project-name=heart-of-noticing
```

### Why the static asset path

Vite outputs hashed JS/CSS to `/assets/[name]-[hash].js`. The `_headers` rule sets `max-age=31536000, immutable` for that path because the hash changes whenever the content changes, so the browser can safely cache them forever. The HTML files are always revalidated.

## Author

© 2026 Media Mack Designs. All Rights Reserved.
