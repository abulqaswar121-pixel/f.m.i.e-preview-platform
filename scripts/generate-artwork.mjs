/**
 * F.M.I.E artwork generator.
 *
 * Every image on the platform is an original vector composition built from the
 * brand palette — no stock photography, no third-party marks, no external
 * network requests. Run `node scripts/generate-artwork.mjs` to regenerate
 * `public/art/**` and `src/assets/logo.svg`.
 *
 * The artwork is deterministic: the same inputs always produce the same files.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const artDir = join(repoRoot, "public", "art");
const assetsDir = join(repoRoot, "src", "assets");

const PALETTE = {
  navy: "#0A2E68",
  navyDark: "#071E43",
  navyLight: "#14428B",
  gold: "#C5A869",
  goldSoft: "#E4D6B4",
  cream: "#F8F9FA",
  paper: "#F1F4F9",
  slate: "#334155",
  charcoal: "#0F172A",
  border: "#E2E8F0",
};

function write(relativePath, contents) {
  const target = join(relativePath.startsWith("src/") ? repoRoot : artDir, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents, "utf8");
  return target;
}

/* ---------------------------------------------------------------- */
/* Logo                                                              */
/* ---------------------------------------------------------------- */

/**
 * The official F.M.I.E mark: a serif F whose top arm turns down to bracket an
 * overlapping capital M, with the punctuated wordmark F.M.I.E beneath.
 */
const MONOGRAM_PATHS = [
  // F — stem with base serif
  "M16 12h9v72H10v-5h6z",
  // F — top arm, turning down at the end to bracket the M
  "M16 12h74v14h-5V21H16z",
  // F — middle arm
  "M16 44h30v8H16z",
  // M — overlapping capital, sitting inside the bracket of the F arm
  "M48 84V26h9l12 34 12-34h9v58h-9V44L70 78h-2L57 44v40z",
];

function logoSvg({ width = 240, height = 168, fill = PALETTE.navy } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 240 168" role="img" aria-label="F.M.I.E">
  <g fill="${fill}">
    <g transform="translate(60 4) scale(1.2)">
${MONOGRAM_PATHS.map((d) => `      <path d="${d}"/>`).join("\n")}
    </g>
    <rect x="60" y="122" width="120" height="2" fill="${PALETTE.gold}"/>
    <text x="120" y="158" text-anchor="middle" font-family="Playfair Display, Merriweather, Georgia, 'Times New Roman', serif" font-size="34" font-weight="700" letter-spacing="3">${"F.M.I.E"}</text>
  </g>
</svg>
`;
}

/* ---------------------------------------------------------------- */
/* Cover compositions (1200 x 675)                                   */
/* ---------------------------------------------------------------- */

const COVER_W = 1200;
const COVER_H = 675;

function coverFrame(inner, { background = PALETTE.paper, tint = PALETTE.cream } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${COVER_W}" height="${COVER_H}" viewBox="0 0 ${COVER_W} ${COVER_H}" role="img" aria-label="F.M.I.E editorial artwork">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${tint}"/>
      <stop offset="100%" stop-color="${background}"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0v48" fill="none" stroke="${PALETTE.border}" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${COVER_W}" height="${COVER_H}" fill="url(#sky)"/>
  <rect width="${COVER_W}" height="${COVER_H}" fill="url(#grid)" opacity="0.55"/>
${inner}
  <g transform="translate(56 566)" opacity="0.9">
    <g fill="${PALETTE.navy}" transform="scale(0.34)">
${MONOGRAM_PATHS.map((d) => `      <path d="${d}"/>`).join("\n")}
    </g>
    <rect x="0" y="42" width="132" height="3" fill="${PALETTE.gold}"/>
    <text x="0" y="72" font-family="Inter, Helvetica, Arial, sans-serif" font-size="20" letter-spacing="6" fill="${PALETTE.slate}">F.M.I.E</text>
  </g>
</svg>
`;
}

