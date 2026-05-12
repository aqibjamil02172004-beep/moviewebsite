const fs = require("fs");
const path = require("path");

const APP_NAME = "FlixDok";
const SITE_URL = "https://flixdok.xyz";
const TMDB_PROXY = "https://db.videasy.net/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p";
const DEFAULT_IMAGE = `${TMDB_IMAGE}/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg`;
const DEFAULT_DESCRIPTION =
  "Search movies and TV shows on FlixDok with ratings, posters, watchlists, progress tracking, and episode selection.";
const DEFAULT_KEYWORDS =
  "FlixDok, movies, TV shows, watch movies, movie ratings, episode guide, Bollywood movies, Hollywood movies, streaming search, watchlist";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[char];
  });
}

function imageUrl(file, size = "original") {
  if (!file) return "";
  if (/^https?:\/\//i.test(file)) return file;
  return `${TMDB_IMAGE}/${size}${file}`;
}

function mediaTitle(data, type) {
  return type === "tv" ? data.name || data.original_name : data.title || data.original_title;
}

function mediaDate(data, type) {
  return type === "tv" ? data.first_air_date || "" : data.release_date || "";
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

function titleCaseFromSlug(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function titleSlugFromData(data, type) {
  const title = mediaTitle(data, type) || "title";
  const year = String(mediaDate(data, type)).slice(0, 4);
  return slugify(`${title}${year ? ` ${year}` : ""}`);
}

function queryFromSlug(slug) {
  return String(slug || "")
    .replace(/\/+$/, "")
    .replace(/-\d{4}$/, "")
    .replace(/-/g, " ")
    .trim();
}

function compactDescription(value, fallback = DEFAULT_DESCRIPTION) {
  const text = String(value || fallback).replace(/\s+/g, " ").trim();
  if (text.length <= 160) return text;
  return `${text.slice(0, 157).replace(/\s+\S*$/, "")}...`;
}

function uniqueValues(values) {
  return Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)));
}

function seoKeywords(values) {
  return uniqueValues(values)
    .slice(0, 18)
    .join(", ");
}

function cleanPath(value = "/") {
  const pathValue = String(value || "/");
  return pathValue.endsWith("/") ? pathValue : `${pathValue}/`;
}

