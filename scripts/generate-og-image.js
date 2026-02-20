/**
 * Generates public/og-image.png (1200x630) for OG and Twitter cards.
 * Run: node scripts/generate-og-image.js
 * Requires: sharp (already in package.json)
 */
const fs = require("fs");
const path = require("path");

const W = 1200;
const H = 630;

const gradientStops = [
  { offset: "0%", color: "#2a1b3d" },
  { offset: "15%", color: "#44254a" },
  { offset: "28%", color: "#5e3352" },
  { offset: "40%", color: "#7a4058" },
  { offset: "50%", color: "#8f4d5c" },
  { offset: "62%", color: "#a66b62" },
  { offset: "75%", color: "#bf8a6e" },
  { offset: "88%", color: "#d4a67a" },
  { offset: "100%", color: "#e0bd8a" },
];

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      ${gradientStops.map((s) => `<stop offset="${s.offset}" stop-color="${s.color}"/>`).join("\n      ")}
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <text x="${W / 2}" y="280" text-anchor="middle" fill="#f0e8e0" font-family="Georgia, 'Times New Roman', serif" font-size="96" font-weight="400">Better Morning.</text>
  <text x="${W / 2}" y="380" text-anchor="middle" fill="rgba(240,232,224,0.85)" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="400">Own your first hour.</text>
  <text x="${W / 2}" y="430" text-anchor="middle" fill="rgba(240,232,224,0.6)" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="400">Read your principles. Follow your protocol. Name the one thing that matters.</text>
</svg>`;

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("Run: npm install sharp --save-dev");
    process.exit(1);
  }

  const root = path.join(__dirname, "..");
  const outPath = path.join(root, "public", "og-image.png");

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outPath);

  console.log("Written", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
