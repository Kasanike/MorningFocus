/**
 * Generates icon-192.png and icon-512.png from public/favicon.svg for PWA.
 * Run: node scripts/generate-pwa-icons.js
 * Requires: npm install sharp (dev)
 */
const fs = require("fs");
const path = require("path");

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("Run: npm install sharp --save-dev");
    process.exit(1);
  }

  const root = path.join(__dirname, "..");
  const svgPath = path.join(root, "public", "favicon.svg");
  const svg = fs.readFileSync(svgPath);

  for (const size of [192, 512]) {
    const out = path.join(root, "public", `icon-${size}.png`);
    await sharp(svg).resize(size, size).png().toFile(out);
    console.log("Written", out);
  }

  console.log("Done. Add-to-home-screen should now show the app icon.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
