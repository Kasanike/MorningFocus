#!/usr/bin/env node
/**
 * Copy the app icon to public folder for PWA / Add to Home Screen.
 * Run: node scripts/copy-icon.js
 *
 * Update SOURCE below if your icon is in a different location.
 */
const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const publicDir = path.join(projectRoot, "public");

// Try multiple possible locations for the icon (new glassmorphism logo first)
const possibleSources = [
  path.join(projectRoot, "assets", "c__Users_jkasa_AppData_Roaming_Cursor_User_workspaceStorage_ff5cc0e9b01c5ab0fffdfb2d12cac920_images_MorningFocusLogo-9be482cb-209c-43d5-a49c-1d3b73178ac1.png"),
  path.join(process.env.USERPROFILE || "", ".cursor", "projects", "d-Pracovn-plocha-Cursor-VIBECODING-Morning-focus", "assets", "c__Users_jkasa_AppData_Roaming_Cursor_User_workspaceStorage_ff5cc0e9b01c5ab0fffdfb2d12cac920_images_MorningFocusLogo-9be482cb-209c-43d5-a49c-1d3b73178ac1.png"),
  path.join(projectRoot, "assets", "c__Users_jkasa_AppData_Roaming_Cursor_User_workspaceStorage_ff5cc0e9b01c5ab0fffdfb2d12cac920_images_Gemini_Generated_Image_q0fr2jq0fr2jq0fr-6d9f6206-4b9c-4aea-a9e6-833a68bbfbc6.png"),
  path.join(process.env.USERPROFILE || "", ".cursor", "projects", "d-Pracovn-plocha-Cursor-VIBECODING-Morning-focus", "assets", "c__Users_jkasa_AppData_Roaming_Cursor_User_workspaceStorage_ff5cc0e9b01c5ab0fffdfb2d12cac920_images_Gemini_Generated_Image_q0fr2jq0fr2jq0fr-6d9f6206-4b9c-4aea-a9e6-833a68bbfbc6.png"),
];

const SOURCE = possibleSources.find((p) => fs.existsSync(p));

if (!SOURCE) {
  console.error("Icon not found. Searched:");
  possibleSources.forEach((p) => console.error("  -", p));
  console.error("Copy your icon manually to public/icon-192.png, icon-512.png, apple-icon.png");
  process.exit(1);
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const destFiles = ["icon-192.png", "icon-512.png", "apple-icon.png"];
for (const file of destFiles) {
  fs.copyFileSync(SOURCE, path.join(publicDir, file));
  console.log("Copied to public/" + file);
}
