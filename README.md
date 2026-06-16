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

## 🖼 Imagery — hand-crafted, zero dependencies

All visuals are **code-generated**, so the site is striking with no stock photos:

- **Lookbook posters** — four editorial "campaign" frames are generated as SVG by
  `js/gen-assets.mjs` (`node js/gen-assets.mjs` → `assets/img/look-0X.svg`). Each is a
  silhouetted figure in a Moroccan headscarf wearing statement sunglasses, set against
  a distinct scene (Essaouira noon, Atlas pass, Medina arch, blue hour) with reflective
  lens gradients and built-in film grain.
- **Collection silhouettes** — each collection card draws its own frame shape
  (round / rectangular / cat-eye) as inline SVG line-art.
- **3D frames** — the hero and configurator are live Three.js, not images.

To swap in real photography later, drop files into `assets/img/` and point the
`.look__art` background-image (or collection `.collection__visual`) at them — the
layout, parallax and hover reveals already support it.

> Higgsfield AI generation was attempted but the account returned `User not found` /
> no credits, so the imagery above was produced with hand-written SVG instead.

## 🎨 Art direction

- **Ink** `#0E0D0B` · **Bone** `#EFE7DA` · **Gold** `#C9A24A` · **Terracotta**
  `#B5563A` · **Atlas green** `#5E7E74`
- Display serif set tight and large; grotesk for UI; generous negative space;
  warm film grain overlay for depth.
