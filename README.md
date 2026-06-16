# BV EYEWEAR — Immersive Website Redesign

An award-winning–calibre, high-fidelity redesign concept for **BV Eyewear (Maroc)** —
a Moroccan eyewear house. The site is built as an *experience*: real-time WebGL
eyewear, scroll-choreographed motion, micro-interactions, and an editorial
art direction in warm Moroccan ink, bone and gold.

## ✨ Highlights

- **Real-time 3D glasses** (Three.js) — a procedurally-modelled pair of frames with
  physical materials, environment reflections and gold rim light. It floats and
  reacts to the cursor in the hero, and is fully **draggable in the configurator**.
- **Live configurator** — pick a finish (Onyx, Honey, Terracotta, Atlas, Bone) and
  the 3D frame recolours in real time, with material roughness/metalness retuned per
  finish so it always reads like real acetate.
- **GSAP + ScrollTrigger choreography** — preloader counter, hero line reveals,
  word-by-word manifesto, split-line headings, pinned atelier timeline with a live
  progress bar, parallax lookbook, velocity-reactive marquee, sliding store rows.
- **Lenis smooth scroll** for buttery inertia, synced to ScrollTrigger.
- **Micro-interactions** — custom blend-mode cursor with contextual labels, magnetic
  nav/buttons, 3D tilt on collection cards, hover sweeps, animated scroll cue.
- **Resilient & accessible** — graceful fallbacks if WebGL or the GSAP CDN fail,
  `prefers-reduced-motion` support, touch-aware (cursor/tilt disabled), responsive
  down to mobile.

## 🧱 Tech

| Layer | Choice |
|---|---|
| 3D | [Three.js](https://threejs.org) (ES modules via import map) |
| Animation | [GSAP 3](https://gsap.com) + ScrollTrigger |
| Smooth scroll | [Lenis](https://github.com/darkroomengineering/lenis) |
| Type | Fraunces (display serif) · Space Grotesk (grotesk) |
| Build | None — static HTML/CSS/JS. Just serve the folder. |

All libraries load from CDN in the browser, so there is no build step.

## ▶️ Run it

```bash
# from the project root
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works (`npx serve`, etc.). An internet connection is needed the
first time so the browser can pull the Three.js / GSAP / Lenis CDNs and Google Fonts.

## 🗂 Structure

```
index.html        # markup + import map + CDN includes
css/style.css     # full art direction & responsive system
js/scene.js       # Three.js engine: builds the glasses, hero + configurator scenes
js/app.js         # preloader, Lenis, GSAP scroll animations, cursor, magnetics
assets/img/       # drop real photography / AI renders here
```

## 🖼 Swapping in real imagery (Higgsfield)

The visuals are intentionally **code-generated** (WebGL frames, CSS/SVG art) so the
site is striking with zero photography. To layer in real product/lifestyle shots:

1. Generate assets (hero portrait, product shots, lookbook) with the Higgsfield
   tools and save them into `assets/img/`.
   > Note: in the session that produced this build, the Higgsfield account returned
   > `User not found` / no available credits, so generation could not run. Once the
   > account is provisioned, the lookbook tiles (`.look__art`) and collection cards
   > are the natural drop-in points.
2. Replace the gradient `.look__art` backgrounds (or collection `.collection__visual`)
   with `<img>` / `background-image`. The layout, parallax and hover reveals already
   support it.

## 🎨 Art direction

- **Ink** `#0E0D0B` · **Bone** `#EFE7DA` · **Gold** `#C9A24A` · **Terracotta**
  `#B5563A` · **Atlas green** `#5E7E74`
- Display serif set tight and large; grotesk for UI; generous negative space;
  warm film grain overlay for depth.
