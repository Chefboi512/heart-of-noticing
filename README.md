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

## Author

© 2026 Media Mack Designs. All Rights Reserved.