/** Supply-chain corridors: horizontal routes with interchange nodes. */
function coverCorridors() {
  const routes = [
    { y: 190, stops: [180, 420, 660, 900, 1080] },
    { y: 300, stops: [140, 380, 620, 860, 1120] },
    { y: 410, stops: [220, 460, 700, 940, 1100] },
  ];
  let body = "";
  routes.forEach((route, index) => {
    body += `  <path d="M100 ${route.y} H1120" stroke="${PALETTE.navy}" stroke-width="${index === 1 ? 6 : 3}" stroke-opacity="${index === 1 ? 0.85 : 0.4}" fill="none"/>\n`;
    route.stops.forEach((x, i) => {
      const big = i % 2 === 0;
      body += `  <circle cx="${x}" cy="${route.y}" r="${big ? 16 : 9}" fill="${big ? PALETTE.gold : PALETTE.navyLight}"/>\n`;
      if (big) {
        body += `  <circle cx="${x}" cy="${route.y}" r="26" fill="none" stroke="${PALETTE.navy}" stroke-opacity="0.18" stroke-width="2"/>\n`;
      }
    });
  });
  body += `  <path d="M420 190 C 520 120 700 120 860 300" stroke="${PALETTE.gold}" stroke-width="4" fill="none" stroke-dasharray="14 10"/>\n`;
  body += `  <rect x="820" y="120" width="300" height="180" fill="${PALETTE.navy}" opacity="0.06"/>\n`;
  return coverFrame(body, { background: PALETTE.cream, tint: "#FFFFFF" });
}

/** Institutional capital: stacked columns under a rising arc. */
function coverCapital() {
  const heights = [180, 240, 150, 320, 280, 380, 220, 300];
  let body = "";
  heights.forEach((h, i) => {
    const x = 160 + i * 110;
    body += `  <rect x="${x}" y="${520 - h}" width="62" height="${h}" fill="${i % 3 === 0 ? PALETTE.navy : PALETTE.navyLight}" opacity="${0.55 + i * 0.05}"/>\n`;
    body += `  <rect x="${x}" y="${520 - h}" width="62" height="10" fill="${PALETTE.gold}"/>\n`;
  });
  body += `  <path d="M120 460 C 360 200 720 300 1100 120" stroke="${PALETTE.navy}" stroke-width="5" fill="none"/>\n`;
  body += `  <circle cx="1100" cy="120" r="14" fill="${PALETTE.gold}"/>\n`;
  body += `  <path d="M120 520 H1120" stroke="${PALETTE.slate}" stroke-width="2" opacity="0.5"/>\n`;
  return coverFrame(body, { background: PALETTE.paper, tint: "#FFFFFF" });
}

/** Edge compute: a lattice of nodes with traces into a central processor. */
function coverCompute() {
  let body = `  <rect x="470" y="230" width="260" height="210" rx="10" fill="${PALETTE.navy}"/>\n`;
  body += `  <rect x="500" y="260" width="200" height="150" rx="6" fill="${PALETTE.navyLight}"/>\n`;
  body += `  <rect x="530" y="290" width="140" height="90" rx="4" fill="${PALETTE.gold}" opacity="0.9"/>\n`;
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const x = 120 + col * 120;
      const y = 110 + row * 110;
      if (x > 430 && x < 780 && y > 190 && y < 480) continue;
      body += `  <rect x="${x}" y="${y}" width="26" height="26" rx="4" fill="${PALETTE.navy}" opacity="${0.12 + ((row + col) % 4) * 0.09}"/>\n`;
      body += `  <path d="M${x + 13} ${y + 26} V${y + 60}" stroke="${PALETTE.navyLight}" stroke-opacity="0.25" stroke-width="2"/>\n`;
    }
  }
  body += `  <path d="M200 560 H1000" stroke="${PALETTE.gold}" stroke-width="4" stroke-dasharray="20 12" opacity="0.7"/>\n`;
  return coverFrame(body, { background: "#EEF2F8", tint: "#FFFFFF" });
}

/** Cross-border: two overlapping spheres joined by a dotted route. */
function coverCrossBorder() {
  let body = `  <circle cx="430" cy="330" r="200" fill="${PALETTE.navy}" opacity="0.9"/>\n`;
  body += `  <circle cx="700" cy="330" r="200" fill="${PALETTE.navyLight}" opacity="0.55"/>\n`;
  body += `  <circle cx="430" cy="330" r="200" fill="none" stroke="${PALETTE.gold}" stroke-width="3"/>\n`;
  body += `  <circle cx="700" cy="330" r="200" fill="none" stroke="${PALETTE.gold}" stroke-width="3"/>\n`;
  for (let i = 0; i < 7; i += 1) {
    const y = 200 + i * 44;
    body += `  <path d="M250 ${y} Q 565 ${y + (i % 2 === 0 ? -26 : 26)} 880 ${y}" stroke="${PALETTE.cream}" stroke-opacity="0.22" stroke-width="2" fill="none"/>\n`;
  }
  body += `  <path d="M180 520 C 400 420 800 620 1060 470" stroke="${PALETTE.gold}" stroke-width="5" fill="none" stroke-dasharray="2 16" stroke-linecap="round"/>\n`;
  body += `  <circle cx="180" cy="520" r="12" fill="${PALETTE.gold}"/>\n`;
  body += `  <circle cx="1060" cy="470" r="12" fill="${PALETTE.gold}"/>\n`;
  return coverFrame(body, { background: PALETTE.cream, tint: "#FFFFFF" });
}

