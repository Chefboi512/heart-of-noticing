// Makes an in-chat preview copy of dist/ in dist-preview/. Run `node build.mjs` first.
// The real site (dist/) is untouched. The preview only differs where the chat viewer needs it to:
//   • clean paths (/meet-emily) become file links (meet-emily.html), since the viewer serves plain files
//   • images from the R2 bucket are swapped for local stand-ins (the viewer can't reach R2)
//   • the contact and sign-up forms pretend to send (the viewer blocks outside requests)
//   • index.html drops its <html>/<head>/<body> wrapper, because the viewer adds its own
import { readFile, writeFile, mkdir, rm, cp, readdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { site, pages } from "./src/site.config.mjs"

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(ROOT, "dist")
const OUT = path.join(ROOT, "dist-preview")
const STANDINS = path.join(ROOT, "preview-assets")

const fileFor = new Map(pages.map((p) => [p.path, p.file]))

// All artwork now ships with the site, so nothing needs swapping
const swapImages = {}

const FORM_SHIM = `<script>
(function () {
  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    if (url.indexOf("usebasin.com") !== -1) {
      // Typing an email that starts with "error@" shows the failed-to-send state
      var email = init && init.body && init.body.get ? String(init.body.get("email") || "") : "";
      var fail = /^error@/i.test(email);
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(new Response(fail ? '{"ok":false}' : '{"ok":true}', { status: fail ? 500 : 200, headers: { "Content-Type": "application/json" } }));
        }, 1100);
      });
    }
    return realFetch(input, init);
  };
})();
</script>
<style>
  form[action*="usebasin"]::before {
    content: "Preview: nothing is sent from here. Use error@test.com to see the error state."; display: block; margin-bottom: 4px;
    font: 500 12px/1.4 var(--font-body); letter-spacing: .04em; color: var(--amber-deep);
    background: rgba(201,138,60,.12); border-radius: 10px; padding: 10px 12px;
  }
</style>`

function rewriteLinks(html) {
  html = html.replace(/srcset="([^"]*)"/g, (m, v) => `srcset="${v.replace(/(^|,\s*)\/(images|assets)\//g, "$1$2/")}"`)
  return html.replace(/\b(href|src|poster)="(\/[^"]*)"/g, (whole, attr, url) => {
    const cut = url.search(/[?#]/)
    const pathPart = cut < 0 ? url : url.slice(0, cut)
    const query = cut < 0 ? "" : url.slice(cut)
    if (fileFor.has(pathPart)) return `${attr}="${fileFor.get(pathPart)}${query}"`
    if (pathPart.startsWith("/assets/") || pathPart.startsWith("/images/") || pathPart.startsWith("/fonts/") || pathPart === "/favicon.svg") return `${attr}="${pathPart.slice(1)}${query}"`
    return whole
  })
}

const swapAssets = (html) =>
  Object.entries(swapImages).reduce((s, [from, to]) => s.split(from).join(to), html)

// The viewer wraps the entry page in its own document, so keep only what goes inside it
function unwrap(html) {
  return html
    .replace(/<!doctype html>\s*/i, "")
    .replace(/<html[^>]*>\s*/i, "")
    .replace(/<\/?head>\s*/gi, "")
    .replace(/<body[^>]*>\s*/i, "")
    .replace(/\s*<\/body>\s*<\/html>\s*$/i, "\n")
    .replace(/<title>[^<]*<\/title>/, "<title>The Heart of Noticing</title>")
}

async function main() {
  await rm(OUT, { recursive: true, force: true })
  await mkdir(path.join(OUT, "assets"), { recursive: true })
  await cp(path.join(DIST, "assets"), path.join(OUT, "assets"), { recursive: true })
  await cp(path.join(DIST, "favicon.svg"), path.join(OUT, "favicon.svg"))
  await cp(path.join(DIST, "images"), path.join(OUT, "images"), { recursive: true })
  await cp(path.join(DIST, "fonts"), path.join(OUT, "fonts"), { recursive: true })
  for (const f of await readdir(STANDINS).catch(() => [])) await cp(path.join(STANDINS, f), path.join(OUT, "assets", f))

  for (const page of pages) {
    let html = await readFile(path.join(DIST, page.file), "utf8")
    html = swapAssets(rewriteLinks(html))
    if (html.includes("usebasin.com")) html = html.replace("</head>", FORM_SHIM + "\n</head>")
    if (page.file === "index.html") html = unwrap(html)
    await writeFile(path.join(OUT, page.file), html)
  }

  const leftovers = []
  for (const page of pages) {
    const html = await readFile(path.join(OUT, page.file), "utf8")
    for (const m of html.matchAll(/\b(?:href|src|poster)="(\/[^"]*|https:\/\/pub-[^"]*)"/g)) leftovers.push(`${page.file}: ${m[1]}`)
  }
  if (leftovers.length) {
    console.error("Links the preview can't follow:\n" + leftovers.join("\n"))
    process.exit(1)
  }
  console.log(`Preview ready in dist-preview/ (${pages.length} pages)`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
