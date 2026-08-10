"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Wind } from "lucide-react"

// ── Theme Constants ──
const C = "#183624"
const BG = "#EAE5D4"
const AMBER = "#C98A3C"

// ── Asset URLs ──
const IMG_URL = "https://pub-f30bd9ec57cb4bbfb41bc8336c0bbf81.r2.dev/TheHeartOfNoticing/MainTree.webp"
const BIRD_OPEN = "https://pub-f30bd9ec57cb4bbfb41bc8336c0bbf81.r2.dev/TheHeartOfNoticing/BirdSpriteOpenWings.webp"
const BIRD_CLOSED = "https://pub-f30bd9ec57cb4bbfb41bc8336c0bbf81.r2.dev/TheHeartOfNoticing/BirdSpriteClosedWings.webp"
const ACORN_URL = "https://pub-f30bd9ec57cb4bbfb41bc8336c0bbf81.r2.dev/TheHeartOfNoticing/Acorn.webp"
const STENCIL_GIF = "https://pub-f30bd9ec57cb4bbfb41bc8336c0bbf81.r2.dev/TheHeartOfNoticing/IMG_5166.gif"
const EMILY_GIF = "https://pub-f30bd9ec57cb4bbfb41bc8336c0bbf81.r2.dev/TheHeartOfNoticing/IMG_5179.gif"

// ── Fixed Scaling Wrapper ──
const TRACE_TRANSFORM = "translate(400, 565) scale(0.97) translate(-400, -540)"

// ── Biological Easing Curves ──
const bioEase = [0.25, 1, 0.5, 1]
const slowBioEase = [0.33, 1, 0.68, 1]

// ── Tactile Physics ──
const squishSpring = { type: "spring", stiffness: 600, damping: 20, mass: 0.8 }
const snapSpring = { type: "spring", stiffness: 400, damping: 25 }