/** Governance: a colonnade with a horizontal accountability rule. */
function coverGovernance() {
  let body = `  <rect x="180" y="150" width="840" height="34" fill="${PALETTE.navy}"/>\n`;
  body += `  <rect x="210" y="184" width="780" height="18" fill="${PALETTE.gold}"/>\n`;
  for (let i = 0; i < 7; i += 1) {
    const x = 220 + i * 116;
    body += `  <rect x="${x}" y="210" width="42" height="290" fill="${PALETTE.navyLight}" opacity="${0.55 + (i % 3) * 0.15}"/>\n`;
    body += `  <rect x="${x - 6}" y="204" width="54" height="12" fill="${PALETTE.navy}"/>\n`;
    body += `  <rect x="${x - 6}" y="494" width="54" height="12" fill="${PALETTE.navy}"/>\n`;
  }
  body += `  <rect x="180" y="510" width="840" height="26" fill="${PALETTE.navy}"/>\n`;
  body += `  <path d="M120 570 H1080" stroke="${PALETTE.slate}" stroke-width="2" opacity="0.4"/>\n`;
  body += `  <circle cx="600" cy="345" r="58" fill="none" stroke="${PALETTE.gold}" stroke-width="6"/>\n`;
  body += `  <path d="M600 300 V345 L636 366" stroke="${PALETTE.gold}" stroke-width="6" fill="none" stroke-linecap="round"/>\n`;
  return coverFrame(body, { background: PALETTE.paper, tint: "#FFFFFF" });
}

/** Credit markets: two diverging yield curves on a ruled grid. */
function coverCredit() {
  let body = "";
  for (let i = 0; i < 6; i += 1) {
    const y = 140 + i * 80;
    body += `  <path d="M120 ${y} H1100" stroke="${PALETTE.slate}" stroke-opacity="0.12" stroke-width="1"/>\n`;
  }
  body += `  <path d="M120 470 C 340 430 520 300 760 280 C 900 268 1000 210 1100 170" stroke="${PALETTE.navy}" stroke-width="7" fill="none"/>\n`;
  body += `  <path d="M120 500 C 320 500 460 460 620 470 C 780 480 900 520 1100 430" stroke="${PALETTE.gold}" stroke-width="7" fill="none" stroke-dasharray="22 14"/>\n`;
  body += `  <circle cx="760" cy="280" r="13" fill="${PALETTE.navy}"/>\n`;
  body += `  <circle cx="620" cy="470" r="13" fill="${PALETTE.gold}"/>\n`;
  body += `  <rect x="140" y="150" width="230" height="8" fill="${PALETTE.navy}" opacity="0.35"/>\n`;
  body += `  <rect x="140" y="170" width="150" height="8" fill="${PALETTE.navy}" opacity="0.2"/>\n`;
  return coverFrame(body, { background: "#FFFFFF", tint: PALETTE.cream });
}

