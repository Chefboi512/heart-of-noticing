// Builds the static site into dist/. Plain Node 18+, nothing to install.
//
// Template placeholders used in src/:
//   {{ page.title }}      a value, HTML-escaped
//   {{ raw.content }}     prebuilt HTML, inserted as-is
//   {{> header }}         a file from src/partials/
//   {{ tree_scene }}      the animated tree (home page)
//   {{ body_figure }}     the body figure (home page journey)
//   {{ breath_art }}      the rising breath line (1-on-1 page, and its preview on the home page)
import { readFile, writeFile, mkdir, rm, cp } from "node:fs/promises"
import { createHash } from "node:crypto"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { site, pages } from "./src/site.config.mjs"
import { treeScene, bodyFigure, breathArt } from "./src/scene.mjs"

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(ROOT, "src")
const OUT = path.join(ROOT, "dist")

const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const lookup = (ctx, key) => key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), ctx)

async function expandPartials(html, depth = 0) {
  const matches = [...html.matchAll(/\{\{>\s*([\w-]+)\s*\}\}/g)]
  if (!matches.length) return html
  if (depth > 5) throw new Error("Partials nested too deeply")
  for (const m of matches) {
    const partial = await readFile(path.join(SRC, "partials", `${m[1]}.html`), "utf8")
    html = html.replace(m[0], () => partial.trimEnd())
  }
  return expandPartials(html, depth + 1)
}

function fill(html, ctx, file) {
  return html.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_, expr) => {
    const [name] = expr.trim().split(/\s+/)
    if (name === "tree_scene") return treeScene(site.images)
    if (name === "body_figure") return bodyFigure()
    if (name === "breath_art") return breathArt()
    const value = lookup(ctx, name)
    if (value === undefined) throw new Error(`${file}: unknown placeholder {{ ${expr} }}`)
    return name.startsWith("raw.") ? value : escapeHtml(value)
  })
}

// Copies a file into dist/assets with a content hash in its name, so it can be cached forever
async function fingerprint(rel) {
  const buf = await readFile(path.join(SRC, rel))
  const hash = createHash("sha256").update(buf).digest("hex").slice(0, 10)
  const ext = path.extname(rel)
  const name = `assets/${path.basename(rel, ext)}.${hash}${ext}`
  await writeFile(path.join(OUT, name), buf)
  return "/" + name
}

const pageUrl = (p) => site.origin + p.path

function menuLinks(current) {
  return pages
    .filter((p) => p.nav)
    .map((p) => {
      const isHere = p === current
      const here = isHere ? ' aria-current="page"' : ""
      const tag = isHere ? '<span class="menu__here" aria-hidden="true">You’re here</span>' : ""
      return `          <li><a class="menu__link" href="${p.path}"${here}><span class="menu__title">${escapeHtml(p.nav.title)}</span><span class="menu__sub">${escapeHtml(p.nav.sub)}${tag}</span></a></li>`
    })
    .join("\n")
}

function footerLinks(current) {
  return pages
    .filter((p) => p.nav)
    .map((p) => `      <a href="${p.path}"${p === current ? ' aria-current="page"' : ""}>${escapeHtml(p.nav.title)}</a>`)
    .join("\n")
}

function bodyClass(page) {
  const classes = [page.theme && `theme-${page.theme}`, page.flow && `flow-${page.flow}`].filter(Boolean)
  return classes.length ? ` class="${classes.join(" ")}"` : ""
}

// Text in [brackets] is a placeholder Emily still needs to fill in
const maybeSlot = (text) => (/^\[.*\]$/.test(text) ? `<span class="slot">${escapeHtml(text)}</span>` : escapeHtml(text))

// A long label for wide screens and a short one for phones (only one is ever displayed)
const both = (long, short) =>
  short ? `<span class="announce__long">${escapeHtml(long)}</span><span class="announce__short">${escapeHtml(short)}</span>` : escapeHtml(long)

function announceBar() {
  const a = site.announce
  if (!a) return ""
  return `<div class="announce">
  <div class="wrap announce__inner">
    <a class="announce__text" href="${a.href}"><span class="announce__dot" aria-hidden="true"></span>${both(a.label, a.labelShort)} <span aria-hidden="true">·</span> ${maybeSlot(a.detail)}</a>
    <a class="announce__link" href="${a.ctaHref || a.href}">${both(a.cta, a.ctaShort)}<span aria-hidden="true"> →</span></a>
  </div>
</div>`
}

function structuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: site.name,
    url: site.origin + "/",
    image: site.origin + "/og-image.jpg",
    description: "Somatic breathwork, 1-on-1 sessions, and guided nature groups to help you slow down and reconnect.",
    telephone: site.phone.schema,
    areaServed: { "@type": "Place", name: site.area },
    founder: { "@type": "Person", name: "Emily" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Somatic Breathwork Services",
      itemListElement: pages
        .filter((p) => p.offer)
        .map((p, i) => ({
          "@type": "Offer",
          position: i + 1,
          itemOffered: { "@type": "Service", name: p.offer, description: p.description, url: pageUrl(p) },
        })),
    },
  }
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`
}

async function build() {
  await rm(OUT, { recursive: true, force: true })
  await mkdir(path.join(OUT, "assets"), { recursive: true })
  await cp(path.join(ROOT, "public"), OUT, { recursive: true })

  const asset = {
    css: await fingerprint("assets/site.css"),
    js: await fingerprint("assets/site.js"),
    stream: await fingerprint("assets/stream.js"),
  }
  const layout = await expandPartials(await readFile(path.join(SRC, "layout.html"), "utf8"))

  for (const page of pages) {
    const source = await expandPartials(await readFile(path.join(SRC, "pages", page.file), "utf8"))
    const ctx = { site, asset, img: site.images, page: { ...page, url: pageUrl(page), themeColor: "#EAE5D4" } }
    const content = fill(source, ctx, page.file)
    const headExtra = [
      page.noindex ? '<meta name="robots" content="noindex">' : "",
      page.structuredData ? structuredData() : "",
      page.stream ? `<script src="${asset.stream}" defer></script>` : "",
      // The tree is the first thing anyone sees, so fetch it ahead of everything else
      source.includes("{{ tree_scene }}") ? `<link rel="preload" as="image" href="${site.images.tree}" fetchpriority="high">` : "",
      page.preloadImage ? `<link rel="preload" as="image" href="${page.preloadImage}" fetchpriority="high">` : "",
    ].filter(Boolean).join("\n")
    const raw = {
      content,
      headExtra,
      bodyAttr: bodyClass(page),
      announce: announceBar(),
      menuLinks: menuLinks(page),
      here: page.nav
        ? `<span class="here" aria-hidden="true">${escapeHtml(page.nav.title)}</span>`
        : page.file === "index.html" ? '<span class="here" aria-hidden="true" data-here-chapter>Welcome</span>' : "",
      footerLinks: footerLinks(page),
    }
    const html = fill(layout, { ...ctx, raw }, "layout.html")
    await writeFile(path.join(OUT, page.file), html)
  }

  const listed = pages.filter((p) => !p.noindex)
  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    listed.map((p) => `  <url><loc>${pageUrl(p)}</loc></url>`).join("\n") +
    `\n</urlset>\n`
  await writeFile(path.join(OUT, "sitemap.xml"), sitemap)
  await writeFile(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\n`)

  console.log(`Built ${pages.length} pages into dist/ (${asset.css}, ${asset.js})`)
}

build().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
