const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
fs.mkdirSync(output, { recursive: true });
const pages = [
  "index.html",
  "about.html",
  "buy-soybeans.html",
  "corn.html",
  "contact.html",
  "404.html",
];
for (const file of [
  ...pages,
  "styles.css",
  "script.js",
  "robots.txt",
  "sitemap.xml",
  "_headers",
]) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
fs.cpSync(path.join(root, "assets"), path.join(output, "assets"), {
  recursive: true,
  filter: (source) => !source.endsWith(".md"),
});
console.log("Built six static pages and assets in dist.");