function absoluteUrl(route = "/") {
  if (/^https?:\/\//i.test(route)) return route;
  return `${SITE_URL}${route.startsWith("/") ? route : `/${route}`}`;
}

function readIndex() {
  const candidates = [
    path.join(process.cwd(), "public", "index.html"),
    path.join(__dirname, "..", "public", "index.html"),
  ];
  for (const file of candidates) {
    try {
      return fs.readFileSync(file, "utf8");
    } catch {
      // Try the next runtime path.
    }
  }
  return '<!doctype html><html lang="en"><head><base href="/"><title>FlixDok</title><link rel="stylesheet" href="/styles.css"></head><body><div id="homeScreen"></div><script src="/app.js?v=20260512-platform" defer></script></body></html>';
}

function replaceOrInsert(html, matcher, tag) {
  if (matcher.test(html)) return html.replace(matcher, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function applySeo(html, seo) {
  const title = escapeHtml(seo.title || APP_NAME);
  const description = escapeHtml(seo.description || DEFAULT_DESCRIPTION);
  const keywords = escapeHtml(seo.keywords || DEFAULT_KEYWORDS);
  const url = escapeHtml(seo.url || SITE_URL);
  const image = escapeHtml(seo.image || DEFAULT_IMAGE);
  const type = escapeHtml(seo.type || "website");
  const jsonLd = JSON.stringify(seo.structuredData || {}).replace(/</g, "\\u003c");

  let output = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  output = replaceOrInsert(output, /<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${description}" />`);
  output = replaceOrInsert(output, /<meta\s+name="keywords"[^>]*>/i, `<meta name="keywords" content="${keywords}" />`);
  output = replaceOrInsert(output, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${url}" />`);
  output = replaceOrInsert(output, /<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${title}" />`);
  output = replaceOrInsert(output, /<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${description}" />`);
  output = replaceOrInsert(output, /<meta\s+property="og:type"[^>]*>/i, `<meta property="og:type" content="${type}" />`);
  output = replaceOrInsert(output, /<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${url}" />`);
  output = replaceOrInsert(output, /<meta\s+property="og:image"[^>]*>/i, `<meta property="og:image" content="${image}" />`);
  output = replaceOrInsert(output, /<meta\s+name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${title}" />`);
  output = replaceOrInsert(output, /<meta\s+name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${description}" />`);
  output = replaceOrInsert(output, /<meta\s+name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${image}" />`);
  output = replaceOrInsert(
    output,
    /<script\s+id="structuredData"\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script id="structuredData" type="application/ld+json">${jsonLd}</script>`,
  );
  return output;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) return null;
  return response.json();
}

function pickSearchMatch(type, slug, results = []) {
  const query = normalizeSearch(queryFromSlug(slug));
  const year = String(slug || "").match(/-(\d{4})$/)?.[1] || "";
  return [...results]
    .map((item) => {
      const title = mediaTitle(item, type);
      const itemYear = String(mediaDate(item, type)).slice(0, 4);
      const titleKey = normalizeSearch(title);
      let score = Number(item.popularity || 0);
      if (titleKey === query) score += 100;
      if (titleKey.startsWith(query)) score += 35;
      if (titleKey.includes(query)) score += 18;
      if (year && itemYear === year) score += 45;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.item;
}

function pickFindMatch(type, data) {
  const results = type === "tv" ? data?.tv_results || [] : data?.movie_results || [];
  return [...results].sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0))[0] || null;
}

async function resolveImdbToTmdb(type, imdbId) {
  const url = new URL(`${TMDB_PROXY}/find/${encodeURIComponent(imdbId)}`);
  url.searchParams.set("external_source", "imdb_id");
  const data = await fetchJson(url.toString());
  const match = pickFindMatch(type, data);
  return match?.id ? String(match.id) : "";
}

function buildTitleSeo(type, tmdbId, data, routeOverride = "") {
  if (!data) return null;
  const isTv = type === "tv";
  const title = mediaTitle(data, type);
  if (!title) return null;
  const year = String(mediaDate(data, type)).slice(0, 4);
  const mediaLabel = isTv ? "TV Show" : "Movie";
  const route = routeOverride || cleanPath(`/${isTv ? "tv" : "movie"}/${titleSlugFromData(data, type)}`);
  const description = compactDescription(data.overview, `Watch ${title} on ${APP_NAME}. View ratings, posters, cast, recommendations, and ${isTv ? "episode guides" : "movie details"}.`);
  const image = imageUrl(data.backdrop_path || data.poster_path, "original") || DEFAULT_IMAGE;
  const poster = imageUrl(data.poster_path, "w500") || image;
  const genres = (data.genres || []).map((genre) => genre.name).filter(Boolean);
  const keywords = seoKeywords([
    title,
    data.original_title,
    data.original_name,
    mediaLabel,
    year,
    ...genres,
    "watch online",
    "ratings",
    "cast",
    "trailer",
    APP_NAME,
  ]);

  return {
    title: `${title} (${year || mediaLabel}) - Watch ${mediaLabel} on ${APP_NAME}`,
    description,
    keywords,
    url: absoluteUrl(route),
    image,
    type: "video.other",
    structuredData: {
      "@context": "https://schema.org",
      "@type": isTv ? "TVSeries" : "Movie",
      name: title,
      url: absoluteUrl(route),
      image: poster,
      description,
      datePublished: year || undefined,
      genre: genres,
      aggregateRating: data.vote_average
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(data.vote_average).toFixed(1),
            bestRating: "10",
          }
        : undefined,
      potentialAction: {
        "@type": "WatchAction",
        target: absoluteUrl(route),
      },
      identifier: tmdbId ? `tmdb:${tmdbId}` : undefined,
    },
  };
}

async function fetchTitleSeo(id) {
  const value = String(id || "").replace(/\/+$/, "");
  const numericMatch = value.match(/^(movie|tv)-(\d+)$/);
  const imdbMatch = value.match(/^(movie|tv)-(tt\d+)$/i);
  const type = numericMatch?.[1] || imdbMatch?.[1];
  let tmdbId = numericMatch?.[2] || "";

  if (!type) return null;
  if (!tmdbId && imdbMatch) tmdbId = await resolveImdbToTmdb(type, imdbMatch[2]);
  if (!tmdbId) return null;

  const data = await fetchJson(`${TMDB_PROXY}/${type}/${tmdbId}`);
  return buildTitleSeo(type, tmdbId, data, cleanPath(`/title/${type}-${tmdbId}`));
}

async function fetchSlugSeo(type, slug) {
  const cleanSlug = String(slug || "").replace(/\/+$/, "");
  const query = queryFromSlug(cleanSlug);
  if (!query || (type !== "movie" && type !== "tv")) return null;
  const searchUrl = new URL(`${TMDB_PROXY}/search/${type}`);
  searchUrl.searchParams.set("query", query);
  const searchData = await fetchJson(searchUrl.toString());
  const match = pickSearchMatch(type, cleanSlug, searchData?.results || []);
  if (!match?.id) return null;
  const data = await fetchJson(`${TMDB_PROXY}/${type}/${match.id}`);
  return buildTitleSeo(type, String(match.id), data, cleanPath(`/${type === "tv" ? "tv" : "movie"}/${cleanSlug}`));
}

async function fetchActorSeo(slug) {
  const actorName = titleCaseFromSlug(String(slug || "").replace(/\/+$/, ""));
  if (!actorName) return null;
  const searchUrl = new URL(`${TMDB_PROXY}/search/person`);
  searchUrl.searchParams.set("query", actorName);
  const searchData = await fetchJson(searchUrl.toString());
  const person =
    (searchData?.results || []).find((entry) => normalizeSearch(entry.name) === normalizeSearch(actorName)) ||
    searchData?.results?.[0] ||
    null;
  const name = person?.name || actorName;
  const image = imageUrl(person?.profile_path, "w500") || DEFAULT_IMAGE;
  const route = cleanPath(`/actor/${slug}`);
  return {
    title: `${name} Movies & Shows - ${APP_NAME}`,
    description: `Browse ${name} movies and TV shows on ${APP_NAME} with ratings, posters, cast links, similar titles, and recommendations.`,
    keywords: seoKeywords([name, `${name} movies`, `${name} TV shows`, "filmography", "actor movies", "cast", "ratings", APP_NAME]),
    url: absoluteUrl(route),
    image,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${name} Movies & Shows`,
      about: { "@type": "Person", name },
      url: absoluteUrl(route),
    },
  };
}

function staticSeo(route, value = "") {
  const routeMap = {
    movies: {
      title: `Movies - ${APP_NAME}`,
      description: `Browse movies on ${APP_NAME} with ratings, posters, watchlists, and search.`,
      keywords: seoKeywords(["movies", "watch movies", "movie ratings", "Hollywood movies", "Bollywood movies", APP_NAME]),
      url: absoluteUrl("/movies/"),
    },
    tv: {
      title: `TV Shows - ${APP_NAME}`,
      description: `Browse TV shows on ${APP_NAME} with seasons, episodes, ratings, posters, and search.`,
      keywords: seoKeywords(["TV shows", "series", "episodes", "seasons", "episode guide", "watch TV shows", APP_NAME]),
      url: absoluteUrl("/tv-shows/"),
    },
    watchlist: {
      title: `Watchlist - ${APP_NAME}`,
      description: `Your local ${APP_NAME} watchlist and continue watching progress.`,
      keywords: seoKeywords(["watchlist", "continue watching", "movie progress", "TV progress", APP_NAME]),
      url: absoluteUrl("/watchlist/"),
    },
  };

  if (route === "category") {
    const category = String(value || "").replace(/\/+$/, "");
    const label = category === "hollywood" ? "Hollywood Movies" : "Bollywood Movies";
    return {
      title: `${label} - ${APP_NAME}`,
      description: `Browse ${label.toLowerCase()} on ${APP_NAME} with ratings, posters, filters, and watchlist support.`,
      keywords: seoKeywords([label, category, "movies", "ratings", "posters", APP_NAME]),
      url: absoluteUrl(`/category/${category || "bollywood"}/`),
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: label,
        url: absoluteUrl(`/category/${category || "bollywood"}/`),
      },
    };
  }

  if (route === "genre") {
    const slug = String(value || "").replace(/\/+$/, "");
    const label = `${titleCaseFromSlug(slug || "action")} Movies`;
    return {
      title: `${label} - ${APP_NAME}`,
      description: `Browse ${label.toLowerCase()} on ${APP_NAME} with ratings, posters, filters, recommendations, and watchlist support.`,
      keywords: seoKeywords([label, slug, "movies", "genre", "ratings", "recommendations", APP_NAME]),
      url: absoluteUrl(`/genre/${slug || "action"}/`),
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: label,
        url: absoluteUrl(`/genre/${slug || "action"}/`),
      },
    };
  }

  if (route === "actor") {
    const slug = String(value || "").replace(/\/+$/, "");
    const label = titleCaseFromSlug(slug || "actor");
    return {
      title: `${label} Movies & Shows - ${APP_NAME}`,
      description: `Browse ${label} movies and TV shows on ${APP_NAME} with ratings, posters, cast links, and recommendations.`,
      keywords: seoKeywords([label, "actor", "filmography", "movies", "TV shows", "cast", APP_NAME]),
      url: absoluteUrl(`/actor/${slug}/`),
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${label} Movies & Shows`,
        about: { "@type": "Person", name: label },
        url: absoluteUrl(`/actor/${slug}/`),
      },
    };
  }

  return routeMap[route] || {
    title: APP_NAME,
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
    url: absoluteUrl("/"),
  };
}

module.exports = async function handler(request, response) {
  const index = readIndex();
  const route = String(request.query?.route || "");
  let seo = null;

  if (route === "title") {
    try {
      seo = await fetchTitleSeo(request.query?.id);
    } catch {
      seo = null;
    }
  }

  if (route === "movie" || route === "tvslug") {
    try {
      seo = await fetchSlugSeo(route === "movie" ? "movie" : "tv", request.query?.slug);
    } catch {
      seo = null;
    }
  }

  if (route === "actor") {
    try {
      seo = await fetchActorSeo(request.query?.slug);
    } catch {
      seo = null;
    }
  }

  if (!seo) seo = staticSeo(route, request.query?.category || request.query?.slug);
  seo = {
    image: DEFAULT_IMAGE,
    type: "website",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: APP_NAME,
      url: SITE_URL,
    },
    ...seo,
  };

  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  response.status(200).send(applySeo(index, seo));
};