/** Travel desk: layered bands with travel objects. */
function coverTravelDesk() {
  let body = `  <rect x="0" y="360" width="1200" height="315" fill="${PALETTE.navy}" opacity="0.07"/>\n`;
  body += `  <rect x="250" y="300" width="420" height="230" rx="8" fill="${PALETTE.navy}"/>\n`;
  body += `  <rect x="250" y="300" width="420" height="30" rx="8" fill="${PALETTE.navyDark}"/>\n`;
  body += `  <rect x="290" y="360" width="340" height="8" fill="${PALETTE.gold}" opacity="0.8"/>\n`;
  for (let i = 0; i < 8; i += 1) {
    body += `  <rect x="290" y="${390 + i * 16}" width="${340 - (i % 3) * 60}" height="6" fill="${PALETTE.cream}" opacity="0.22"/>\n`;
  }
  body += `  <rect x="740" y="470" width="230" height="14" rx="7" fill="${PALETTE.slate}" opacity="0.5"/>\n`;
  body += `  <g transform="translate(760 330)">
    <rect x="0" y="0" width="26" height="140" rx="6" fill="${PALETTE.gold}"/>
    <rect x="6" y="-26" width="14" height="30" rx="4" fill="${PALETTE.navy}"/>
    <path d="M4 128 L13 152 L22 128 Z" fill="${PALETTE.navy}"/>
  </g>\n`;
  body += `  <circle cx="940" cy="230" r="86" fill="none" stroke="${PALETTE.navyLight}" stroke-width="3" opacity="0.4"/>\n`;
  body += `  <path d="M854 230 H1026 M940 144 V316" stroke="${PALETTE.navyLight}" stroke-width="2" opacity="0.35"/>\n`;
  return coverFrame(body, { background: PALETTE.cream, tint: "#FFFFFF" });
}

/** Gulf horizon: sun arc over a layered desert horizon. */
function coverGulf() {
  let body = `  <circle cx="600" cy="330" r="150" fill="${PALETTE.gold}" opacity="0.85"/>\n`;
  body += `  <path d="M0 400 C 240 330 420 470 640 400 C 860 330 1020 450 1200 390 V675 H0 Z" fill="${PALETTE.navy}" opacity="0.9"/>\n`;
  body += `  <path d="M0 470 C 260 410 460 520 700 470 C 900 428 1040 500 1200 460 V675 H0 Z" fill="${PALETTE.navyDark}" opacity="0.9"/>\n`;
  for (let i = 0; i < 5; i += 1) {
    body += `  <path d="M${120 + i * 220} ${300 - i * 12} h120" stroke="${PALETTE.navyLight}" stroke-width="4" opacity="${0.25 + i * 0.1}"/>\n`;
  }
  body += `  <rect x="150" y="180" width="14" height="180" fill="${PALETTE.navyLight}" opacity="0.35"/>\n`;
  body += `  <rect x="1030" y="150" width="14" height="210" fill="${PALETTE.navyLight}" opacity="0.35"/>\n`;
  return coverFrame(body, { background: "#F4F1E8", tint: "#FFFDF7" });
}

/** Measurement: scattered respondents inside a sampling frame. */
function coverMeasurement() {
  let body = `  <rect x="180" y="130" width="840" height="410" fill="none" stroke="${PALETTE.navy}" stroke-width="4"/>\n`;
  const seedPoints = [
    [260, 210],
    [340, 320],
    [300, 430],
    [420, 250],
    [470, 380],
    [520, 180],
    [580, 300],
    [640, 450],
    [700, 230],
    [760, 350],
    [820, 200],
    [880, 420],
    [930, 290],
    [380, 480],
    [600, 500],
    [860, 500],
    [240, 350],
    [980, 190],
  ];
  seedPoints.forEach(([x, y], i) => {
    const highlighted = i % 4 === 0;
    body += `  <circle cx="${x}" cy="${y}" r="${highlighted ? 16 : 10}" fill="${highlighted ? PALETTE.gold : PALETTE.navyLight}" opacity="${highlighted ? 0.95 : 0.55}"/>\n`;
  });
  body += `  <path d="M180 335 H1020" stroke="${PALETTE.gold}" stroke-width="3" stroke-dasharray="12 10"/>\n`;
  body += `  <rect x="180" y="130" width="200" height="10" fill="${PALETTE.navy}"/>\n`;
  return coverFrame(body, { background: "#FFFFFF", tint: PALETTE.cream });
}

/** Commercial dispatch: a stamped document. */
function coverDispatch() {
  let body = `  <rect x="330" y="110" width="540" height="440" rx="6" fill="#FFFFFF" stroke="${PALETTE.border}" stroke-width="3"/>\n`;
  body += `  <rect x="330" y="110" width="540" height="56" rx="6" fill="${PALETTE.navy}"/>\n`;
  body += `  <rect x="370" y="132" width="180" height="12" fill="${PALETTE.gold}"/>\n`;
  for (let i = 0; i < 10; i += 1) {
    body += `  <rect x="370" y="${200 + i * 30}" width="${460 - (i % 4) * 90}" height="9" rx="4" fill="${PALETTE.slate}" opacity="0.22"/>\n`;
  }
  body += `  <g transform="translate(700 400) rotate(-14)">
    <circle cx="0" cy="0" r="76" fill="none" stroke="${PALETTE.gold}" stroke-width="6"/>
    <circle cx="0" cy="0" r="58" fill="none" stroke="${PALETTE.gold}" stroke-width="3"/>
    <rect x="-40" y="-8" width="80" height="16" fill="${PALETTE.gold}"/>
  </g>\n`;
  body += `  <rect x="180" y="580" width="840" height="6" fill="${PALETTE.navy}" opacity="0.15"/>\n`;
  return coverFrame(body, { background: PALETTE.paper, tint: "#FFFFFF" });
}

