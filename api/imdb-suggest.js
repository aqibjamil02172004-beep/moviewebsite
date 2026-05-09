const SEARCH_TIMEOUT_MS = 4500;

const CHARACTER_MAP = {
  ı: "i",
  İ: "i",
  ş: "s",
  Ş: "s",
  ğ: "g",
  Ğ: "g",
  ü: "u",
  Ü: "u",
  ö: "o",
  Ö: "o",
  ç: "c",
  Ç: "c",
  æ: "ae",
  Æ: "ae",
  ø: "o",
  Ø: "o",
  å: "a",
  Å: "a",
  ñ: "n",
  Ñ: "n",
  ß: "ss",
};

function transliterate(value) {
  return String(value || "")
    .replace(/[ıİşŞğĞüÜöÖçÇæÆøØåÅñÑß]/g, (char) => CHARACTER_MAP[char] || char)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function slugify(value) {
  return transliterate(value).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function queryVariants(query) {
  const raw = String(query || "").trim();
  const normalized = transliterate(raw).replace(/[^a-z0-9]+/g, " ").trim();
  const compact = normalized.replace(/\s+/g, "");
  const dotted = /^[a-z0-9]{2,10}$/.test(compact) ? compact.split("").join(".") : "";
  const variants = [raw, normalized, compact, dotted];

  if (compact.length >= 5) variants.push(compact.slice(0, -1));
  if (compact.endsWith("l")) variants.push(`${compact}i`);
  if (compact.includes("kgf")) variants.push(compact.replace(/kgf/g, "k.g.f"));

  return Array.from(new Set(variants.map(slugify).filter((variant) => variant.length >= 2))).slice(0, 8);
}

async function fetchSuggestion(slug) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);
  const upstream = `https://v3.sg.media-imdb.com/suggestion/${encodeURIComponent(slug[0] || "a")}/${encodeURIComponent(slug)}.json`;

  try {
    const upstreamResponse = await fetch(upstream, {
      signal: controller.signal,
      headers: {
        accept: "application/json",
        "user-agent": "FlixDok Vercel search",
      },
    });
    if (!upstreamResponse.ok) return [];
    const data = await upstreamResponse.json();
    return data.d || [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = async function handler(request, response) {
  const query = String(request.query?.q || "").trim();

  response.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=86400");

  if (!query || query.length < 2) {
    response.status(200).json({ d: [] });
    return;
  }

  const variants = queryVariants(query);
  const results = await Promise.all(variants.map(fetchSuggestion));
  const seen = new Set();
  const merged = results
    .flat()
    .filter((item) => {
      if (!item?.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 80);

  response.status(200).json({ q: query, d: merged });
};
