/* ============================================================
   BV EYEWEAR — Asset generator
   Produces hand-crafted editorial SVG "campaign" posters for the
   lookbook. No dependencies — run with: node js/gen-assets.mjs
   Output: assets/img/look-01..04.svg
   ============================================================ */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, "../assets/img");
mkdirSync(OUT, { recursive: true });

const W = 600, H = 800;

/* ---- shared pieces ---------------------------------------- */

// Statement sunglasses worn on the silhouette
function glasses(cx, cy, frame, lensId) {
  const lw = 92, lh = 74, gap = 8, r = 26;
  const lx = cx - gap / 2 - lw;   // left lens x
  const rx = cx + gap / 2;        // right lens x
  const y = cy - lh / 2;
  const lens = (x) =>
    `<rect x="${x}" y="${y}" width="${lw}" height="${lh}" rx="${r}" fill="url(#${lensId})"/>
     <rect x="${x}" y="${y}" width="${lw}" height="${lh}" rx="${r}" fill="none" stroke="${frame}" stroke-width="7"/>`;
  return `
  <g>
    <path d="M ${lx - 4} ${cy - 28} L ${lx - 78} ${cy - 44}" stroke="${frame}" stroke-width="7" stroke-linecap="round"/>
    <path d="M ${rx + lw + 4} ${cy - 28} L ${rx + lw + 78} ${cy - 44}" stroke="${frame}" stroke-width="7" stroke-linecap="round"/>
    ${lens(lx)}
    ${lens(rx)}
    <path d="M ${lx + lw} ${cy - 18} q ${gap/2} -14 ${gap} 0" fill="none" stroke="${frame}" stroke-width="8" stroke-linecap="round"/>
  </g>`;
}

// Head-and-shoulders silhouette with an optional draped scarf
function figure(skin, scarf, rim) {
  return `
  <g>
    <!-- shoulders -->
    <path d="M 110 800 C 120 660 200 612 300 612 C 400 612 480 660 490 800 Z" fill="${skin}"/>
    <!-- neck -->
    <rect x="262" y="500" width="76" height="150" rx="30" fill="${skin}"/>
    <!-- head -->
    <ellipse cx="300" cy="430" rx="96" ry="116" fill="${skin}"/>
    <!-- draped scarf over the crown -->
    <path d="M 196 420 C 196 322 260 286 300 286 C 340 286 404 322 404 420
             C 404 392 372 360 300 360 C 228 360 196 392 196 420 Z" fill="${scarf}"/>
    <path d="M 196 420 C 150 470 150 620 188 800 L 250 800 C 214 600 224 470 240 430 Z" fill="${scarf}"/>
    <path d="M 404 420 C 450 470 450 620 412 800 L 350 800 C 386 600 376 470 360 430 Z" fill="${scarf}"/>
    <!-- rim light along the jaw -->
    <path d="M 392 470 C 388 520 360 556 312 566" fill="none" stroke="${rim}" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
  </g>`;
}

function grain(id, freq, op) {
  return `<filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="${op}"/></feComponentTransfer>
    <feComposite operator="over" in2="SourceGraphic"/></filter>`;
}

/* ---- scene builders --------------------------------------- */