/** Sponsored research: a document under review with a disclosure band. */
function coverSponsored() {
  let body = `  <rect x="250" y="140" width="470" height="380" rx="6" fill="#FFFFFF" stroke="${PALETTE.border}" stroke-width="3"/>\n`;
  for (let i = 0; i < 9; i += 1) {
    body += `  <rect x="290" y="${190 + i * 32}" width="${390 - (i % 3) * 80}" height="9" rx="4" fill="${PALETTE.slate}" opacity="0.2"/>\n`;
  }
  body += `  <rect x="250" y="140" width="470" height="40" rx="6" fill="${PALETTE.gold}"/>\n`;
  body += `  <g transform="translate(800 330)">
    <circle cx="0" cy="0" r="130" fill="none" stroke="${PALETTE.navy}" stroke-width="10"/>
    <path d="M92 92 L190 190" stroke="${PALETTE.navy}" stroke-width="26" stroke-linecap="round"/>
    <circle cx="0" cy="0" r="130" fill="${PALETTE.navyLight}" opacity="0.12"/>
  </g>\n`;
  body += `  <path d="M120 570 H1080" stroke="${PALETTE.gold}" stroke-width="6"/>\n`;
  return coverFrame(body, { background: PALETTE.cream, tint: "#FFFFFF" });
}

/* ---------------------------------------------------------------- */
/* Product artwork (900 x 900)                                       */
/* ---------------------------------------------------------------- */

const PRODUCT_W = 900;

function productFrame(inner, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PRODUCT_W}" height="${PRODUCT_W}" viewBox="0 0 ${PRODUCT_W} ${PRODUCT_W}" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="studio" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="${PALETTE.paper}"/>
    </linearGradient>
    <linearGradient id="cloth" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${PALETTE.navyLight}"/>
      <stop offset="55%" stop-color="${PALETTE.navy}"/>
      <stop offset="100%" stop-color="${PALETTE.navyDark}"/>
    </linearGradient>
  </defs>
  <rect width="${PRODUCT_W}" height="${PRODUCT_W}" fill="url(#studio)"/>
  <circle cx="450" cy="420" r="300" fill="${PALETTE.navy}" opacity="0.05"/>
  <path d="M0 760 H900" stroke="${PALETTE.border}" stroke-width="2"/>
  <ellipse cx="450" cy="768" rx="240" ry="22" fill="${PALETTE.navy}" opacity="0.08"/>
${inner}
  <g transform="translate(60 60)">
    <g fill="${PALETTE.navy}" transform="scale(0.3)">${MONOGRAM_PATHS.map((d) => `<path d="${d}"/>`).join("")}</g>
    <rect x="0" y="38" width="112" height="3" fill="${PALETTE.gold}"/>
    <text x="0" y="66" font-family="Inter, Helvetica, Arial, sans-serif" font-size="18" letter-spacing="5" fill="${PALETTE.slate}">F.M.I.E</text>
  </g>
