// Renders the site's SVG art at build time: the home tree scene and the body
// figure on the 1-on-1 page.
import { TRACES, TRACE_TRANSFORM, BODY_PARTS } from "./scene-data.mjs"

const round = (n) => Math.round(n * 100) / 100

// Turns the traced point lists into soft curves (same maths as the original React version)
export function smoothPath(d) {
  return d
    .split("M")
    .filter((s) => s.trim())
    .map((segment) => {
      const points = segment.trim().split(" L ").map((pt) => {
        const [x, y] = pt.split(",")
        return { x: parseFloat(x), y: parseFloat(y) }
      })
      if (points.length < 3) return "M " + segment.trim()
      let p = `M ${points[0].x},${points[0].y} `
      for (let i = 1; i < points.length - 1; i++) {
        const xc = round((points[i].x + points[i + 1].x) / 2)
        const yc = round((points[i].y + points[i + 1].y) / 2)
        p += `Q ${points[i].x},${points[i].y} ${xc},${yc} `
      }
      const last = points[points.length - 1]
      return p + `L ${last.x},${last.y}`
    })
    .join(" ")
}

const gradient = (id) =>
  `<linearGradient id="${id}" x1="0%" y1="100%" x2="100%" y2="0%">` +
  `<stop offset="0%" stop-color="#F5DF9E" stop-opacity="0.85"/>` +
  `<stop offset="30%" stop-color="#D98A3C" stop-opacity="0.85"/>` +
  `<stop offset="70%" stop-color="#C77DFF" stop-opacity="0.75"/>` +
  `<stop offset="100%" stop-color="#7B2CBF" stop-opacity="0.55"/>` +
  `</linearGradient>`

// Soft glow from three stacked strokes (no blur filters, so it stays smooth on phones)
const GLOW = [[11, 0.12], [6, 0.22], [2.2, 1]]

const trace = (d, duration, delay, gradientId) =>
  `<g class="trace" style="animation-duration:${duration}s,${duration}s;animation-delay:${delay}s,${delay}s">` +
  GLOW.map(([w, o]) =>
    `<path d="${d}" pathLength="1" fill="none" stroke="url(#${gradientId})" stroke-width="${w}" stroke-opacity="${o}" stroke-linecap="round"/>`
  ).join("") +
  `</g>`

const bird = (kind, size, img) => {
  const h = size / 2
  const start = kind === "header" ? "translate(-100px, 262px)" : "translate(-100px, 500px)"
  return (
    `<g class="bird" data-bird="${kind}" style="opacity:0;transform:${start}">` +
    `<g class="bird__body is-flapping" data-bird-body>` +
    `<image class="bird__open" href="${img.birdOpen}" x="-${h}" y="-${h}" width="${size}" height="${size}"/>` +
    `<image class="bird__closed" href="${img.birdClosed}" x="-${h}" y="-${h}" width="${size}" height="${size}"/>` +
    `</g></g>`
  )
}

// Home page: the tree, its breath lines and the two birds
export function treeScene(img) {
  const lines = TRACES.map((t) => {
    // Negative delays start each line mid-breath, so the tree is already alive on load
    const delay = -((t.delay + 6) % t.duration)
    return `<g transform="translate(${t.dx} ${t.dy})">${trace(smoothPath(t.d), t.duration, delay, "flow")}</g>`
  }).join("")

  return (
    `<svg class="tree-scene" data-tree-scene viewBox="24 240 752 962" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A hand-drawn tree with colorful breath lines moving through its branches">` +
    `<defs>${gradient("flow")}</defs>` +
    `<image class="tree-scene__tree" href="${img.tree}" x="12" y="-135" width="784" height="1342" preserveAspectRatio="xMidYMid meet"/>` +
    `<g transform="${TRACE_TRANSFORM}">${lines}</g>` +
    `<g aria-hidden="true">${bird("header", 50, img)}${bird("hole", 40, img)}</g>` +
    `</svg>`
  )
}

// 1-on-1 page: the segmented body figure. Head, chest, stomach and legs are selectable.
const SELECTABLE = new Set(["head", "chest", "stomach", "legs"])
const DRAW_ORDER = ["head", "shoulder", "arm", "chest", "stomach", "hands", "legs"]

export function bodyFigure() {
  const parts = DRAW_ORDER.map((id) => BODY_PARTS.find((p) => p.id === id)).map((p) => {
    const selectable = SELECTABLE.has(p.id)
    const cls = `body-part${p.id === "head" ? " is-active" : ""}`
    return (
      `<g class="${cls}" data-part="${p.id}"${selectable ? " data-selectable" : ""} transform="translate(${p.x} ${p.y})">` +
      `<rect width="${p.w}" height="${p.h}" fill="transparent"/>` +
      `<path d="${p.d}"/>` +
      `</g>`
    )
  })
  return `<svg class="body-figure" viewBox="0 -8 207 502" aria-hidden="true" focusable="false">${parts.join("")}</svg>`
}

// 1-on-1 page: a single breath rising. A glowing point travels up the line as you breathe in
// (4 seconds), rests (1 second) and sinks back down as you breathe out (5 seconds).
const BREATH_PATH = "M100 236 C62 210 138 180 100 150 S62 90 100 62 S114 34 100 20"

export function breathArt() {
  const motion =
    `<animateMotion dur="10s" repeatCount="indefinite" calcMode="spline" keyPoints="0;1;1;0" keyTimes="0;0.4;0.5;1" ` +
    `keySplines="0.45 0 0.55 1;0 0 1 1;0.45 0 0.55 1"><mpath href="#breath-path"/></animateMotion>`
  return (
    `<svg class="breath-art" data-smil viewBox="0 0 200 250" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">` +
    `<defs>` +
    `<linearGradient id="breath-rise" gradientUnits="userSpaceOnUse" x1="0" y1="240" x2="0" y2="16">` +
    `<stop offset="0" stop-color="#7B2CBF" stop-opacity="0"/><stop offset="0.3" stop-color="#C77DFF"/>` +
    `<stop offset="0.68" stop-color="#D98A3C"/><stop offset="1" stop-color="#F5DF9E" stop-opacity="0"/>` +
    `</linearGradient>` +
    `<radialGradient id="breath-orb" cx="0.38" cy="0.32" r="0.75">` +
    `<stop offset="0" stop-color="#FFF7E6"/><stop offset="0.4" stop-color="#F5DF9E"/><stop offset="0.75" stop-color="#D98A3C"/><stop offset="1" stop-color="#9B5CE0"/>` +
    `</radialGradient>` +
    `<radialGradient id="breath-halo"><stop offset="0" stop-color="#F5DF9E" stop-opacity="0.55"/><stop offset="1" stop-color="#F5DF9E" stop-opacity="0"/></radialGradient>` +
    `<filter id="breath-soft" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="5"/></filter>` +
    `</defs>` +
    `<path id="breath-path" class="breath-art__glow" d="${BREATH_PATH}" filter="url(#breath-soft)"/>` +
    `<path class="breath-art__line" d="${BREATH_PATH}"/>` +
    `<circle class="breath-art__halo" r="22" fill="url(#breath-halo)" cx="0" cy="0">${motion}</circle>` +
    `<circle class="breath-art__orb" r="6.5" fill="url(#breath-orb)" cx="0" cy="0">${motion}</circle>` +
    `</svg>`
  )
}