// ── Hardware Haptic Engine ──
const triggerHaptic = (pattern = [15]) => {
  if (typeof window !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// ── Smooth organic curves converter ──
const smoothPath = (d) => {
  return d
    .split("M")
    .filter(Boolean)
    .map((segment) => {
      const points = segment
        .trim()
        .split(" L ")
        .map((pt) => {
          const [x, y] = pt.split(",")
          return { x: parseFloat(x), y: parseFloat(y) }
        })
      if (points.length < 3) return "M " + segment
      let p = `M ${points[0].x},${points[0].y} `
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2
        const yc = (points[i].y + points[i + 1].y) / 2
        p += `Q ${points[i].x},${points[i].y} ${xc},${yc} `
      }
      p += `L ${points[points.length - 1].x},${points[points.length - 1].y}`
      return p
    })
    .join(" ")
}

// ── Traced paths ──
const TRACED_PATHS = [
  { name: "Main Center Trunk", dx: -4.5, dy: 0, delay: 0, duration: 20, d: "M 341.2,705.9 L 366.7,762.7 L 364.7,843.1 L 349.0,900.0 L 360.8,933.3 L 351.0,964.7 L 333.3,966.7 L 311.8,976.5 L 300.0,994.1 L 290.2,1002.0 L 264.7,1002.0 L 233.3,1017.6 M 468.6,700.0 L 445.1,751.0 L 447.1,794.1 L 452.9,854.9 L 451.0,872.5 L 464.7,921.6 L 470.6,968.6 L 500.0,984.3 L 547.1,1002.0 L 588.2,1023.5 L 619.6,1047.1" },
  { name: "Limb One", dx: 20, dy: -2, delay: 4, duration: 18, d: "M 358.8,678.4 L 345.1,629.4 L 282.4,603.9 L 237.3,588.2 L 160.8,603.9 L 109.8,633.3 L 84.3,658.8 L 52.9,615.7 L 86.3,498.0 L 96.1,488.2 L 113.7,513.7 L 129.4,558.8 L 166.7,586.3 L 190.2,584.3 L 166.7,566.7 L 192.2,566.7 L 227.5,576.5 L 239.2,578.4 L 237.3,560.8 L 247.1,551.0 L 256.9,568.6 L 290.2,580.4 L 274.5,547.1 L 286.3,535.3 L 272.5,519.6 L 270.6,513.7 L 264.7,496.1 L 294.1,509.8 L 302.0,535.3 L 311.8,564.7 L 317.6,574.5 L 356.9,598.0 L 370.6,607.8 L 356.9,674.5" },
  { name: "Limb Two", dx: 14, dy: 0, delay: 8, duration: 19, d: "M 362.7,596.1 L 323.5,513.7 L 239.2,486.3 L 219.6,456.9 L 231.4,458.8 L 213.7,425.5 L 162.7,413.7 L 145.1,403.9 L 194.1,358.8 L 278.4,317.6 L 370.6,296.1 L 390.2,302.0 L 396.1,319.6 L 376.5,356.9 L 329.4,407.8 L 319.6,452.9 L 335.3,466.7 L 347.1,511.8 L 358.8,539.2 L 368.6,496.1 L 351.0,472.5 L 349.0,456.9 L 382.4,472.5 L 403.9,454.9 L 407.8,488.2 L 396.1,511.8 L 382.4,519.6 L 370.6,535.3 L 388.2,572.5 L 398.0,613.7 L 362.7,596.1" },
  { name: "Limb Three", dx: -14, dy: 0, delay: 2, duration: 22, d: "M 405.9,623.5 L 427.5,537.3 L 411.8,498.0 L 423.5,484.3 L 437.3,462.7 L 454.9,466.7 L 443.1,490.2 L 449.0,515.7 L 452.9,531.4 L 482.4,431.4 L 454.9,384.3 L 429.4,333.3 L 411.8,303.9 L 541.2,321.6 L 588.2,356.9 L 643.1,396.1 L 645.1,409.8 L 613.7,419.6 L 588.2,437.3 L 568.6,447.1 L 562.7,464.7 L 584.3,478.4 L 486.3,502.0 L 470.6,552.9 L 447.1,611.8 L 409.8,627.5" },
  { name: "Limb Four", dx: -14, dy: -9, delay: 11, duration: 19, d: "M 435.3,617.6 L 488.2,588.2 L 496.1,549.0 L 494.1,515.7 L 525.5,505.9 L 551.0,535.3 L 523.5,552.9 L 517.6,576.5 L 533.3,572.5 L 552.9,558.8 L 568.6,566.7 L 570.6,568.6 L 566.7,578.4 L 607.8,584.3 L 627.5,564.7 L 629.4,586.3 L 672.5,554.9 L 692.2,509.8 L 702.0,482.4 L 713.7,498.0 L 741.2,602.0 L 737.3,615.7 L 719.6,605.9 L 676.5,584.3 L 651.0,594.1 L 633.3,607.8 L 598.0,596.1 L 574.5,594.1 L 551.0,605.9 L 519.6,611.8 L 486.3,613.7 L 464.7,635.3 L 458.8,643.1 L 433.3,621.6" },
  { name: "Outline of Bottom Roots", dx: 0, dy: 0, delay: 14, duration: 24, d: "M 349.0,949.0 L 321.6,970.6 L 274.5,1000.0 L 227.5,1023.5 L 203.9,1037.3 L 158.8,1051.0 L 137.3,1056.9 L 121.6,1080.4 L 102.0,1096.1 M 464.7,931.4 L 486.3,974.5 L 539.2,996.1 L 580.4,1021.6 L 605.9,1033.3 L 654.9,1045.1 L 686.3,1066.7 L 698.0,1082.4 L 729.4,1098.0" },
]

// ── Interactive Nodes ──
const NODES = [
  {
    id: "guide", x: 400, y: 235,
    labelLines: [{ text: "The Guide", font: "serif" }, { text: "MEET EMILY", font: "sans" }],
    desc: "<strong>I'm not here to fix you. I'm here to breathe with you.</strong> I'm a recovered people-pleaser and overthinker who learned how to find quiet in the chaos. I hold a safe, welcoming space for kids, adults, and groups to just come as they are. No pressure, no perfection. Just breathing.",
    cta: null,
    interestValue: "General Inquiry"
  },
  {
    id: "body", x: 680, y: 370,
    labelLines: [{ text: "Notice the Body", font: "serif" }, { text: "1-ON-1 SESSIONS", font: "sans" }],
    desc: "<strong>Sometimes, we just need a quiet space to ourselves.</strong> In our one-on-one sessions, we move at your exact pace. We'll use gentle breathwork to help you release tension, calm your mind, and feel at home in your own skin again.",
    cta: "Book a Discovery Call",
    interestValue: "1-on-1 Sessions"
  },
  {
    id: "earth", x: 540, y: 815,
    labelLines: [{ text: "Notice the Earth", font: "serif" }, { text: "NATURE GROUPS", font: "sans" }],
    desc: "<strong>There is a deep peace in breathing outside together.</strong> Join me for small, guided group sessions in the fresh air of Lancaster County. We'll step away from the screens, get our feet on the ground, and learn how to borrow the calm, slow rhythm of the natural world.",
    cta: "Reserve Your Spot",
    interestValue: "Nature Groups"
  },
  {
    id: "room", x: 260, y: 815,
    labelLines: [{ text: "Notice the Room", font: "serif" }, { text: "SCHOOLS & FACILITIES", font: "sans" }],
    desc: "<strong>Calm can be brought into any room.</strong> I partner with schools, recovery centers, and organizations to share simple, powerful breathing tools. Whether it's helping students focus or offering a moment of peace in a rehab setting, we make breathwork accessible and safe for everyone.",
    cta: "Schedule a Consult",
    interestValue: "Schools & Facilities"
  },
  {
    id: "circle", x: 120, y: 370,
    labelLines: [{ text: "Stay Close", font: "serif" }, { text: "THE CIRCLE", font: "sans" }],
    desc: "<strong>Not ready to jump in? That's perfectly okay.</strong> Join 'The Circle', my personal check-in list. It’s just real, gentle emails from me (never automated) sharing little reminders to breathe and notice the good things around you.",
    cta: "Join The Circle",
    interestValue: "The Circle (Newsletter)"
  },
]

// ── Segmented Geometric SVG Body Explorer ──
const BODY_PARTS = [
  { id: "head", w: 56.594, h: 95.031, ml: -28.5, top: -6, d: "M15.92 68.5l8.8 12.546 3.97 13.984-9.254-7.38-4.622-15.848zm27.1 0l-8.8 12.546-3.976 13.988 9.254-7.38 4.622-15.848zm6.11-27.775l.108-11.775-21.16-14.742L8.123 26.133 8.09 40.19l-3.24.215 1.462 9.732 5.208 1.81 2.36 11.63 9.72 11.018 10.856-.324 9.56-10.37 1.918-11.952 5.207-1.81 1.342-9.517zm-43.085-1.84l-.257-13.82L28.226 11.9l23.618 15.755-.216 10.37 4.976-17.085L42.556 2.376 25.49 0 10.803 3.673.002 24.415z" },
  { id: "shoulder", w: 109.532, h: 46.594, ml: -53.5, top: 69, d: "M38.244-.004l1.98 9.232-11.653 2.857-7.474-2.637zm33.032 0l-1.98 9.232 11.653 2.857 7.474-2.637zm21.238 10.54l4.044-2.187 12.656 14 .07 5.33S92.76 10.66 92.515 10.535zm-1.285.58c-.008.28 17.762 18.922 17.762 18.922l.537 16.557-6.157-10.55L91.5 30.988 83.148 15.6zm-74.224-.58L12.962 8.35l-12.656 14-.062 5.325s16.52-17.015 16.764-17.14zm1.285.58C18.3 11.396.528 30.038.528 30.038L-.01 46.595l6.157-10.55 11.87-5.056L26.374 15.6z" },
  { id: "arm", w: 156.344, h: 119.25, ml: -78, top: 112, d: "M21.12 56.5a1.678 1.678 0 0 1-.427.33l.935 8.224 12.977-13.89 1.2-8.958A168.2 168.2 0 0 0 21.12 56.5zm1.387 12.522l-18.07 48.91 5.757 1.333 19.125-39.44 3.518-22.047zm-5.278-18.96l2.638 18.74-17.2 46.023L.01 113.05l6.644-35.518zm118.015 6.44a1.678 1.678 0 0 0 .426.33l-.934 8.222-12.977-13.89-1.2-8.958A168.2 168.2 0 0 1 135.24 56.5zm-1.39 12.52l18.073 48.91-5.758 1.333-19.132-39.44-3.52-22.05zm5.28-18.96l-2.64 18.74 17.2 46.023 2.658-1.775-6.643-35.518zm-103.1-12.323a1.78 1.78 0 0 1 .407-.24l3.666-27.345L33.07.015l-7.258 10.58-6.16 37.04-.566 4.973a151.447 151.447 0 0 1 15.808-14.87zm84.3 0a1.824 1.824 0 0 0-.407-.24l-3.666-27.345L123.3.015l7.258 10.58 6.16 37.04-.566 4.973a151.447 151.447 0 0 0-15.822-14.87zM22.288 8.832l-3.3 35.276-2.2-26.238zm111.79 0l3.3 35.276 2.2-26.238z" },
  { id: "cheast", w: 86.594, h: 45.063, ml: -43.5, top: 88, d: "M19.32 0l-9.225 16.488-10.1 5.056 6.15 4.836 4.832 14.07 11.2 4.616 17.85-8.828-4.452-34.7zm47.934 0l9.225 16.488 10.1 5.056-6.15 4.836-4.833 14.07-11.2 4.616-17.844-8.828 4.45-34.7z" },
  { id: "stomach", w: 75.25, h: 107.594, ml: -37.5, top: 130, d: "M19.25 7.49l16.6-7.5-.5 12.16-14.943 7.662zm-10.322 8.9l6.9 3.848-.8-9.116zm5.617-8.732L1.32 2.15 6.3 15.6zm-8.17 9.267l9.015 5.514 1.54 11.028-8.795-5.735zm15.53 5.89l.332 8.662 12.286-2.665.664-11.826zm14.61 84.783L33.28 76.062l-.08-20.53-11.654-5.736-1.32 37.5zM22.735 35.64L22.57 46.3l11.787 3.166.166-16.657zm-14.16-5.255L16.49 35.9l1.1 11.25-8.8-7.06zm8.79 22.74l-9.673-7.28-.84 9.78L-.006 68.29l10.564 14.594 5.5.883 1.98-20.735zM56 7.488l-16.6-7.5.5 12.16 14.942 7.66zm10.32 8.9l-6.9 3.847.8-9.116zm-5.617-8.733L73.93 2.148l-4.98 13.447zm8.17 9.267l-9.015 5.514-1.54 11.03 8.8-5.736zm-15.53 5.89l-.332 8.662-12.285-2.665-.664-11.827zm-14.61 84.783l3.234-31.536.082-20.532 11.65-5.735 1.32 37.5zm13.78-71.957l.166 10.66-11.786 3.168-.166-16.657zm14.16-5.256l-7.915 5.514-1.1 11.25 8.794-7.06zm-8.79 22.743l9.673-7.28.84 9.78 6.862 12.66-10.564 14.597-5.5.883-1.975-20.74z" },
  { id: "legs", w: 93.626, h: 286.625, ml: -46.5, top: 205, z: 9999, d: "M17.143 138.643l-.664 5.99 4.647 5.77 1.55 9.1 3.1 1.33 2.655-13.755 1.77-4.88-1.55-3.107zm20.582.444l-3.32 9.318-7.082 13.755 1.77 12.647 5.09-14.2 4.205-7.982zm-26.557-12.645l5.09 27.29-3.32-1.777-2.656 8.875zm22.795 42.374l-1.55 4.88-3.32 20.634-.442 27.51 4.65 26.847-.223-34.39 4.87-13.754.663-15.087zM23.34 181.24l1.106 41.267 8.853 33.28-9.628-4.55-16.045-57.8 5.533-36.384zm15.934 80.536l-.664 18.415-1.55 6.435h-4.647l-1.327-4.437-1.55-.222.332 4.437-5.864-1.778-1.55-.887-6.64-1.442-.22-5.214 6.418-10.87 4.426-5.548 10.844-4.437zM13.63 3.076v22.476l15.71 31.073 9.923 30.85L38.23 66.1zm25.49 30.248l.118-.148-.793-2.024L21.9 12.992l-1.242-.44L31.642 40.93zM32.865 44.09l6.812 17.6 2.274-21.596-1.344-3.43zM6.395 61.91l.827 25.34 12.816 35.257-3.928 10.136L3.5 88.133zM30.96 74.69l.345.826 6.47 15.48-4.177 38.342-6.594-3.526 5.715-35.7zm45.5 63.953l.663 5.99-4.647 5.77-1.55 9.1-3.1 1.33-2.655-13.755-1.77-4.88 1.55-3.107zm-20.582.444l3.32 9.318 7.08 13.755-1.77 12.647-5.09-14.2-4.2-7.987zm3.762 29.73l1.55 4.88 3.32 20.633.442 27.51-4.648 26.847.22-34.39-4.867-13.754-.67-15.087zm10.623 12.424l-1.107 41.267-8.852 33.28 9.627-4.55 16.046-57.8-5.533-36.384zM54.33 261.777l.663 18.415 1.546 6.435h4.648l1.328-4.437 1.55-.222-.333 4.437 5.863-1.778 1.55-.887 6.638-1.442.222-5.214-6.418-10.868-4.426-5.547-10.844-4.437zm25.643-258.7v22.476L64.26 56.625l-9.923 30.85L55.37 66.1zM54.48 33.326l-.118-.15.793-2.023L71.7 12.993l1.24-.44L61.96 40.93zm6.255 10.764l-6.812 17.6-2.274-21.595 1.344-3.43zm26.47 17.82l-.827 25.342-12.816 35.256 3.927 10.136 12.61-44.51zM62.64 74.693l-.346.825-6.47 15.48 4.178 38.342 6.594-3.527-5.715-35.7zm19.792 51.75l-5.09 27.29 3.32-1.776 2.655 8.875zM9.495-.007l.827 21.373-7.028 42.308-3.306-34.155zm2.068 27.323L26.24 59.707l3.307 26-6.2 36.58L9.91 85.046l-.827-38.342zM84.103-.01l-.826 21.375 7.03 42.308 3.306-34.155zm-2.066 27.325L67.36 59.707l-3.308 26 6.2 36.58 13.436-37.24.827-38.34z" },
  { id: "hands", w: 205, h: 38.938, ml: -102.5, top: 224, d: "M21.255-.002l2.88 6.9 8.412 1.335-.664 12.458-4.427 17.8-2.878-.22 2.8-11.847-2.99-.084-4.676 12.6-3.544-.446 4.4-12.736-3.072-.584-5.978 13.543-4.428-.445 6.088-14.1-2.1-1.25-7.528 12.012-3.764-.445L12.4 12.9l-1.107-1.78L.665 15.57 0 13.124l8.635-7.786zm162.49 0l-2.88 6.9-8.412 1.335-.664 12.458 4.427 17.8 2.878-.22-2.8-11.847 2.99-.084 4.676 12.6 3.544-.446-4.4-12.736 3.072-.584 5.978 13.543 4.428-.445-6.088-14.1 2.1-1.25 7.528 12.012 3.764-.445L192.6 12.9l1.107-1.78 10.628 4.45.665-2.447-8.635-7.786z" }
]

const BODY_STEPS = [
  {
    id: "head",
    eyebrow: "THE RACING THOUGHTS",
    title: "The Brain",
    text: "<strong>Your mind is tired</strong> from trying to hold everything together. This isn't about forcing yourself to 'think positive' or trying to magically empty your head. It's about noticing when your thoughts are spinning too fast. I'll show you how to use a simple breath to give your mind permission to finally pause and rest."
  },
  {
    id: "cheast",
    eyebrow: "THE INVISIBLE ARMOR",
    title: "The Heart",
    text: "<strong>Most of us are breathing just enough to get by,</strong> keeping our breath shallow and tight in our chests without even realizing it. That tightness keeps us feeling defensive and on edge. By learning to breathe softly and deeply, you send a gentle signal to your body that you are safe, allowing your heart to slow down and open up."
  },
  {
    id: "stomach",
    eyebrow: "THE HEAVY KNOT",
    title: "The Gut",
    text: "<strong>You can't always talk your way out of stress.</strong> Our stomachs tend to hold onto worry, fear, and nerves long after a hard day is over. It feels like a physical, heavy knot. Together, we use gentle breathing to physically soften that tightness, letting your body release the weight it's been carrying around."
  },
  {
    id: "legs",
    eyebrow: "FINDING YOUR FOOTING",
    title: "The Feet",
    text: "<strong>It's hard to feel calm when you feel disconnected.</strong> We spend so much time indoors and on screens that we forget what it feels like to just stand still. We will practice getting your feet back on the earth, exploring how simply noticing the ground beneath you can help your whole body feel steady and secure."
  }
]

// ── Redesigned Body Explorer ──
function BodyExplorer({ onOpenForm }) {
  const [stepIdx, setStepIdx] = useState(0)
  const step = BODY_STEPS[stepIdx]

  const handleNext = () => {
    triggerHaptic([15])
    setStepIdx((prev) => (prev + 1) % BODY_STEPS.length)
  }

  const handlePrev = () => {
    triggerHaptic([15])
    setStepIdx((prev) => (prev - 1 + BODY_STEPS.length) % BODY_STEPS.length)
  }

  const handlePartClick = (pId) => {
    triggerHaptic([15])
    const idx = BODY_STEPS.findIndex(s => s.id === pId);
    if (idx !== -1) setStepIdx(idx);
  }

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-12 w-full mt-2">

      {/* Left Side: Interactive Readout & Navigation */}
      <div className="flex-1 flex flex-col w-full order-2 md:order-1">
        <div className="min-h-[160px] mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: slowBioEase }}
            >
              <p className="font-['Montserrat'] text-[11px] font-semibold tracking-[0.22em] uppercase mb-2" style={{ color: AMBER }}>
                {step.eyebrow}
              </p>
              <h3 className="font-['Dancing_Script'] text-[clamp(32px,3.5vw,38px)] leading-[1.1] mb-3" style={{ color: C }}>
                {step.title}
              </h3>
              <p className="font-['Cormorant_Garamond'] text-[clamp(16px,1.9vw,19px)] leading-[1.6] opacity-85 tracking-[0.01em] m-0" style={{ color: C }} dangerouslySetInnerHTML={{ __html: step.text }} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Circular Navigation */}
        <div className="flex items-center gap-4 border-t border-[#18362415] pt-4">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.85, opacity: 0.6, transition: squishSpring }}
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="flex items-center justify-center rounded-full transition-colors relative overflow-visible group"
            style={{ width: 44, height: 44, border: `1px solid ${C}25`, color: C, touchAction: "manipulation" }}
          >
            <div className="absolute inset-0 bg-[#C98A3C] opacity-0 group-hover:opacity-10 rounded-full transition-opacity"/>
            <ArrowLeft size={18} strokeWidth={1.5} className="group-hover:text-[#C98A3C] transition-colors" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.85, opacity: 0.6, transition: squishSpring }}
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="flex items-center justify-center rounded-full transition-colors relative overflow-visible group"
            style={{ width: 44, height: 44, border: `1px solid ${C}25`, color: C, touchAction: "manipulation" }}
          >
            <div className="absolute inset-0 bg-[#C98A3C] opacity-0 group-hover:opacity-10 rounded-full transition-opacity"/>
            <ArrowRight size={18} strokeWidth={1.5} className="group-hover:text-[#C98A3C] transition-colors"/>
          </motion.button>
          <span className="font-['Montserrat'] text-[10px] font-semibold tracking-[0.2em] opacity-40 ml-2" style={{ color: C }}>
            EXPLORE THE SHIFTS
          </span>
        </div>
      </div>

      {/* Right Side: Ethereal SVG Body */}
      <div className="flex-shrink-0 flex justify-center order-1 md:order-2 w-full md:w-auto relative min-w-[140px]">
        <div style={{ width: 120, height: 260, position: "relative" }}>
          <div style={{ width: 207, height: 500, transform: "scale(0.5)", transformOrigin: "top center", position: "absolute", top: 0, left: "50%", marginLeft: -103 }}>
            {BODY_PARTS.map((p) => {
              const isActive = p.id === step.id;
              const isClickable = BODY_STEPS.some(s => s.id === p.id);

              return (
                <motion.svg
                  key={p.id} width={p.w} height={p.h} viewBox={`0 0 ${p.w} ${p.h}`}
                  whileHover={isClickable && !isActive ? { opacity: 0.7, scale: 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.9, filter: "brightness(0.8)", transition: squishSpring } : {}}
                  onClick={(e) => { e.stopPropagation(); if (isClickable) handlePartClick(p.id); }}
                  animate={{ scale: isActive ? [1, 1.03, 1] : 1, fill: isActive ? AMBER : C, opacity: isActive ? 1 : 0.4 }}
                  transition={{ scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }, fill: { duration: 0.6, ease: bioEase }, opacity: { duration: 0.6, ease: bioEase } }}
                  style={{ position: "absolute", left: "50%", marginLeft: p.ml, top: p.top, zIndex: p.z || 1, cursor: isClickable ? "pointer" : "default", overflow: "visible", touchAction: "manipulation" }}
                >
                  {/* Invisible Hitbox Rectangle for solid tapping anywhere in the bounding box */}
                  <rect x="0" y="0" width={p.w} height={p.h} fill="rgba(0,0,0,0)" pointerEvents="all" />
                  <path d={p.d} pointerEvents="none" />
                </motion.svg>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function HeaderBird() {
  const [wingsOpen, setWingsOpen] = useState(true)
  const [direction, setDirection] = useState(1)
  const [pos, setPos] = useState({ x: -100, y: 15, opacity: 0, duration: 0 })

  useEffect(() => {
    const interval = setInterval(() => setWingsOpen((prev) => !prev), 120)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let cancelled = false
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
    const fly = async () => {
      await sleep(4000)
      while (!cancelled) {
        setDirection(-1)
        setPos({ x: 900, y: 15, opacity: 1, duration: 0 })
        await sleep(40)
        if (cancelled) break

        setPos({ x: -100, y: 25, opacity: 1, duration: 12 })
        await sleep(12000)
        if (cancelled) break

        setPos({ x: -100, y: 25, opacity: 0, duration: 0 })
        await sleep(8000)
        if (cancelled) break

        setDirection(1)
        setPos({ x: -100, y: 25, opacity: 1, duration: 0 })
        await sleep(40)
        if (cancelled) break

        setPos({ x: 900, y: 30, opacity: 1, duration: 14 })
        await sleep(14000)
        if (cancelled) break

        setPos({ x: 900, y: 30, opacity: 0, duration: 0 })
        await sleep(12000)
      }
    }
    fly()
    return () => { cancelled = true }
  }, [])

  return (
    <g
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        opacity: pos.opacity,
        transition: `transform ${pos.duration}s linear, opacity 0.6s ease`,
      }}
    >
      <g transform={`scale(${direction}, 1)`}>
        <image href={wingsOpen ? BIRD_OPEN : BIRD_CLOSED} x="-25" y="-25" width="50" height="50" />
      </g>
    </g>
  )
}

function HoleBird() {
  const [wingsOpen, setWingsOpen] = useState(false)
  const [isFlying, setIsFlying] = useState(false)
  const [direction, setDirection] = useState(1)
  const [pos, setPos] = useState({ x: -100, y: 500, opacity: 0, duration: 0 })

  useEffect(() => {
    if (!isFlying) { setWingsOpen(false); return }
    const interval = setInterval(() => setWingsOpen((prev) => !prev), 120)
    return () => clearInterval(interval)
  }, [isFlying])

  useEffect(() => {
    let cancelled = false
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
    const sequence = async () => {
      await sleep(6000)
      while (!cancelled) {
        setIsFlying(true)
        setDirection(1)
        setPos({ x: -100, y: 500, opacity: 1, duration: 0 })
        await sleep(40)
        if (cancelled) break

        setPos({ x: 400, y: 877, opacity: 1, duration: 5 })
        await sleep(5000)
        if (cancelled) break

        setIsFlying(false)
        setDirection(-1)
        await sleep(12000)
        if (cancelled) break

        setIsFlying(true)
        setDirection(1)
        setPos({ x: 400, y: 877, opacity: 1, duration: 0 })
        await sleep(40)
        if (cancelled) break

        setPos({ x: 900, y: 300, opacity: 1, duration: 5 })
        await sleep(5000)
        if (cancelled) break

        setPos({ x: 900, y: 300, opacity: 0, duration: 0 })
        await sleep(22000)
      }
    }
    sequence()
    return () => { cancelled = true }
  }, [])

  return (
    <g
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        opacity: pos.opacity,
        transition: `transform ${pos.duration}s ease-in-out, opacity 0.6s ease`,
      }}
    >
      <g transform={`scale(${direction}, 1)`}>
        <image href={wingsOpen ? BIRD_OPEN : BIRD_CLOSED} x="-20" y="-20" width="40" height="40" />
      </g>
    </g>
  )
}

