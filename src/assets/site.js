// The Heart of Noticing — site behaviour: press feedback, header, menu, birds, body journey, offerings,
// line reveals, forms, scroll reveal.
// Plain JavaScript, no dependencies. Every part checks its elements exist first,
// so this one file can load on every page.
(function () {
  "use strict"

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // Android uses the vibration API. iPhones (iOS 18+) have no vibration API for websites,
  // but Safari gives a light tick when a native switch control flips, so we flip a hidden one.
  var isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)

  function haptic(pattern) {
    try {
      if (navigator.vibrate) { navigator.vibrate(pattern || [10]); return }
      if (!isIOS) return
      var label = document.createElement("label")
      var input = document.createElement("input")
      input.type = "checkbox"
      input.setAttribute("switch", "")
      input.tabIndex = -1
      label.setAttribute("aria-hidden", "true")
      label.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none"
      label.appendChild(input)
      document.body.appendChild(label)
      label.click()
      label.remove()
    } catch (e) {}
  }

  // ── Press feedback: a bubbly bounce and a light haptic tap on every button ──
  var PRESSABLE = ".btn, .text-link, .menu__button, .menu__link, .service, .chapters a, .contact__phone, .footer-nav a, .site-footer__contact a, .announce__link, .announce__text, .chip"

  function initPress() {
    document.addEventListener("pointerdown", function (event) {
      if (event.button > 0) return
      var el = event.target.closest && event.target.closest(PRESSABLE)
      if (!el || el.disabled) return
      haptic([10])
      el.classList.remove("is-popping")
      void el.offsetWidth // restart the bounce if it's tapped again mid-way
      el.classList.add("is-popping")
    }, { passive: true })
    document.addEventListener("animationend", function (event) {
      if (event.animationName === "press-pop") event.target.classList.remove("is-popping")
    })
  }

  // ── Every new page opens at the top ──────────────────────────────────────
  // Some in-app browsers carry the last page's scroll position over to the next page.
  // A fresh visit (not Back/Forward, not a link to a #section) always starts at the top,
  // unless the visitor has already started scrolling themselves.
  function startAtTop() {
    var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0]
    if (window.location.hash || (nav && nav.type !== "navigate")) return
    var touched = false
    function mark() { touched = true }
    ;["wheel", "touchstart", "keydown", "pointerdown"].forEach(function (type) {
      window.addEventListener(type, mark, { passive: true, once: true })
    })
    function toTop() {
      if (touched || window.scrollY === 0) return
      var root = document.documentElement
      var before = root.style.scrollBehavior
      root.style.scrollBehavior = "auto"
      window.scrollTo(0, 0)
      root.style.scrollBehavior = before
    }
    toTop()
    requestAnimationFrame(toTop)
    window.addEventListener("load", toTop, { once: true })
    window.addEventListener("pageshow", function (event) { if (!event.persisted) toTop() }, { once: true })
  }

  // ── Open the next page instantly: start loading it the moment someone shows intent ──
  // (Chrome uses the speculation rules in the page head; this covers Safari and Firefox.)
  function initPrefetch() {
    var done = {}
    function warm(event) {
      var link = event.target.closest && event.target.closest("a[href]")
      if (!link || link.origin !== window.location.origin || link.hash && link.pathname === window.location.pathname) return
      var url = link.href.split("#")[0]
      if (done[url] || url === window.location.href.split("#")[0]) return
      done[url] = true
      var hint = document.createElement("link")
      hint.rel = "prefetch"
      hint.href = url
      document.head.appendChild(hint)
    }
    document.addEventListener("pointerover", warm, { passive: true })
    document.addEventListener("touchstart", warm, { passive: true })
    document.addEventListener("focusin", warm)
  }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms) })
  }

  // ── Menu ────────────────────────────────────────────────────────────────
  function initMenu() {
    var button = document.querySelector("[data-menu-button]")
    var panel = document.getElementById("site-menu")
    if (!button || !panel) return
    var label = button.querySelector("[data-menu-label]")

    var header = button.closest(".site-header")
    function setOpen(open) {
      if (open && header) header.classList.remove("is-hidden") // the menu always opens in view
      button.setAttribute("aria-expanded", String(open))
      panel.setAttribute("data-open", String(open))
      if (label) label.textContent = open ? "Close" : "Menu"
    }
    function isOpen() { return button.getAttribute("aria-expanded") === "true" }

    button.addEventListener("click", function (event) {
      event.stopPropagation()
      setOpen(!isOpen())
    })
    document.addEventListener("click", function (event) {
      if (isOpen() && !panel.contains(event.target)) setOpen(false)
    })
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) { setOpen(false); button.focus() }
    })
    panel.addEventListener("focusout", function (event) {
      if (isOpen() && event.relatedTarget && !panel.contains(event.relatedTarget) && event.relatedTarget !== button) setOpen(false)
    })
  }

  // ── Birds on the home tree ─────────────────────────────────────────────
  function bird(el) {
    var body = el.querySelector("[data-bird-body]")
    return {
      move: function (x, y, opacity, seconds, ease) {
        el.style.transition = "transform " + seconds + "s " + (ease || "linear") + ", opacity 0.6s ease"
        el.style.transform = "translate(" + x + "px, " + y + "px)"
        el.style.opacity = String(opacity)
      },
      face: function (dir) { body.setAttribute("transform", "scale(" + dir + ", 1)") },
      flap: function (on) {
        body.classList.toggle("is-flapping", on)
        body.classList.toggle("is-perched", !on)
      },
    }
  }

  async function flyHeaderBird(b) {
    await sleep(4000)
    for (;;) {
      b.face(-1); b.move(900, 262, 1, 0); await sleep(40)
      b.move(-100, 272, 1, 12); await sleep(12000)
      b.move(-100, 272, 0, 0); await sleep(8000)
      b.face(1); b.move(-100, 272, 1, 0); await sleep(40)
      b.move(900, 280, 1, 14); await sleep(14000)
      b.move(900, 280, 0, 0); await sleep(12000)
    }
  }

  async function flyHoleBird(b) {
    await sleep(6000)
    for (;;) {
      b.flap(true); b.face(1); b.move(-100, 500, 1, 0); await sleep(40)
      b.move(400, 877, 1, 5, "ease-in-out"); await sleep(5000)
      b.flap(false); b.face(-1); await sleep(12000)
      b.flap(true); b.face(1); await sleep(40)
      b.move(900, 300, 1, 5, "ease-in-out"); await sleep(5000)
      b.move(900, 300, 0, 0); await sleep(22000)
    }
  }

  function initBirds() {
    if (reduceMotion) return
    var header = document.querySelector('[data-bird="header"]')
    var hole = document.querySelector('[data-bird="hole"]')
    if (header) flyHeaderBird(bird(header))
    if (hole) flyHoleBird(bird(hole))
  }

  // ── Scroll journey (1-on-1 page) ───────────────────────────────────────
  // A line winds down beside the four body areas. As you read, it fills in up to
  // the middle of the screen, each area lights up when the line reaches it, and
  // the body figure (desktop) highlights the part you're reading about.
  function initJourney() {
    var root = document.querySelector("[data-journey]")
    if (!root) return
    var rail = root.querySelector(".journey__rail")
    var svg = root.querySelector("[data-journey-line]")
    var base = svg.querySelector("[data-journey-path]")
    var line = svg.querySelector("[data-journey-progress]")
    var tip = svg.querySelector("[data-journey-tip]")
    var glow = svg.querySelector("[data-journey-glow]")
    var gradient = svg.querySelector("linearGradient")
    var steps = Array.prototype.slice.call(root.querySelectorAll(".journey__step"))
    var parts = Array.prototype.slice.call(root.querySelectorAll(".body-part"))

    var samples = []
    var total = 0
    var height = 0
    var dotYs = []
    var current = -2
    var ticking = false

    // Builds a gentle S-curve through every dot, swinging left and right between them
    function layout() {
      var box = rail.getBoundingClientRect()
      if (!box.height) return
      var w = box.width
      var cx = w / 2
      var swing = Math.min(w * 0.36, 40)
      height = box.height
      dotYs = steps.map(function (step) {
        var r = step.querySelector(".journey__dot").getBoundingClientRect()
        return r.top + r.height / 2 - box.top
      })
      var ys = [0].concat(dotYs, [height])
      var d = "M " + cx + " 0"
      for (var i = 1; i < ys.length; i++) {
        var a = ys[i - 1]
        var b = ys[i]
        var x = cx + (i % 2 ? swing : -swing)
        d += " C " + x + " " + (a + (b - a) * 0.3) + ", " + x + " " + (a + (b - a) * 0.7) + ", " + cx + " " + b
      }
      svg.setAttribute("viewBox", "0 0 " + w + " " + height)
      base.setAttribute("d", d)
      line.setAttribute("d", d)
      gradient.setAttribute("y2", String(height))
      total = line.getTotalLength()
      line.style.strokeDasharray = total + " " + total

      // Look-up table of (length, x, y) so scrolling never has to measure the path
      samples = []
      var n = Math.max(80, Math.round(total / 6))
      for (var k = 0; k <= n; k++) {
        var len = (total * k) / n
        var p = line.getPointAtLength(len)
        samples.push([len, p.x, p.y])
      }
      update()
    }

    function pointAtY(y) {
      if (y <= samples[0][2]) return samples[0]
      var last = samples[samples.length - 1]
      if (y >= last[2]) return last
      var lo = 0
      var hi = samples.length - 1
      while (hi - lo > 1) {
        var mid = (lo + hi) >> 1
        if (samples[mid][2] < y) lo = mid
        else hi = mid
      }
      var A = samples[lo]
      var B = samples[hi]
      var t = (y - A[2]) / (B[2] - A[2] || 1)
      return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, y]
    }

    function update() {
      ticking = false
      if (!samples.length) return
      var y = window.innerHeight * 0.55 - rail.getBoundingClientRect().top
      var p = pointAtY(Math.max(0, Math.min(height, y)))
      line.style.strokeDashoffset = String(total - p[0])
      tip.setAttribute("cx", p[1])
      tip.setAttribute("cy", p[2])
      glow.setAttribute("cx", p[1])
      glow.setAttribute("cy", p[2])
      var visible = y > 0 ? "" : "0"
      tip.style.opacity = visible
      glow.style.opacity = visible

      var reached = -1
      dotYs.forEach(function (dy, i) { if (y >= dy - 4) reached = i })
      if (reached === current) return
      current = reached
      steps.forEach(function (step, i) { step.classList.toggle("is-reached", i <= reached) })
      var part = steps[Math.max(reached, 0)].getAttribute("data-part")
      parts.forEach(function (el) { el.classList.toggle("is-active", el.getAttribute("data-part") === part) })
    }

    function requestUpdate() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    // Clicking a part of the figure scrolls to that section
    parts.forEach(function (el) {
      var i = steps.findIndex(function (step) { return step.getAttribute("data-part") === el.getAttribute("data-part") })
      if (i < 0) return
      el.addEventListener("click", function () {
        haptic()
        steps[i].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" })
      })
    })

    root.classList.add("is-enhanced")
    layout()
    window.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)
    if ("ResizeObserver" in window) new ResizeObserver(layout).observe(rail)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout)
  }

  // ── Ways to work together: each card glows in its own sherbet colour as it passes ──
  // the middle of the screen, then softly fades as you scroll on. Hover lights it too (CSS).
  function initServices() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-services] .service"))
    if (!cards.length || !("IntersectionObserver" in window)) return
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { entry.target.classList.toggle("is-lit", entry.isIntersecting) })
    }, { rootMargin: "-40% 0px -40% 0px", threshold: 0 })
    cards.forEach(function (card) { observer.observe(card) })
  }

  // ── Home page chapters: a small guide on wide screens, and the chapter name under the logo ──
  function initChapters() {
    var rail = document.querySelector("[data-chapters]")
    if (!rail) return
    var links = Array.prototype.slice.call(rail.querySelectorAll("a"))
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")) })
    var names = links.map(function (a) { return a.textContent.trim() })
    var here = document.querySelector("[data-here-chapter]")
    var footer = document.querySelector(".site-footer")
    var current = -1
    var ticking = false

    function update() {
      ticking = false
      var line = window.innerHeight * 0.4
      var index = 0
      sections.forEach(function (section, i) { if (section && section.getBoundingClientRect().top <= line) index = i })
      if (index !== current) {
        current = index
        links.forEach(function (a, i) {
          if (i === index) a.setAttribute("aria-current", "location")
          else a.removeAttribute("aria-current")
        })
        if (here) here.textContent = names[index]
      }
      var pastHero = window.scrollY > window.innerHeight * 0.6
      var atFooter = footer && footer.getBoundingClientRect().top < window.innerHeight * 0.8
      rail.classList.toggle("is-shown", pastHero && !atFooter)
    }
    window.addEventListener("scroll", function () {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }, { passive: true })
    window.addEventListener("resize", update)
    update()
  }

  // ── Headings settle in line by line as they scroll into view ───────────────
  // Words are wrapped once; each line's words share a delay, so the heading arrives a line at a time.
  var LINE_TARGETS = ".statement__text, .section-title, .page-hero__title, .journey__title, .journey-end__title"

  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    var nodes = []
    while (walker.nextNode()) nodes.push(walker.currentNode)
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment()
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return }
        var w = document.createElement("span")
        w.className = "w"
        w.textContent = part
        frag.appendChild(w)
      })
      node.parentNode.replaceChild(frag, node)
    })
    return Array.prototype.slice.call(el.querySelectorAll(".w"))
  }

  function initLines() {
    if (reduceMotion || !("IntersectionObserver" in window)) return
    var els = Array.prototype.slice.call(document.querySelectorAll(LINE_TARGETS))
    if (!els.length) return
    var words = new Map()
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return
        var el = entry.target
        observer.unobserve(el)
        var line = -1, lastTop = null
        words.get(el).forEach(function (w) {
          var top = w.offsetTop
          if (lastTop === null || top > lastTop + 2) { line++; lastTop = top }
          w.style.setProperty("--line", line)
        })
        el.classList.add("lines-in")
      })
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.15 })
    els.forEach(function (el) {
      words.set(el, splitWords(el))
      el.classList.add("lines")
      observer.observe(el)
    })
  }

  // ── Forms: the Connect form and The Circle sign-up both post to Basin ──────
  // Every state is designed: a gentle check once you leave a field, a sending state,
  // an error that keeps everything you typed, and a thank-you that uses your name.
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  function fieldError(input) {
    var value = input.value.trim()
    if (input.required && !value) return input.getAttribute("data-error-missing") || "Please fill this in."
    if (input.type === "email" && value && !EMAIL.test(value)) return input.getAttribute("data-error-invalid") || "Please check this email address."
    return ""
  }

  function showFieldError(input, message) {
    var note = document.getElementById(input.id + "-error")
    input.setAttribute("aria-invalid", message ? "true" : "false")
    var field = input.closest(".field")
    if (field) {
      field.classList.toggle("is-invalid", !!message)
      field.classList.toggle("is-valid", !message && !!input.value.trim())
    }
    if (note) { note.textContent = message; note.hidden = !message }
  }

  function initForm(form) {
    var box = form.parentElement
    var success = box.querySelector("[data-form-success]")
    var error = form.querySelector("[data-form-error]")
    var submit = form.querySelector('[type="submit"]')
    var label = submit.querySelector(".btn__label") || submit
    var idleLabel = label.textContent
    var phone = form.getAttribute("data-phone") || "the number on this page"
    var required = Array.prototype.slice.call(form.querySelectorAll("[required]"))

    // Check a field once someone has finished with it, then keep checking while they fix it
    required.forEach(function (input) {
      input.addEventListener("blur", function () {
        if (!input.value.trim() && !input.dataset.touched) return
        input.dataset.touched = "1"
        showFieldError(input, fieldError(input))
      })
      input.addEventListener("input", function () {
        if (input.dataset.touched) showFieldError(input, fieldError(input))
      })
    })

    // Interest chips: the message prompt and the button adapt to what you picked.
    // /connect?interest=schools arrives with Schools already chosen.
    var prompt = form.querySelector("[data-prompt-target]")
    var radios = Array.prototype.slice.call(form.querySelectorAll('input[type="radio"][name="interest"]'))
    function applyInterest(radio) {
      if (prompt && radio.getAttribute("data-prompt")) prompt.placeholder = radio.getAttribute("data-prompt")
      if (radio.getAttribute("data-cta")) label.textContent = idleLabel = radio.getAttribute("data-cta")
    }
    var wanted = new URLSearchParams(window.location.search).get("interest")
    radios.forEach(function (radio) {
      if (wanted && radio.getAttribute("data-key") === wanted) radio.checked = true
      radio.addEventListener("change", function () { haptic([8]); applyInterest(radio) })
    })
    var chosen = radios.filter(function (r) { return r.checked })[0]
    if (chosen) applyInterest(chosen)

    form.addEventListener("submit", async function (event) {
      event.preventDefault()
      var firstBad = null
      required.forEach(function (input) {
        input.dataset.touched = "1"
        var message = fieldError(input)
        showFieldError(input, message)
        if (message && !firstBad) firstBad = input
      })
      if (firstBad) { haptic([6, 50, 6]); firstBad.focus(); return }

      error.hidden = true
      form.classList.add("is-sending")
      form.setAttribute("aria-busy", "true")
      submit.disabled = true
      label.textContent = "Sending"
      try {
        var response = await fetch(form.action, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        })
        if (!response.ok) throw new Error("rejected")
        haptic([30, 60, 30])
        var nameInput = form.querySelector('[name="name"], [name="first_name"]')
        var first = nameInput ? nameInput.value.trim().split(/\s+/)[0] : ""
        var nameSlot = success.querySelector("[data-success-name]")
        if (nameSlot) nameSlot.textContent = first ? ", " + first : ""
        form.hidden = true
        success.hidden = false
        requestAnimationFrame(function () { success.classList.add("is-shown") })
        success.focus()
      } catch (e) {
        error.textContent = "That didn’t go through, but nothing you typed is lost. Please try again, or call Emily at " + phone + "."
        error.hidden = false
        idleLabel = "Try again"
      } finally {
        form.classList.remove("is-sending")
        form.removeAttribute("aria-busy")
        submit.disabled = false
        label.textContent = idleLabel
      }
    })
  }

  function initForms() {
    document.querySelectorAll("[data-basin-form]").forEach(initForm)
  }

  // ── Header: tucks away while you read down, slides back as soon as you scroll up ──
  function initHeader() {
    var header = document.querySelector(".site-header")
    if (!header) return
    var menuButton = header.querySelector("[data-menu-button]")
    var announce = document.querySelector(".announce")
    var natural = 0
    var lastY = window.scrollY
    var ticking = false

    function measure() { natural = announce ? announce.offsetTop + announce.offsetHeight : 0 }
    var hasHere = !!header.querySelector(".here")
    function update() {
      ticking = false
      var y = window.scrollY
      header.classList.toggle("is-stuck", y > natural + 2)
      // Once you're reading down an inner page, the page's name shows under the logo
      if (hasHere) header.classList.toggle("is-deep", y > natural + 240)
      var menuOpen = menuButton && menuButton.getAttribute("aria-expanded") === "true"
      if (menuOpen || y < natural + header.offsetHeight + 160) {
        header.classList.remove("is-hidden")
      } else if (Math.abs(y - lastY) > 6) {
        header.classList.toggle("is-hidden", y > lastY)
      } else return
      lastY = y
    }
    measure()
    update()
    window.addEventListener("scroll", function () {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }, { passive: true })
    window.addEventListener("resize", function () { measure(); update() })
    header.addEventListener("focusin", function () { header.classList.remove("is-hidden") })
  }

  // ── Gentle reveal: sections settle into place as they scroll into view ──────
  // Content is fully visible without this script; it only adds the motion.
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]")
    if (!items.length || reduceMotion || !("IntersectionObserver" in window)) return
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return
        entry.target.classList.add("is-revealed")
        observer.unobserve(entry.target)
      })
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 })
    document.documentElement.classList.add("can-reveal")
    items.forEach(function (el) { observer.observe(el) })
  }

  // SVG animation and autoplaying video ignore the reduced-motion setting by themselves,
  // so hold them still: the breath glow rests at the top, Emily's drawing shows its first frame
  function initStillArt() {
    if (!reduceMotion) return
    document.querySelectorAll("svg[data-smil]").forEach(function (svg) {
      try { svg.pauseAnimations(); svg.setCurrentTime(4.5) } catch (e) {}
    })
    document.querySelectorAll("video[autoplay]").forEach(function (video) {
      video.removeAttribute("autoplay")
      try { video.pause(); video.currentTime = 0 } catch (e) {}
    })
  }

  // ── Emily's animation plays through once, as soon as it's properly in view ──
  // (With reduced motion it simply stays on its still.) It rests on the last frame.
  function initPlayOnce() {
    document.querySelectorAll("video[data-play-once]").forEach(function (video) {
      if (reduceMotion) return
      function go() {
        var playing = video.play()
        if (playing && playing.catch) playing.catch(function () {})
      }
      if (!("IntersectionObserver" in window)) { go(); return }
      var watcher = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return
        watcher.disconnect()
        go()
      }, { threshold: 0.5 })
      watcher.observe(video)
    })
  }

  function init() {
    initPrefetch()
    initPlayOnce()
    initStillArt()
    initPress()
    initHeader()
    initMenu()
    initBirds()
    initJourney()
    initServices()
    initChapters()
    initLines()
    initForms()
    initReveal()
  }

  startAtTop()
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init)
  else init()
})()
