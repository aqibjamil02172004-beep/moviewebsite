const SEARCH_TIMEOUT_MS = 4500;
const SEARCH_VARIANT_LIMIT = 18;

const CHARACTER_MAP = {
  "\u0131": "i",
  "\u0130": "i",
  "\u015f": "s",
  "\u015e": "s",
  "\u011f": "g",
  "\u011e": "g",
  "\u00fc": "u",
  "\u00dc": "u",
  "\u00f6": "o",
  "\u00d6": "o",
  "\u00e7": "c",
  "\u00c7": "c",
  "\u00e6": "ae",
  "\u00c6": "ae",
  "\u0153": "oe",
  "\u0152": "oe",
  "\u00f8": "o",
  "\u00d8": "o",
  "\u00e5": "a",
  "\u00c5": "a",
  "\u00f1": "n",
  "\u00d1": "n",
  "\u00df": "ss",
  "\u0111": "d",
  "\u0110": "d",
  "\u0142": "l",
  "\u0141": "l",
  "\u00fe": "th",
  "\u00de": "th",
  "\u00f0": "d",
  "\u00d0": "d",
};

function transliterate(value) {
  return String(value || "")
    .replace(
      /[\u0131\u0130\u015f\u015e\u011f\u011e\u00fc\u00dc\u00f6\u00d6\u00e7\u00c7\u00e6\u00c6\u0153\u0152\u00f8\u00d8\u00e5\u00c5\u00f1\u00d1\u00df\u0111\u0110\u0142\u0141\u00fe\u00de\u00f0\u00d0]/g,
      (char) => CHARACTER_MAP[char] || char,
    )
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeSearch(value) {
  return transliterate(value).replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeCompact(value) {
  return normalizeSearch(value).replace(/\s+/g, "");
}

function slugify(value) {
  return transliterate(value).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function collapseRepeatedCharacters(value) {
  return String(value || "").replace(/(.)\1+/g, "$1");
}

function relaxedCompact(value) {
  return collapseRepeatedCharacters(
    normalizeCompact(value)
      .replace(/ph/g, "f")
      .replace(/ck/g, "k")
      .replace(/qu/g, "kw")
      .replace(/[cq]/g, "k")
      .replace(/[vw]/g, "v")
      .replace(/x/g, "ks")
      .replace(/z/g, "s"),
  );
}

function spellingAlternates(value) {
  const compact = normalizeCompact(value);
  if (!compact) return [];
  const alternates = new Set([compact, relaxedCompact(compact), collapseRepeatedCharacters(compact)]);
  const replacements = [
    [/aa/g, "a"],
    [/ee/g, "i"],
    [/oo/g, "u"],
    [/ou/g, "u"],
    [/w/g, "v"],
    [/v/g, "w"],
    [/ph/g, "f"],
    [/f/g, "ph"],
    [/q/g, "k"],
    [/c/g, "k"],
    [/z/g, "j"],
    [/j/g, "z"],
  ];
  for (const [pattern, replacement] of replacements) {
    const replaced = compact.replace(pattern, replacement);
    if (replaced !== compact) alternates.add(replaced);
  }
  return Array.from(alternates).filter((variant) => variant.length >= 2);
}

function levenshteinDistance(a, b, limit = 4) {
  if (a === b) return 0;
  if (!a || !b) return Math.max(a.length, b.length);
  if (Math.abs(a.length - b.length) > limit) return limit + 1;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = current[0];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      current[j] = value;
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > limit) return limit + 1;
    previous = current;
  }
  return previous[b.length];
}

function queryVariants(query) {
  const raw = String(query || "").trim();
  const normalized = normalizeSearch(raw);
  const compact = normalizeCompact(raw);
  const dotted = /^[a-z0-9]{2,10}$/.test(compact) ? compact.split("").join(".") : "";
  const variants = [raw, normalized, compact, dotted, relaxedCompact(raw), ...spellingAlternates(raw)];

  normalized.split(" ").filter(Boolean).forEach((token) => {
    variants.push(token, ...spellingAlternates(token));
  });

  if (compact.length >= 5) variants.push(compact.slice(0, -1));
  if (compact.endsWith("l")) variants.push(`${compact}i`);
  if (compact.endsWith("i")) variants.push(compact.slice(0, -1));
  if (compact.includes("kgf")) variants.push(compact.replace(/kgf/g, "k.g.f"));

  return Array.from(new Set(variants.map(slugify).filter((variant) => variant.length >= 2))).slice(0, SEARCH_VARIANT_LIMIT);
}

function suggestionScore(item, query) {
  const title = item?.l || "";
  const queryCompact = normalizeCompact(query);
  const titleCompact = normalizeCompact(title);
  const queryRelaxed = relaxedCompact(query);
  const titleRelaxed = relaxedCompact(title);
  if (!queryCompact || !titleCompact) return 0;

  let score = 0;
  if (titleCompact === queryCompact) score += 500;
  else if (titleRelaxed === queryRelaxed) score += 460;
  else if (titleCompact.startsWith(queryCompact)) score += 340;
  else if (titleRelaxed.startsWith(queryRelaxed)) score += 300;
  else if (titleCompact.includes(queryCompact)) score += 230;
  else if (titleRelaxed.includes(queryRelaxed)) score += 200;

  const distance = levenshteinDistance(titleRelaxed, queryRelaxed, 4);
  if (distance <= 1) score += 210;
  else if (distance === 2) score += 160;
  else if (distance === 3) score += 100;

  if (item?.rank) score += Math.max(0, 80 - Math.log10(Number(item.rank) || 1) * 12);
  if (item?.i?.imageUrl) score += 20;
  if (item?.y) score += 8;
  return score;
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
    .sort((a, b) => suggestionScore(b, query) - suggestionScore(a, query))
    .slice(0, 80);

  response.status(200).json({ q: query, d: merged });
};
