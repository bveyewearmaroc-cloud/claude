/* ============================================================
   BV EYEWEAR — Interaction & motion layer
   GSAP · ScrollTrigger · Lenis · custom cursor · split text
   ============================================================ */
(function () {
  "use strict";

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  document.getElementById("year").textContent = new Date().getFullYear();

  // Graceful fallback: if GSAP failed to load, reveal everything statically.
  if (!gsap || !ScrollTrigger) {
    document.documentElement.classList.add("no-gsap");
    const pre = document.getElementById("preloader");
    if (pre) pre.style.display = "none";
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("is-loading");

  /* ---------------------------------------------------------
     Inject the SVG line-art frames into each collection card
  --------------------------------------------------------- */
  const FRAME_MARKUP = `
    <rect x="28" y="34" width="98" height="66" rx="30" fill="none" stroke-width="3"/>
    <rect x="174" y="34" width="98" height="66" rx="30" fill="none" stroke-width="3"/>
    <path d="M126 52 C140 40 160 40 174 52" fill="none" stroke-width="3"/>
    <path d="M28 56 L6 46" fill="none" stroke-width="3" stroke-linecap="round"/>
    <path d="M272 56 L294 46" fill="none" stroke-width="3" stroke-linecap="round"/>
    <circle cx="77" cy="67" r="3"/><circle cx="223" cy="67" r="3"/>
  `;
  document.querySelectorAll(".frame-svg").forEach((svg) => { svg.innerHTML = FRAME_MARKUP; });

  /* ---------------------------------------------------------
     Split-text helpers
  --------------------------------------------------------- */
  function splitLines(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    const probe = words.map((w) => {
      const s = document.createElement("span");
      s.style.display = "inline-block";
      s.textContent = w;
      el.appendChild(s);
      el.appendChild(document.createTextNode(" "));
      return s;
    });
    const lines = [];
    let top = null, cur = null;
    probe.forEach((s) => {
      const t = s.offsetTop;
      if (top === null || Math.abs(t - top) > 4) { cur = []; lines.push(cur); top = t; }
      cur.push(s.textContent);
    });
    el.textContent = "";
    const inners = [];
    lines.forEach((line) => {
      const l = document.createElement("span"); l.className = "l";
      const inner = document.createElement("span");
      inner.textContent = line.join(" ");
      l.appendChild(inner); el.appendChild(l); inners.push(inner);
    });
    return inners;
  }

  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    return words.map((w) => {
      const s = document.createElement("span");
      s.className = "w";
      s.textContent = w + " ";
      el.appendChild(s);
      return s;
    });
  }

  /* ---------------------------------------------------------
     Lenis smooth scroll
  --------------------------------------------------------- */
  let lenis = null;
  function initLenis() {
    if (isTouch || reduce || !window.Lenis) return;
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length > 1 && document.querySelector(id)) {
          e.preventDefault();
          lenis.scrollTo(id, { offset: 0, duration: 1.4 });
        }
      });
    });
  }

  /* ---------------------------------------------------------
     Custom cursor + magnetics
  --------------------------------------------------------- */
  function initCursor() {
    if (isTouch) return;
    const ring = document.getElementById("cursor");
    const dot = document.getElementById("cursorDot");
    const label = ring.querySelector(".cursor__label");
    document.body.classList.add("has-cursor");

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    window.addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    gsap.ticker.add(() => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    });

    document.querySelectorAll("a,button,[data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        ring.classList.add("is-hover");
        label.textContent = el.getAttribute("data-cursor") || "";
      });
      el.addEventListener("mouseleave", () => {
        ring.classList.remove("is-hover");
        label.textContent = "";
      });
    });

    // Magnetic
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.4;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        gsap.to(el, { x, y, duration: 0.5, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
      });
    });
  }

  /* ---------------------------------------------------------
     Preloader
  --------------------------------------------------------- */
  function runPreloader(onDone) {
    const countEl = document.getElementById("loadCount");
    const barEl = document.getElementById("loadBar");
    const pre = document.getElementById("preloader");
    const counter = { v: 0 };

    const tl = gsap.timeline({ onComplete: onDone });
    tl.to(counter, {
      v: 100, duration: 2.1, ease: "power2.inOut",
      onUpdate: () => {
        countEl.textContent = Math.round(counter.v);
        barEl.style.width = counter.v + "%";
      },
    });
    tl.to(".preloader__inner", { y: -30, opacity: 0, duration: 0.6, ease: "power2.in" }, "+=0.15");
    tl.to(pre, {
      yPercent: -100, duration: 1.0, ease: "expo.inOut",
      onComplete: () => { pre.style.display = "none"; },
    }, "-=0.1");
  }

  /* ---------------------------------------------------------
     Hero intro
  --------------------------------------------------------- */
  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.to(".hero__title .word", { yPercent: 0, duration: 1.2, stagger: 0.08 }, 0)
      .to(".hero__eyebrow span", { yPercent: 0, duration: 1.0 }, 0.15)
      .to(".hero__sub span", { yPercent: 0, duration: 1.0 }, 0.35)
      .from(".hero__actions .btn", { y: 24, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.5)
      .from(".hero__scroll, .hero__meta", { opacity: 0, duration: 1 }, 0.7)
      .from(".nav", { yPercent: -100, opacity: 0, duration: 1 }, 0.3);
  }

  /* ---------------------------------------------------------
     Scroll-driven animations
  --------------------------------------------------------- */
  function initScroll() {
    // Reveal lines (generic)
    gsap.utils.toArray(".reveal-line").forEach((el) => {
      gsap.to(el.querySelector("span"), {
        yPercent: 0, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    // Split-line headings
    gsap.utils.toArray("[data-split-lines]").forEach((el) => {
      const inners = splitLines(el);
      gsap.set(inners, { yPercent: 110 });
      gsap.to(inners, {
        yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });

    // Manifesto word fade
    const man = document.querySelector("[data-split]");
    if (man) {
      const ws = splitWords(man);
      gsap.to(ws, {
        opacity: 1, ease: "none", stagger: 0.05,
        scrollTrigger: { trigger: man, start: "top 75%", end: "bottom 60%", scrub: true },
      });
    }

    // Collections stagger
    gsap.from(".collection", {
      y: 80, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.12,
      scrollTrigger: { trigger: ".collections__grid", start: "top 80%" },
    });

    // Craft: progress bar + step emphasis
    const craftProgress = document.getElementById("craftProgress");
    ScrollTrigger.create({
      trigger: ".craft", start: "top top", end: "bottom bottom",
      onUpdate: (self) => { if (craftProgress) craftProgress.style.width = (self.progress * 100) + "%"; },
    });
    gsap.utils.toArray(".craft__step").forEach((step) => {
      gsap.from(step.children, {
        y: 40, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08,
        scrollTrigger: { trigger: step, start: "top 75%" },
      });
    });

    // Lookbook
    gsap.from(".look", {
      y: 90, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.1,
      scrollTrigger: { trigger: ".lookbook__grid", start: "top 82%" },
    });
    gsap.utils.toArray(".look__art").forEach((art) => {
      gsap.to(art, {
        yPercent: -8, ease: "none",
        scrollTrigger: { trigger: art.closest(".look"), start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    // Stores rows
    gsap.from(".store", {
      y: 40, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.08,
      scrollTrigger: { trigger: ".stores__list", start: "top 82%" },
    });

    // Footer wordmark parallax
    gsap.to(".footer__wordmark", {
      xPercent: -6, ease: "none",
      scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom top", scrub: true },
    });

    // Marquee — seamless loop, nudged faster by scroll velocity
    const track = document.getElementById("marqueeTrack");
    if (track) {
      const half = track.scrollWidth / 2;
      const loop = gsap.to(track, { x: -half, duration: 22, ease: "none", repeat: -1 });
      ScrollTrigger.create({
        trigger: ".marquee", start: "top bottom", end: "bottom top",
        onUpdate: (self) => {
          const boost = 1 + Math.min(6, Math.abs(self.getVelocity()) / 400);
          gsap.to(loop, { timeScale: boost, duration: 0.4, overwrite: true });
        },
      });
    }

    // Section pin parallax on hero content (subtle)
    gsap.to(".hero__content", {
      yPercent: -18, opacity: 0.85, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });

    // Hero 3D linked to scroll
    if (window.BVScene && window.BVScene.hero) {
      ScrollTrigger.create({
        trigger: ".hero", start: "top top", end: "bottom top", scrub: true,
        onUpdate: (self) => window.BVScene.hero.setScroll(self.progress),
      });
    }

    // Nav hide/show
    let lastY = 0;
    const nav = document.getElementById("nav");
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        if (y > lastY && y > 400) nav.classList.add("is-hidden");
        else nav.classList.remove("is-hidden");
        lastY = y;
      },
    });
  }

  /* ---------------------------------------------------------
     3D tilt on collection cards
  --------------------------------------------------------- */
  function initTilt() {
    if (isTouch) return;
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, { rotateY: px * 8, rotateX: -py * 8, transformPerspective: 900,
          transformOrigin: "center", duration: 0.5, ease: "power2.out" });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "elastic.out(1,0.5)" });
      });
    });
  }

  /* ---------------------------------------------------------
     Configurator swatches
  --------------------------------------------------------- */
  function initConfigurator() {
    const swatches = document.querySelectorAll(".swatch");
    const nameEl = document.getElementById("finishName");
    const apply = (btn) => {
      swatches.forEach((s) => s.classList.remove("is-active"));
      btn.classList.add("is-active");
      const color = btn.getAttribute("data-color");
      nameEl.textContent = btn.getAttribute("aria-label");
      const setIt = () => window.BVScene && window.BVScene.config && window.BVScene.config.setColor(color);
      if (window.BVScene && window.BVScene.config) setIt();
      else window.addEventListener("bvscene:ready", setIt, { once: true });
    };
    swatches.forEach((btn) => btn.addEventListener("click", () => apply(btn)));
  }

  /* ---------------------------------------------------------
     Newsletter
  --------------------------------------------------------- */
  function initNewsletter() {
    const form = document.getElementById("newsletter");
    const msg = document.getElementById("formMsg");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      msg.textContent = "Merci — welcome to Le Cercle BV.";
      form.reset();
    });
  }

  /* ---------------------------------------------------------
     Boot
  --------------------------------------------------------- */
  function start() {
    initCursor();
    initTilt();
    initConfigurator();
    initNewsletter();
    initScroll();
    initLenis();

    runPreloader(() => {
      document.body.classList.remove("is-loading");
      heroIntro();
      ScrollTrigger.refresh();
    });

    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