function poster({ name, sky, horizon, sun, sunY, accent, skin, scarf, lens, scene }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${name}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${sky}"/><stop offset="1" stop-color="${horizon}"/>
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${sun}"/><stop offset="0.55" stop-color="${sun}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${sun}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${name}-lens" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="${lens[0]}"/><stop offset="0.5" stop-color="${lens[1]}"/><stop offset="1" stop-color="${lens[2]}"/>
    </linearGradient>
    <linearGradient id="vig" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="0.7" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#0E0D0B" stop-opacity="0.85"/>
    </linearGradient>
    ${grain("g", 0.9, 0.12)}
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <circle cx="300" cy="${sunY}" r="360" fill="url(#sun)"/>
  ${scene}
  ${figure(skin, scarf, accent)}
  ${glasses(300, 410, accent, name + "-lens")}

  <!-- monogram -->
  <text x="40" y="64" font-family="Georgia, serif" font-size="30" fill="#EFE7DA" opacity="0.85">BV</text>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  <rect width="${W}" height="${H}" filter="url(#g)" opacity="0.5"/>
</svg>`;
}

/* ---- the four campaign frames ----------------------------- */

const scenes = {
  // 01 — Essaouira, noon: high bright sun, gulls, light gold
  essaouira: `
    <g opacity="0.5" fill="none" stroke="#EFE7DA" stroke-width="3" stroke-linecap="round">
      <path d="M 90 150 q 14 -12 28 0 q 14 -12 28 0"/>
      <path d="M 430 110 q 12 -10 24 0 q 12 -10 24 0"/>
      <path d="M 360 200 q 10 -8 20 0 q 10 -8 20 0"/>
    </g>`,
  // 02 — Atlas pass: layered mountains, cool
  atlas: `
    <path d="M 0 560 L 120 470 L 230 540 L 340 440 L 470 540 L 600 470 L 600 800 L 0 800 Z" fill="#23332E" opacity="0.55"/>
    <path d="M 0 620 L 150 540 L 300 600 L 450 530 L 600 600 L 600 800 L 0 800 Z" fill="#1A2622" opacity="0.7"/>`,
  // 03 — Medina light: keyhole arch frame + tiles
  medina: `
    <path d="M 120 800 L 120 360 C 120 250 220 200 300 200 C 380 200 480 250 480 360 L 480 800
             L 440 800 L 440 360 C 440 280 370 240 300 240 C 230 240 160 280 160 360 L 160 800 Z"
          fill="#3A1A12" opacity="0.55"/>
    <g opacity="0.35" fill="#C9A24A">
      <circle cx="150" cy="700" r="6"/><circle cx="450" cy="700" r="6"/>
      <circle cx="150" cy="640" r="6"/><circle cx="450" cy="640" r="6"/>
    </g>`,
  // 04 — Blue hour: crescent moon + stars
  bluehour: `
    <g fill="#EFE7DA">
      <path d="M 470 150 a 46 46 0 1 0 18 70 a 36 36 0 1 1 -18 -70 Z" opacity="0.9"/>
      <circle cx="130" cy="120" r="2.5" opacity="0.8"/><circle cx="200" cy="200" r="2" opacity="0.7"/>
      <circle cx="380" cy="90" r="2" opacity="0.7"/><circle cx="90" cy="240" r="2.5" opacity="0.6"/>
      <circle cx="300" cy="140" r="1.8" opacity="0.6"/>
    </g>`,
};

const frames = [
  ["look-01", poster({
    name: "look-01", sky: "#E9B86A", horizon: "#C97A3A", sun: "#FFE9B0", sunY: 230,
    accent: "#1A1208", skin: "#5A3A1E", scarf: "#7A4A22", lens: ["#FFE6A8", "#E89A4A", "#7A4420"],
    scene: scenes.essaouira,
  })],
  ["look-02", poster({
    name: "look-02", sky: "#7E98A0", horizon: "#3E5C52", sun: "#DDEAE0", sunY: 300,
    accent: "#10201B", skin: "#26433A", scarf: "#36564A", lens: ["#CFE3DA", "#5E7E74", "#1C2C26"],
    scene: scenes.atlas,
  })],
  ["look-03", poster({
    name: "look-03", sky: "#D98A5A", horizon: "#8A3A22", sun: "#FFCF94", sunY: 250,
    accent: "#1A0A06", skin: "#5A241A", scarf: "#8A3A2A", lens: ["#FFD0A0", "#C05A38", "#5A1E12"],
    scene: scenes.medina,
  })],
  ["look-04", poster({
    name: "look-04", sky: "#3A3A6A", horizon: "#5A3A6A", sun: "#9A86C4", sunY: 280,
    accent: "#0A0814", skin: "#241C3A", scarf: "#3A2C56", lens: ["#C8BCE6", "#7A66B0", "#1E1630"],
    scene: scenes.bluehour,
  })],
];

for (const [name, svg] of frames) {
  writeFileSync(resolve(OUT, name + ".svg"), svg.trim() + "\n");
  console.log("wrote", name + ".svg", svg.length, "bytes");
}
