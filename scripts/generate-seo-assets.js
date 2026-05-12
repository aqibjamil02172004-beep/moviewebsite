const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const APP_FILE = path.join(ROOT, "public", "app.js");
const PUBLIC_DIR = path.join(ROOT, "public");
const SITE_URL = "https://flixdok.xyz";

function extractSeedTitles() {
  const app = fs.readFileSync(APP_FILE, "utf8");
  const start = app.indexOf("const SEED_TITLES = [");
  const end = app.indexOf("const els =", start);
  if (start < 0 || end < 0) throw new Error("Could not locate SEED_TITLES in public/app.js");

  const context = {
    console,
    TMDB_IMAGE: "https://image.tmdb.org/t/p",
    imageUrl(file, size = "w500") {
      if (!file) return "";
      if (/^https?:\/\//i.test(file)) return file;
      return `${this.TMDB_IMAGE}/${size}${file}`;
    },
  };
  vm.createContext(context);
  vm.runInContext(`${app.slice(start, end)};this.SEED_TITLES = SEED_TITLES;`, context);
  return context.SEED_TITLES || [];
}

function numericTmdbId(value) {
  const id = String(value || "").trim();
  return /^\d+$/.test(id) ? id : "";
}

function normalizeSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value) {
  return normalizeSearch(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titlePath(item) {
  const title = slugify(`${item.title || item.originalTitle || "title"} ${item.year || ""}`) || "title";
  return `/${item.type === "tv" ? "tv" : "movie"}/${title}/`;
}

function actorPath(name) {
  return `/actor/${slugify(name)}/`;
}

function xmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };
    return map[char];
  });
}

function writeRobots() {
  const robots = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
  fs.writeFileSync(path.join(PUBLIC_DIR, "robots.txt"), robots);
}

function writeSitemap(items) {
  const today = new Date().toISOString().slice(0, 10);
  const routes = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/movies/", priority: "0.8", changefreq: "daily" },
    { loc: "/tv-shows/", priority: "0.8", changefreq: "daily" },
    { loc: "/category/bollywood/", priority: "0.8", changefreq: "daily" },
    { loc: "/category/hollywood/", priority: "0.8", changefreq: "daily" },
    { loc: "/genre/action/", priority: "0.8", changefreq: "daily" },
    { loc: "/genre/comedy/", priority: "0.8", changefreq: "daily" },
    { loc: "/genre/anime/", priority: "0.8", changefreq: "daily" },
    { loc: "/actor/tom-cruise/", priority: "0.7", changefreq: "weekly" },
    ...items.map((item) => ({
      loc: titlePath(item),
      priority: "0.7",
      changefreq: "weekly",
    })),
    ...Array.from(
      new Set(
        items
          .flatMap((item) => item.cast || [])
          .slice(0, 25)
          .map(actorPath)
          .filter((route) => route !== "/actor//"),
      ),
    ).map((loc) => ({ loc, priority: "0.6", changefreq: "weekly" })),
  ];

  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${xmlEscape(`${SITE_URL}${route.loc}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
    )
    .join("\n");

  fs.writeFileSync(
    path.join(PUBLIC_DIR, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
  );
}

const items = extractSeedTitles();
writeRobots();
writeSitemap(items);
console.log(`Generated robots.txt and sitemap.xml with ${items.length} title URLs plus collection pages.`);