</svg>
`;
}

/** Small stitched monogram used on apparel and leather goods. */
function stitchedMonogram(x, y, scale = 0.5, colour = PALETTE.gold) {
  return `  <g transform="translate(${x} ${y}) scale(${scale})" fill="${colour}">${MONOGRAM_PATHS.map((d) => `<path d="${d}"/>`).join("")}</g>\n`;
}

function productPolo() {
  let body = `  <path d="M300 250 L380 210 L450 250 L520 210 L600 250 L660 320 L620 350 L620 700 L280 700 L280 350 L240 320 Z" fill="url(#cloth)"/>\n`;
  body += `  <path d="M380 210 L450 250 L520 210 L500 190 L450 214 L400 190 Z" fill="${PALETTE.navyDark}"/>\n`;
  body += `  <rect x="436" y="250" width="28" height="120" fill="${PALETTE.navyDark}" opacity="0.75"/>\n`;
  for (let i = 0; i < 3; i += 1) {
    body += `  <circle cx="450" cy="${278 + i * 34}" r="7" fill="${PALETTE.goldSoft}"/>\n`;
  }
  body += `  <path d="M280 350 L240 320 L280 300 Z" fill="${PALETTE.navyDark}" opacity="0.5"/>\n`;
  body += `  <path d="M620 350 L660 320 L620 300 Z" fill="${PALETTE.navyDark}" opacity="0.5"/>\n`;
  body += `  <path d="M280 660 H620" stroke="${PALETTE.navyDark}" stroke-width="6" opacity="0.5"/>\n`;
  body += stitchedMonogram(330, 300, 0.62);
  return productFrame(body, "F.M.I.E Signature Oxford Navy Polo");
}

function productHoodie() {
  let body = `  <path d="M310 270 L400 220 Q450 260 500 220 L590 270 L680 350 L640 400 L640 720 L260 720 L260 400 L220 350 Z" fill="url(#cloth)"/>\n`;
  body += `  <path d="M400 220 Q450 268 500 220 Q520 300 450 320 Q380 300 400 220 Z" fill="${PALETTE.navyDark}"/>\n`;
  body += `  <path d="M420 320 V420 M480 320 V420" stroke="${PALETTE.goldSoft}" stroke-width="8" stroke-linecap="round"/>\n`;
  body += `  <circle cx="420" cy="426" r="7" fill="${PALETTE.gold}"/><circle cx="480" cy="426" r="7" fill="${PALETTE.gold}"/>\n`;
  body += `  <path d="M340 540 Q450 600 560 540 L560 660 Q450 700 340 660 Z" fill="${PALETTE.navyDark}" opacity="0.6"/>\n`;
  body += `  <rect x="252" y="690" width="396" height="30" fill="${PALETTE.navyDark}" opacity="0.7"/>\n`;
  body += stitchedMonogram(560, 620, 0.42, PALETTE.goldSoft);
  return productFrame(body, "F.M.I.E Executive Heavyweight Hoodie");
}

function productCap() {
  let body = `  <path d="M270 470 Q270 260 470 260 Q670 260 670 470 Z" fill="url(#cloth)"/>\n`;
  body += `  <path d="M270 470 Q470 520 670 470 L670 500 Q470 552 270 500 Z" fill="${PALETTE.navyDark}"/>\n`;
  body += `  <path d="M640 480 Q820 500 830 560 Q830 600 700 596 Q600 590 560 520 Z" fill="${PALETTE.navy}"/>\n`;
  body += `  <path d="M640 480 Q820 500 830 560" stroke="${PALETTE.navyDark}" stroke-width="6" fill="none"/>\n`;
  for (let i = 0; i < 4; i += 1) {
    body += `  <path d="M${330 + i * 90} 470 Q${350 + i * 90} 320 470 262" stroke="${PALETTE.navyDark}" stroke-width="4" opacity="0.35" fill="none"/>\n`;
  }
  body += `  <circle cx="470" cy="258" r="12" fill="${PALETTE.gold}"/>\n`;
  body += stitchedMonogram(410, 330, 0.55, PALETTE.goldSoft);
  return productFrame(body, "F.M.I.E Classic Debossed Cap");
}

function productNotebook() {
  let body = `  <rect x="220" y="220" width="380" height="500" rx="10" fill="${PALETTE.navy}"/>\n`;
  body += `  <rect x="220" y="220" width="46" height="500" rx="10" fill="${PALETTE.navyDark}"/>\n`;
  body += `  <rect x="266" y="240" width="322" height="460" fill="#FFFDF7"/>\n`;
  for (let i = 0; i < 12; i += 1) {
    body += `  <rect x="286" y="${268 + i * 34}" width="${282 - (i % 3) * 60}" height="6" rx="3" fill="${PALETTE.slate}" opacity="0.18"/>\n`;
  }
  body += `  <rect x="588" y="220" width="16" height="500" fill="${PALETTE.gold}"/>\n`;
  body += `  <rect x="236" y="690" width="356" height="16" rx="6" fill="${PALETTE.navyDark}" opacity="0.6"/>\n`;
  body += stitchedMonogram(360, 330, 0.9, PALETTE.gold);
  body += `  <g transform="translate(640 180) rotate(24)">
    <rect x="0" y="0" width="34" height="420" rx="10" fill="${PALETTE.gold}"/>
    <rect x="0" y="0" width="34" height="60" rx="10" fill="#B08D4F"/>
    <path d="M6 420 L17 470 L28 420 Z" fill="${PALETTE.navyDark}"/>
    <rect x="6" y="70" width="22" height="10" fill="${PALETTE.navyDark}" opacity="0.5"/>
  </g>\n`;
  return productFrame(body, "F.M.I.E Hardcover Executive Notebook and Brass Pen Set");
}

function productMug() {
  let body = `  <path d="M300 280 H620 V620 Q620 700 540 700 H380 Q300 700 300 620 Z" fill="url(#cloth)"/>\n`;
  body += `  <ellipse cx="460" cy="284" rx="160" ry="42" fill="#FFFFFF"/>\n`;
  body += `  <ellipse cx="460" cy="286" rx="132" ry="32" fill="${PALETTE.paper}"/>\n`;
  body += `  <path d="M620 360 Q740 360 740 460 Q740 560 620 560" fill="none" stroke="${PALETTE.navy}" stroke-width="42" stroke-linecap="round"/>\n`;
  body += `  <path d="M300 620 Q460 660 620 620" stroke="${PALETTE.navyDark}" stroke-width="6" fill="none" opacity="0.5"/>\n`;
  body += stitchedMonogram(392, 400, 0.62, PALETTE.gold);
  body += `  <rect x="330" y="520" width="260" height="6" fill="${PALETTE.gold}" opacity="0.6"/>\n`;
  return productFrame(body, "F.M.I.E Matte Ceramic Executive Mug");
}

function productFolio() {
  let body = `  <rect x="180" y="240" width="540" height="420" rx="16" fill="url(#cloth)"/>\n`;
  body += `  <rect x="180" y="240" width="540" height="150" rx="16" fill="${PALETTE.navyDark}" opacity="0.55"/>\n`;
  body += `  <path d="M180 380 H720" stroke="${PALETTE.gold}" stroke-width="4" opacity="0.7"/>\n`;
  body += `  <rect x="220" y="420" width="200" height="14" rx="7" fill="${PALETTE.navyLight}" opacity="0.7"/>\n`;
  body += `  <rect x="220" y="452" width="140" height="14" rx="7" fill="${PALETTE.navyLight}" opacity="0.5"/>\n`;
  body += `  <path d="M330 240 Q330 150 450 150 Q570 150 570 240" fill="none" stroke="${PALETTE.navyDark}" stroke-width="26"/>\n`;
  body += `  <rect x="700" y="300" width="26" height="300" rx="10" fill="${PALETTE.navyDark}" opacity="0.6"/>\n`;
  body += `  <circle cx="713" cy="330" r="12" fill="${PALETTE.gold}"/>\n`;
  body += stitchedMonogram(380, 470, 0.72, PALETTE.goldSoft);
  body += `  <rect x="180" y="640" width="540" height="20" rx="8" fill="${PALETTE.navyDark}" opacity="0.5"/>\n`;
  return productFrame(body, "F.M.I.E Italian Leather Laptop Folio");
}

/* ---------------------------------------------------------------- */
/* Avatars                                                           */
/* ---------------------------------------------------------------- */

function initials(name) {
  return name
    .replace(/^(Dr\.|Mr\.|Ms\.)\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function avatarSvg(
  name,
  { background = PALETTE.navy, foreground = PALETTE.cream, accent = PALETTE.gold } = {},
) {
  const text = initials(name);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" role="img" aria-label="${name}">
  <defs>
    <linearGradient id="av" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${background}"/>
      <stop offset="100%" stop-color="${PALETTE.navyDark}"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="80" fill="url(#av)"/>
  <circle cx="80" cy="80" r="70" fill="none" stroke="${accent}" stroke-width="2" opacity="0.55"/>
  <text x="80" y="98" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-size="52" font-weight="600" letter-spacing="2" fill="${foreground}">${text}</text>
</svg>
`;
}

