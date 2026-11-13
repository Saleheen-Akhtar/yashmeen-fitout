// Scripts to enforce design system locks:
// 1. Zero em-dashes (—) or en-dashes (–) in user-facing JSX/HTML copy
// 2. Maximum of 2 font families (Plus Jakarta Sans, Cormorant Garamond)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(here, "..");
const srcDir = path.join(rootDir, "src");

let errors = [];

function checkFileForDashes(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  lines.forEach((line, idx) => {
    // Ignore comments, imports, or test regex literals
    if (line.trim().startsWith("//") || line.trim().startsWith("/*") || line.includes("em-dash") || line.includes("en-dash") || line.includes("\\u2014") || line.includes("\\u2013")) {
      return;
    }
    if (line.includes("\u2014")) {
      errors.push(`[em-dash] ${path.relative(rootDir, filePath)}:${idx + 1} contains illegal em-dash (—). Use a standard hyphen or colon.`);
    }
    if (line.includes("\u2013")) {
      errors.push(`[en-dash] ${path.relative(rootDir, filePath)}:${idx + 1} contains illegal en-dash (–). Use a standard hyphen or colon.`);
    }
  });
}

function walkDir(dir, filter, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== "dist" && entry.name !== ".git") {
        walkDir(fullPath, filter, callback);
      }
    } else if (filter(entry.name)) {
      callback(fullPath);
    }
  }
}

// 1. Check all user-facing JSX and JS files
walkDir(srcDir, (f) => f.endsWith(".jsx") || (f.endsWith(".js") && !f.includes(".test.")), (file) => {
  checkFileForDashes(file);
});

// 2. Check font families in CSS
const ALLOWED_FONTS = [
  "plus jakarta sans",
  "cormorant garamond",
  "system-ui",
  "-apple-system",
  "blinkmacsystemfont",
  "segoe ui",
  "roboto",
  "sans-serif",
  "georgia",
  "serif",
  "monospace",
  "inherit",
  "initial",
  "var(--",
];
walkDir(path.join(srcDir, "styles"), (f) => f.endsWith(".css"), (file) => {
  const content = fs.readFileSync(file, "utf8");
  const fontMatches = content.matchAll(/font-family:\s*([^;]+);/gi);
  for (const match of fontMatches) {
    const declared = match[1].toLowerCase();
    const parts = declared.split(",").map((s) => s.trim().replace(/['"]/g, ""));
    for (const part of parts) {
      if (!ALLOWED_FONTS.some((allowed) => part.includes(allowed))) {
        errors.push(`[font-lock] ${path.relative(rootDir, file)} declares unauthorized font: "${part}". Only Plus Jakarta Sans & Cormorant Garamond are permitted.`);
      }
    }
  }
});

if (errors.length > 0) {
  console.error(`\n❌ Design locks validation failed (${errors.length} violations):\n`);
  errors.forEach((err) => console.error("  " + err));
  process.exit(1);
} else {
  console.log("✅ Design locks verified: 0 em/en-dashes, strict font-family compliance.");
  process.exit(0);
}
