# The Heart of Noticing

Somatic breathwork website for Emily, Lancaster County, PA.
Plain HTML, CSS and JavaScript, with no framework and nothing to install. Node 18 or newer builds it.

## Build and preview

```
npm run build         # writes the finished site to dist/ (same as: node build.mjs)
npm run dev           # builds, then serves it at http://localhost:8788
```

There are no dependencies, so there is nothing to `npm install`. `dist/` is generated and is not committed.

## Deploy on Cloudflare Pages

- Build command: `npm run build` (or `node build.mjs`)
- Build output directory: `dist`
- Node version: 18 or newer (Cloudflare's default is fine)

Clean URLs (`/nature-groups`, `/meet-emily`, and so on) work on Cloudflare automatically.
`public/_redirects` holds short links (for example `/book` goes to `/connect`), and `public/_headers` sets caching.

## Where things live

| To change | Edit |
|---|---|
| Phone, form address, the announcement strip, page titles and descriptions, the menu | `src/site.config.mjs` |
| The words on a page | `src/pages/<page>.html` |
| Header, footer, the service cards on the home page, the Circle sign-up form | `src/partials/` |
| Colours, type, layout | `src/assets/site.css` |
| Menu, header, button pop and haptics, birds, body journey, glowing service cards, home chapter guide, line reveals, forms | `src/assets/site.js` |
| The moving stream on Nature Groups | `src/assets/stream.js` and `public/images/stream/` |
| The animated tree, the body figure and the rising-breath picture | `src/scene.mjs` |

**Announcement strip.** In `site.config.mjs`, change `announce.detail` from `"[Date]"` to the real date, or set `announce: null` to hide the strip.

**Placeholders.** Anything still in `[brackets]` is content Emily needs to supply, such as session length, prices, dates, meeting places and FAQ answers. These show on the page as marked slots until they're filled in. To find them all, search `src/pages/` for `[`.

**Background colour flow.** Each page drifts through its own soft colours as you scroll. Set it per page with `flow:` in `site.config.mjs`; the choices are dawn, earth, body, room, circle and dusk. The colours themselves are the `.flow-*` rules in `site.css`.

## Other files

- `serve.mjs`: a tiny local server for `npm run dev`, with clean URLs like Cloudflare's.
- `preview.mjs`: only makes the in-chat preview work. The live site doesn't need it.

## Artwork

All artwork ships with the site in `public/images/`: the tree (`tree.webp`), the two bird sprites, Emily's animation (`emily.mp4`, with `emily.webm` as a fallback and `emily-still.webp` as its still), the drawing of Emily leading a session (`emily-session.webp`), the photo of Emily on the home page (`emily-photo.webp`), the forest-floor photo behind the closing panel on the home page, and the stream textures. To swap a piece, replace the file and keep its name.

The fonts also ship with the site, in `public/fonts/`: Fraunces (upright and italic), Jost and Dancing Script, trimmed to Latin and to the weights in use. Their open font licences sit alongside them. The site no longer loads anything from Google Fonts.