function AcornNode({ size, active }) {
  const col = active ? "#2a6040" : C
  return (
    <svg x={-size} y={-size} width={size * 2} height={size * 2} viewBox="-50 -50 100 100" style={{ overflow: "visible", pointerEvents: "none" }}>
      {active && <circle cx="0" cy="0" r="58" fill="none" stroke={col} strokeWidth="4" opacity="0.5" />}
      <image href={ACORN_URL} x="-50" y="-50" width="100" height="100" transform="rotate(14)" />
    </svg>
  )
}

export default function App() {
  const [activeId, setActiveId] = useState(null)
  const [hoverId, setHoverId] = useState(null)

  // Form & Booking State
  const [showBookingMenu, setShowBookingMenu] = useState(false)
  const [selectedInterest, setSelectedInterest] = useState("General Inquiry")
  const [formStatus, setFormStatus] = useState("idle") // 'idle' | 'submitting' | 'success'

  const [canScroll, setCanScroll] = useState(false)
  const scrollRef = useRef(null)

  const activeNode = NODES.find((n) => n.id === activeId) ?? null

  const [blobs, setBlobs] = useState({ guide: null, room: null })
  const [activeGifSrc, setActiveGifSrc] = useState(null)

  useEffect(() => {
    fetch(EMILY_GIF).then(r => r.blob()).then(b => setBlobs(p => ({ ...p, guide: b })))
    fetch(STENCIL_GIF).then(r => r.blob()).then(b => setBlobs(p => ({ ...p, room: b })))
  }, [])

  useEffect(() => {
    let url = null;
    if (activeId === "guide") {
      url = blobs.guide ? URL.createObjectURL(blobs.guide) : `${EMILY_GIF}?t=${Date.now()}`
      setActiveGifSrc(url)
    } else if (activeId === "room") {
      url = blobs.room ? URL.createObjectURL(blobs.room) : `${STENCIL_GIF}?t=${Date.now()}`
      setActiveGifSrc(url)
    } else {
      setActiveGifSrc(null)
    }
    return () => { if (url && url.startsWith("blob:")) URL.revokeObjectURL(url) }
  }, [activeId, blobs])

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setCanScroll(scrollHeight - clientHeight - scrollTop > 2);
    }
  }

  useEffect(() => {
    if (activeNode || showBookingMenu) {
      const timeoutId = setTimeout(checkScroll, 100);
      window.addEventListener("resize", checkScroll);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", checkScroll);
      }
    } else {
      setCanScroll(false)
    }
  }, [activeNode, activeGifSrc, showBookingMenu]);

  const handleNodeInteraction = (id) => {
    triggerHaptic([25])
    setActiveId(activeId === id ? null : id)
  }

  const handleOpenForm = (interestValue = "General Inquiry") => {
    triggerHaptic([30, 20]);
    setSelectedInterest(interestValue);
    setFormStatus("idle");
    setActiveId(null); // Close editorial modal if open
    setShowBookingMenu(true);
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    triggerHaptic([15]);
    setFormStatus("submitting");

    const form = e.target;
    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: formData,
      });

      if (response.ok) {
        triggerHaptic([40, 20, 40]);
        setFormStatus("success");
      } else {
        setFormStatus("idle");
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      setFormStatus("idle");
      alert("Network error. Please try again.");
    }
  }

  return (
    <main className="relative w-full h-[100dvh] overflow-hidden overscroll-none bg-[#EAE5D4]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,500&family=Dancing+Script:wght@600&family=Montserrat:wght@400;500;600;700&display=swap');

        /* ── Full-screen lock: prevent overscroll, pull-to-refresh, bounce ── */
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          overscroll-behavior: none;
          -webkit-overflow-scrolling: auto;
          position: fixed;
          inset: 0;
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
        #root {
          width: 100%;
          height: 100%;
          overflow: hidden;
          overscroll-behavior: none;
        }

        strong { font-weight: 600; color: ${C}; opacity: 1; }
        a { color: ${AMBER}; text-decoration: none; border-bottom: 1px dotted rgba(201, 138, 60, 0.5); transition: all 0.3s ease; }
        a:hover { border-bottom: 1px solid ${AMBER}; opacity: 0.9; }

        .editorial-scroll { overscroll-behavior: contain; }
        .editorial-scroll::-webkit-scrollbar { width: 4px; }
        .editorial-scroll::-webkit-scrollbar-track { background: transparent; }
        .editorial-scroll::-webkit-scrollbar-thumb { background: rgba(24, 54, 36, 0.2); border-radius: 10px; }

        .glass-panel {
          background: rgba(242, 239, 230, 0.85);
          backdrop-filter: blur(24px) saturate(1.2);
          -webkit-backdrop-filter: blur(24px) saturate(1.2);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 30px 60px -12px rgba(24, 54, 36, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.3);
        }

        .form-input {
          width: 100%;
          background: rgba(24, 54, 36, 0.04);
          border: 1px solid rgba(24, 54, 36, 0.1);
          border-radius: 16px;
          padding: 16px 20px;
          color: ${C};
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
        }
        .form-input:focus {
          border-color: ${AMBER};
          background: rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 0 4px rgba(201, 138, 60, 0.1);
        }
        .form-input::placeholder { color: rgba(24, 54, 36, 0.4); }

        select.form-input {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23183624' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1em;
          padding-right: 40px;
        }
      `,
        }}
      />

      {/* ── Ambient Breathing Halo ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
        animate={{
          background: [
            `radial-gradient(circle at 50% 40%, rgba(201,138,60,0.1) 0%, rgba(234,229,212,0) 60%)`,
            `radial-gradient(circle at 50% 40%, rgba(201,138,60,0.25) 0%, rgba(234,229,212,0) 75%)`,
            `radial-gradient(circle at 50% 40%, rgba(201,138,60,0.1) 0%, rgba(234,229,212,0) 60%)`
          ]
        }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Main Fluid SVG Container ── */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden pt-12 md:pt-0">
        <svg
          viewBox="0 0 800 1100"
          className="w-full h-full max-h-[1100px] object-contain md:object-cover origin-center"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="ethereal-flow" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F5DF9E" stopOpacity="0.85" />
              <stop offset="30%" stopColor="#D98A3C" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#C77DFF" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#7B2CBF" stopOpacity="0.55" />
            </linearGradient>
            <filter id="ethereal-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3.5" result="blur1" />
              <feGaussianBlur stdDeviation="1.5" result="blur2" />
              <feMerge><feMergeNode in="blur1" /><feMergeNode in="blur2" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="mask-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24" /></filter>
            <mask id="hide-lines-under-nodes">
              <rect x="0" y="0" width="800" height="1100" fill="white" />
              <g filter="url(#mask-blur)">
                {NODES.map((node) => <ellipse key={`mask-${node.id}`} cx={node.x} cy={node.y + 20} rx={110} ry={120} fill="black" />)}
              </g>
            </mask>
            <clipPath id="header-reveal">
              <motion.rect x="0" y="0" width="800" height="300" initial={{ width: 0 }} animate={{ width: 800 }} transition={{ duration: 2.8, ease: slowBioEase, delay: 0.2 }} />
            </clipPath>
          </defs>

          {/* Tree Base Image */}
          <motion.image
            href={IMG_URL}
            x="0" y="0" width="800" height="1100"
            preserveAspectRatio="xMidYMid meet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 2.5, ease: bioEase }}
          />

          {/* Header Typography */}
          <motion.g id="header" clipPath="url(#header-reveal)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, ease: bioEase }}>
            <text x="400" y="43" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontStyle="italic" fontSize="29" fill={C}>the</text>
            <motion.text x="400" y="120" textAnchor="middle" fontFamily="'Dancing Script', cursive" fontSize="102" fontWeight="600" fill={C} animate={{ opacity: [0.92, 1, 0.92] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}>Heart of Noticing</motion.text>
            <text x="400" y="167" textAnchor="middle" fontFamily="'Montserrat', sans-serif" fontSize="16" letterSpacing="0.25em" fontWeight="500" fill={C} opacity={0.9}>SOMATIC BREATHWORK • LANCASTER COUNTY, PA</text>
          </motion.g>

          {/* Ethereal Traces */}
          <g mask="url(#hide-lines-under-nodes)">
            <g transform={TRACE_TRANSFORM}>
              <g id="animated-breath-traces">
                {TRACED_PATHS.map((path, i) => (
                  <g key={i} transform={`translate(${path.dx || 0}, ${path.dy || 0})`}>
                    <motion.path
                      d={smoothPath(path.d)}
                      fill="none"
                      stroke="url(#ethereal-flow)"
                      strokeWidth="2.2" strokeLinecap="round"
                      filter="url(#ethereal-glow)"
                      initial={{ pathLength: 0.12, pathOffset: -0.12, opacity: 0 }}
                      animate={{ pathOffset: 1, opacity: [0, 0.8, 0.8, 0] }}
                      transition={{ duration: path.duration, ease: "easeInOut", repeat: Infinity, delay: path.delay }}
                    />
                  </g>
                ))}
              </g>
            </g>
          </g>

          {/* Birds */}
          <g id="animated-birds"><HeaderBird /><HoleBird /></g>

          {/* Interactive Acorn Nodes */}
          <motion.g id="interactive-nodes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5, delay: 0.8, ease: slowBioEase }}>
            {NODES.map((node, i) => {
              const isLit = hoverId === node.id || activeId === node.id
              return (
                <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                  <motion.g
                    onClick={(e) => { e.stopPropagation(); handleNodeInteraction(node.id); }}
                    onMouseEnter={() => setHoverId(node.id)}
                    onMouseLeave={() => setHoverId(null)}
                    whileTap={{ scale: 0.9, transition: squishSpring }}
                    whileHover={{ scale: 1.05, transition: squishSpring }}
                    style={{ cursor: "pointer", touchAction: "manipulation" }}
                  >
                    <circle r={110} fill="transparent" pointerEvents="all" />
                    <motion.g
                      animate={isLit ? { rotate: 0, scale: 1.1 } : { rotate: [0, -3, 2, -1, 0], scale: 1 }}
                      transition={isLit ? { duration: 0.4, ease: bioEase } : { duration: 1.5, repeat: Infinity, repeatDelay: 6 + (i * 2), delay: 2 + (i * 1.5), ease: "easeInOut" }}
                    >
                      <AcornNode size={85} active={isLit} />
                    </motion.g>
                    <motion.text
                      x={0} y={0} textAnchor="middle" fill={C}
                      animate={{ opacity: isLit ? 1 : 0.75, scale: isLit ? 1.05 : 1 }}
                      transition={{ duration: 0.4, ease: bioEase }}
                      style={{ pointerEvents: "none" }}
                    >
                      {node.labelLines.map((line, li) => {
                        const isSerif = line.font === "serif"
                        return <tspan key={li} x={0} dy={li === 0 ? "46" : "14"} fontFamily={isSerif ? "'Cormorant Garamond', serif" : "'Montserrat', sans-serif"} fontSize={isSerif ? "26" : "9.5"} letterSpacing={isSerif ? "0" : "0.12em"} fontWeight={isSerif ? (isLit ? "700" : "600") : "600"}>{line.text}</tspan>
                      })}
                    </motion.text>
                  </motion.g>
                </g>
              )
            })}
          </motion.g>
        </svg>
      </div>

      {/* ── Deep Focus Backdrop ── */}
      <AnimatePresence>
        {(activeNode || showBookingMenu) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: bioEase }}
            className="fixed inset-0 z-40 bg-[#183624]/40 backdrop-blur-md cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setActiveId(null); setShowBookingMenu(false); }}
          />
        )}
      </AnimatePresence>

      {/* ── Floating Comprehensive Form Modal (Glassmorphism) ── */}
      <AnimatePresence>
        {showBookingMenu && (
          <motion.div
            initial={{ x: "-50%", y: "-40%", scale: 0.95, opacity: 0, filter: "blur(8px)" }}
            animate={{ x: "-50%", y: "-50%", scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ x: "-50%", y: "-45%", scale: 0.95, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: slowBioEase }}
            className="fixed z-50 flex flex-col top-1/2 left-1/2 w-[92%] max-w-[500px] max-h-[85vh] glass-panel rounded-[32px] overflow-hidden"
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90, backgroundColor: "rgba(201,138,60,0.1)" }}
              whileTap={{ scale: 0.8, transition: squishSpring }}
              onClick={(e) => { e.stopPropagation(); triggerHaptic([15]); setShowBookingMenu(false); }}
              className="absolute top-5 right-5 text-[#183624] opacity-50 hover:opacity-100 transition-all rounded-full p-2 z-20"
              style={{ touchAction: "manipulation" }}
            >
              <X size={22} />
            </motion.button>

            <div ref={scrollRef} onScroll={checkScroll} className="editorial-scroll w-full h-full overflow-y-auto px-8 py-10 md:px-10 md:py-12">
              <div className="flex flex-col items-center text-center">
                <p className="font-['Montserrat'] text-[11px] tracking-[0.25em] font-semibold mb-2" style={{ color: AMBER }}>TAKE A BREATH</p>
                <h2 className="font-['Dancing_Script'] text-[44px] leading-[1.05] mb-8" style={{ color: C }}>Connect with Emily</h2>
              </div>

              <AnimatePresence mode="wait">
                {formStatus === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: bioEase }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#183624]/5 flex items-center justify-center mb-6 text-[#C98A3C]">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="font-['Cormorant_Garamond'] text-3xl font-semibold mb-3 text-[#183624]">Message Received</h3>
                    <p className="font-['Montserrat'] text-sm leading-relaxed text-[#183624]/80 px-4">
                      Thank you for reaching out. Emily will be in touch with you shortly. Take a deep breath, you've taken the first step.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    action="https://usebasin.com/f/2f6670191032"
                    method="POST"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                    transition={{ duration: 0.4 }}
                    onSubmit={handleFormSubmit}
                    className="flex flex-col gap-5 w-full"
                  >
                    <div className="flex flex-col sm:flex-row gap-5 w-full">
                      <input name="first_name" required type="text" placeholder="First Name" className="form-input flex-1" disabled={formStatus === "submitting"} />
                      <input name="last_name" required type="text" placeholder="Last Name" className="form-input flex-1" disabled={formStatus === "submitting"} />
                    </div>

                    <input name="email" required type="email" placeholder="Email Address" className="form-input" disabled={formStatus === "submitting"} />

                    <select
                      name="interest"
                      value={selectedInterest}
                      onChange={(e) => setSelectedInterest(e.target.value)}
                      className="form-input cursor-pointer"
                      disabled={formStatus === "submitting"}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="1-on-1 Sessions">1-on-1 Sessions</option>
                      <option value="Nature Groups">Nature Groups</option>
                      <option value="Schools & Facilities">Schools & Facilities</option>
                      <option value="The Circle (Newsletter)">Join The Circle (Newsletter)</option>
                    </select>

                    <textarea
                      name="message"
                      required
                      placeholder="Tell me a bit about what brings you here..."
                      className="form-input resize-none"
                      rows={4}
                      disabled={formStatus === "submitting"}
                    />

                    <motion.button
                      type="submit"
                      disabled={formStatus === "submitting"}
                      whileHover={formStatus === "idle" ? { scale: 1.02, backgroundColor: "#b57930" } : {}}
                      whileTap={formStatus === "idle" ? { scale: 0.95, transition: squishSpring } : {}}
                      className="mt-2 w-full rounded-2xl flex items-center justify-center font-['Montserrat'] text-[13px] tracking-[0.15em] font-semibold px-8 py-4 border-none text-white relative overflow-hidden"
                      style={{ background: AMBER, touchAction: "manipulation" }}
                    >
                      {formStatus === "submitting" ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        "Send Message"
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Sticky CTA Button ── */}
      <AnimatePresence>
        {!activeNode && !showBookingMenu && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <motion.div
              initial={{ y: 80, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 80, opacity: 0, scale: 0.9 }}
              transition={snapSpring}
              className="pointer-events-auto"
            >
              <motion.button
                whileHover={{ scale: 1.04, y: -2, transition: squishSpring }}
                whileTap={{ scale: 0.85, backgroundColor: "rgba(242, 239, 230, 1)", transition: squishSpring }}
                onClick={(e) => { e.stopPropagation(); handleOpenForm("General Inquiry"); }}
                className="flex items-center justify-center rounded-full glass-panel shadow-2xl backdrop-blur-xl group"
                style={{ color: C, padding: "16px 40px", touchAction: "manipulation" }}
              >
                <span className="font-['Montserrat'] text-[13px] tracking-[0.15em] font-bold uppercase group-hover:text-[#C98A3C] transition-colors">
                  Work with Emily
                </span>
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── The Editorial Acorn Modal (Glassmorphism) ── */}
      <AnimatePresence>
        {activeNode && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-40%", filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%", filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.97, x: "-50%", y: "-45%", filter: "blur(8px)" }}
            transition={{ duration: 0.6, ease: slowBioEase }}
            className="fixed z-50 overflow-hidden flex flex-col glass-panel"
            style={{
              top: "50%", left: "50%",
              width: "92%", maxWidth: "1080px",
              height: "85vh", maxHeight: "800px",
              borderRadius: "32px",
            }}
          >
            {/* ── Sticky Close Button ── */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 90, backgroundColor: "rgba(201,138,60,0.1)" }}
              whileTap={{ scale: 0.8, transition: squishSpring }}
              onClick={(e) => { e.stopPropagation(); triggerHaptic([15]); setActiveId(null); }}
              aria-label="Close"
              className="absolute top-5 right-5 md:top-8 md:right-8 z-20 flex items-center justify-center rounded-full border border-transparent hover:border-[#C98A3C]/30 text-[#183624]/60 hover:text-[#C98A3C] transition-all bg-[#183624]/5 backdrop-blur-sm"
              style={{ width: 44, height: 44, touchAction: "manipulation" }}
            >
              <X size={22} strokeWidth={1.5} />
            </motion.button>

            {/* ── Inner Scrolling Content ── */}
            <div ref={scrollRef} onScroll={checkScroll} className="editorial-scroll w-full h-full overflow-y-auto relative z-10">
              <div className="px-6 py-10 md:px-14 md:py-14 min-h-full pb-20 flex flex-col justify-center">

                {activeNode.id === "body" ? (
                  /* ── High-End Split Layout for "Notice the Body" ── */
                  <div className="flex flex-col w-full h-full justify-center">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-12 mb-6 items-start">
                      <div className="w-full md:w-5/12 flex flex-col pt-1">
                        <p className="font-['Montserrat'] text-[11px] tracking-[0.25em] font-semibold uppercase mb-2" style={{ color: AMBER }}>
                          {activeNode.labelLines[1].text}
                        </p>
                        <h2 className="font-['Dancing_Script'] text-[clamp(38px,4.5vw,54px)] leading-[1.05] m-0" style={{ color: C }}>
                          {activeNode.labelLines[0].text}
                        </h2>
                      </div>

                      <div className="w-full md:w-7/12 flex flex-col justify-center relative">
                        <p className="font-['Cormorant_Garamond'] text-[clamp(16px,1.8vw,20px)] leading-[1.6] opacity-90 m-0 tracking-[0.01em]" style={{ color: C }} dangerouslySetInnerHTML={{ __html: activeNode.desc }} />
                        <div className="mt-8">
                          <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: AMBER }}
                            whileTap={{ scale: 0.95, transition: squishSpring }}
                            onClick={(e) => { e.stopPropagation(); handleOpenForm(activeNode.interestValue); }}
                            className="rounded-2xl transition-colors border-none inline-block font-['Montserrat'] text-[12px] tracking-[0.15em] font-bold px-8 py-4 uppercase text-white shadow-lg"
                            style={{ background: C, touchAction: "manipulation" }}
                          >
                            {activeNode.cta}
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-[1px] bg-[#C98A3C] opacity-20 mb-4 mt-2" />

                    <BodyExplorer onOpenForm={() => handleOpenForm(activeNode.interestValue)} />
                  </div>
                ) : (
                  /* ── Standard 2-Column Layout ── */
                  <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center my-auto">
                    <div className="w-full md:w-5/12 flex flex-col pt-2">
                      <p className="font-['Montserrat'] text-[12px] tracking-[0.25em] font-semibold uppercase mb-4" style={{ color: AMBER }}>
                        {activeNode.labelLines.slice(1).map((l) => l.text).join(" ")}
                      </p>
                      <h2 className="font-['Dancing_Script'] text-[clamp(42px,5vw,68px)] leading-[1.05] m-0 pb-4" style={{ color: C }}>
                        {activeNode.labelLines[0].text}
                      </h2>
                      <div className="hidden md:block w-[60px] h-[1px] bg-[#C98A3C] opacity-30 mt-auto" />
                    </div>

                    <div className="w-full md:w-7/12 flex flex-col justify-center relative">
                      {activeGifSrc && (
                        <motion.img
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 0.85, y: 0 }}
                          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                          src={activeGifSrc} alt="Visual Element"
                          className="float-right ml-6 mb-4 w-[35%] max-w-[160px] object-contain rounded-2xl shadow-sm"
                          style={{ mixBlendMode: "multiply" }}
                        />
                      )}

                      <p className="font-['Cormorant_Garamond'] text-[clamp(18px,2.1vw,22px)] leading-[1.75] opacity-90 m-0 tracking-[0.01em]" style={{ color: C }} dangerouslySetInnerHTML={{ __html: activeNode.desc }} />

                      {activeNode.cta && (
                        <div className="mt-8">
                          <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: AMBER }}
                            whileTap={{ scale: 0.95, transition: squishSpring }}
                            onClick={(e) => { e.stopPropagation(); handleOpenForm(activeNode.interestValue); }}
                            className="rounded-2xl transition-colors border-none font-['Montserrat'] text-[12px] tracking-[0.15em] font-bold px-8 py-4 uppercase text-white shadow-lg w-fit"
                            style={{ background: C, touchAction: "manipulation" }}
                          >
                            {activeNode.cta}
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Precision Blinking Scroll Indicator ── */}
            <AnimatePresence>
              {canScroll && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none text-[#C98A3C]"
                >
                  <motion.svg
                    animate={{ y: [0, 6, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </motion.svg>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.5, ease: bioEase }}
        className="absolute bottom-3 left-0 w-full text-center z-10 pointer-events-none"
      >
        <p className="font-['Montserrat'] text-[9px] tracking-[0.15em] font-medium uppercase text-[#183624] opacity-40 m-0">
          © 2026 Media Mack Designs. All Rights Reserved
        </p>
      </motion.div>
    </main>
  )
}