/* ---------------------------------------------------------------- */
/* Hero                                                              */
/* ---------------------------------------------------------------- */

function heroSvg() {
  let body = "";
  body += `  <circle cx="980" cy="300" r="260" fill="${PALETTE.navyLight}" opacity="0.18"/>\n`;
  body += `  <circle cx="980" cy="300" r="180" fill="${PALETTE.navy}" opacity="0.22"/>\n`;
  body += `  <circle cx="980" cy="300" r="96" fill="${PALETTE.gold}" opacity="0.9"/>\n`;
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2;
    const x = 980 + Math.cos(angle) * 300;
    const y = 300 + Math.sin(angle) * 300;
    body += `  <path d="M980 300 L${x.toFixed(1)} ${y.toFixed(1)}" stroke="${PALETTE.gold}" stroke-width="2" opacity="0.45"/>\n`;
    body += `  <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="${PALETTE.cream}" stroke="${PALETTE.gold}" stroke-width="3"/>\n`;
  }
  for (let i = 0; i < 5; i += 1) {
    body += `  <ellipse cx="980" cy="300" rx="${140 + i * 60}" ry="${60 + i * 26}" fill="none" stroke="${PALETTE.cream}" stroke-opacity="0.22" stroke-width="2"/>\n`;
  }
  body += `  <path d="M0 620 C 240 560 480 660 760 600 C 980 552 1180 610 1440 570" stroke="${PALETTE.gold}" stroke-width="4" fill="none" opacity="0.6"/>\n`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="720" viewBox="0 0 1440 720" role="img" aria-label="F.M.I.E global connectivity artwork">
  <defs>
    <linearGradient id="heroSky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${PALETTE.navyDark}"/>
      <stop offset="60%" stop-color="${PALETTE.navy}"/>
      <stop offset="100%" stop-color="${PALETTE.navyLight}"/>
    </linearGradient>
  </defs>
  <rect width="1440" height="720" fill="url(#heroSky)"/>
