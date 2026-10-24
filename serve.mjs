// Local preview of dist/ with the same clean URLs Cloudflare Pages uses (/meet-emily → meet-emily.html).
// Usage: npm run dev   then open http://localhost:8788
import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), process.argv[2] || "dist")
const PORT = Number(process.env.PORT) || 8788
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
  ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".xml": "application/xml", ".txt": "text/plain",
  ".mp4": "video/mp4", ".webm": "video/webm", ".woff2": "font/woff2", ".ico": "image/x-icon",
}

const isFile = async (p) => (await stat(p).catch(() => null))?.isFile()

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname)
  const base = path.join(DIST, path.normalize(url).replace(/^(\.\.[/\\])+/, ""))
  const candidates = url.endsWith("/") ? [path.join(base, "index.html")] : [base, base + ".html"]
  for (const file of candidates) {
    if (await isFile(file)) {
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" })
      return res.end(await readFile(file))
    }
  }
  res.writeHead(404, { "Content-Type": TYPES[".html"] })
  res.end(await readFile(path.join(DIST, "404.html")).catch(() => "Not found"))
}).listen(PORT, () => console.log(`Serving ${path.basename(DIST)}/ at http://localhost:${PORT}`))