${body}
</svg>
`;
}

/* ---------------------------------------------------------------- */
/* Write everything                                                  */
/* ---------------------------------------------------------------- */

const covers = {
  "trade-corridors": coverCorridors,
  "sovereign-capital": coverCapital,
  "edge-compute": coverCompute,
  "cross-border": coverCrossBorder,
  governance: coverGovernance,
  "credit-markets": coverCredit,
  "travel-desk": coverTravelDesk,
  "gulf-horizon": coverGulf,
  "opinion-measurement": coverMeasurement,
  "commercial-dispatch": coverDispatch,
  "sponsored-research": coverSponsored,
};

const products = {
  polo: productPolo,
  hoodie: productHoodie,
  cap: productCap,
  notebook: productNotebook,
  mug: productMug,
  folio: productFolio,
};

const avatars = {
  guest: ["Guest Reader", { background: PALETTE.slate }],
  member: ["Registered Member", { background: PALETTE.navyLight }],
  "amara-okafor": ["Amara Okafor", {}],
  "marcus-vance": ["Marcus Vance", {}],
  "eleanor-whitcombe": ["Eleanor Whitcombe", {}],
  "daniel-achebe": ["Daniel Achebe", {}],
  "priya-raghunathan": ["Priya Raghunathan", {}],
  "tomasz-lis": ["Tomasz Lis", {}],
  "zainab-haruna": ["Zainab Haruna", { background: PALETTE.navyLight }],
  "marcus-bell": ["Marcus Bell", {}],
  "imogen-clarke": ["Imogen Clarke", { background: PALETTE.navyLight }],
  "rowan-devereux": ["Rowan Devereux", { background: PALETTE.slate }],
  "commercial-desk": [
    "Commercial Desk",
    { background: PALETTE.gold, foreground: PALETTE.navyDark, accent: PALETTE.navyDark },
  ],
};

let written = 0;

for (const [name, build] of Object.entries(covers)) {
  write(`covers/${name}.svg`, build());
  written += 1;
}

for (const [name, build] of Object.entries(products)) {
  write(`products/${name}.svg`, build());
  written += 1;
}

for (const [name, [label, options]] of Object.entries(avatars)) {
  write(`avatars/${name}.svg`, avatarSvg(label, options));
  written += 1;
}

write("hero.svg", heroSvg());
write("logo.svg", logoSvg({ fill: PALETTE.navy }));
write("logo-mark.svg", logoSvg({ width: 120, height: 104, fill: PALETTE.navy }));
write("src/assets/logo.svg", logoSvg({ fill: PALETTE.navy }));
written += 3;

console.log(`Generated ${written} F.M.I.E artwork files.`);
