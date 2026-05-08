"use strict";

const APP_NAME = "FlixDok";
const STORAGE_KEY = "flixdok.profile.v1";
const LEGACY_STORAGE_KEY = "mushfiq.profile.v1";
const TMDB_API = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p";
const TVMAZE_API = "https://api.tvmaze.com";
const WIKIDATA_API = "https://www.wikidata.org/w/api.php";
const WIKIMEDIA_FILE = "https://commons.wikimedia.org/wiki/Special:FilePath/";
const OMDB_API = "https://www.omdbapi.com/";
const AGREGARR_API = "https://api.agregarr.org/api/ratings";
const VIDKING_BASE = "https://www.vidking.net/embed";

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const DEFAULT_PROFILE = {
  name: APP_NAME,
  accent: "#d8b15f",
  tmdbKey: "",
  omdbKey: "",
  playerColor: "d8b15f",
  autoPlay: true,
  episodeSelector: true,
  nextEpisode: true,
  watchlist: [],
  continueWatching: [],
};

const IMDB_TO_TMDB = {
  tt0903747: 1396,
  tt0944947: 1399,
  tt4574334: 66732,
  tt3581920: 100088,
  tt7366338: 87108,
  tt2861424: 60625,
  tt2085059: 42009,
  tt1475582: 19885,
};

const SEED_TITLES = [
  {
    type: "movie",
    tmdbId: 693134,
    imdbId: "tt15239678",
    title: "Dune: Part Two",
    year: "2024",
    genres: ["Sci-Fi", "Adventure"],
    rating: 8.1,
    runtime: "2h 47m",
    poster: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop: "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    overview:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
  },
  {
    type: "movie",
    tmdbId: 872585,
    imdbId: "tt15398776",
    title: "Oppenheimer",
    year: "2023",
    genres: ["Drama", "History"],
    rating: 8.1,
    runtime: "3h 1m",
    poster: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop: "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    overview:
      "The story of J. Robert Oppenheimer and the scientific gamble that changed the shape of the twentieth century.",
  },
  {
    type: "movie",
    tmdbId: 414906,
    imdbId: "tt1877830",
    title: "The Batman",
    year: "2022",
    genres: ["Crime", "Mystery"],
    rating: 7.7,
    runtime: "2h 57m",
    poster: "/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    backdrop: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    overview:
      "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues.",
  },
  {
    type: "movie",
    tmdbId: 157336,
    imdbId: "tt0816692",
    title: "Interstellar",
    year: "2014",
    genres: ["Sci-Fi", "Drama"],
    rating: 8.4,
    runtime: "2h 49m",
    poster: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop: "/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    overview:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
  },
  {
    type: "movie",
    tmdbId: 569094,
    imdbId: "tt9362722",
    title: "Spider-Man: Across the Spider-Verse",
    year: "2023",
    genres: ["Animation", "Action"],
    rating: 8.3,
    runtime: "2h 20m",
    poster: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    backdrop: "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    overview:
      "Miles Morales catapults across the multiverse, where he encounters a team of Spider-People protecting its existence.",
  },
  {
    type: "movie",
    tmdbId: 361743,
    imdbId: "tt1745960",
    title: "Top Gun: Maverick",
    year: "2022",
    genres: ["Action", "Drama"],
    rating: 8.2,
    runtime: "2h 11m",
    poster: "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    backdrop: "/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg",
    overview:
      "After more than thirty years of service, Maverick trains a new detachment of graduates for a dangerous mission.",
  },
  {
    type: "movie",
    tmdbId: 155,
    imdbId: "tt0468569",
    title: "The Dark Knight",
    year: "2008",
    genres: ["Action", "Crime"],
    rating: 8.5,
    runtime: "2h 32m",
    poster: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    overview:
      "Batman, Gordon, and Harvey Dent are forced to deal with an agent of chaos who wants Gotham to burn.",
  },
  {
    type: "movie",
    tmdbId: 545611,
    imdbId: "tt6710474",
    title: "Everything Everywhere All at Once",
    year: "2022",
    genres: ["Action", "Comedy"],
    rating: 7.8,
    runtime: "2h 20m",
    poster: "/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    backdrop: "/ss0Os3uWJfQAENILHZUdX8Tt1OC.jpg",
    overview:
      "An exhausted laundromat owner discovers that only she can save existence by connecting with lives she could have led.",
  },
  {
    type: "tv",
    tmdbId: 1396,
    tvmazeId: 169,
    imdbId: "tt0903747",
    title: "Breaking Bad",
    year: "2008",
    genres: ["Crime", "Drama"],
    rating: 8.9,
    runtime: "47m",
    poster: "/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg",
    backdrop: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    seasons: [
      { number: 1, episodes: 7 },
      { number: 2, episodes: 13 },
      { number: 3, episodes: 13 },
      { number: 4, episodes: 13 },
      { number: 5, episodes: 16 },
    ],
    overview:
      "A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine with a former student.",
  },
  {
    type: "tv",
    tmdbId: 1399,
    tvmazeId: 82,
    imdbId: "tt0944947",
    title: "Game of Thrones",
    year: "2011",
    genres: ["Drama", "Fantasy"],
    rating: 8.4,
    runtime: "1h",
    poster: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    backdrop: "/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    seasons: [
      { number: 1, episodes: 10 },
      { number: 2, episodes: 10 },
      { number: 3, episodes: 10 },
      { number: 4, episodes: 10 },
      { number: 5, episodes: 10 },
      { number: 6, episodes: 10 },
      { number: 7, episodes: 7 },
      { number: 8, episodes: 6 },
    ],
    overview:
      "Noble families fight for control of the Iron Throne while an ancient enemy rises beyond the Wall.",
  },
  {
    type: "tv",
    tmdbId: 100088,
    tvmazeId: 46562,
    imdbId: "tt3581920",
    title: "The Last of Us",
    year: "2023",
    genres: ["Drama", "Adventure"],
    rating: 8.5,
    runtime: "59m",
    poster: "/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    backdrop: "/aDYSnJAK0BTVeE8osOy22Kz3SXY.jpg",
    seasons: [
      { number: 1, episodes: 9 },
      { number: 2, episodes: 7 },
    ],
    overview:
      "A hardened survivor escorts a teenager across a fractured America after a global pandemic collapses civilization.",
  },
  {
    type: "tv",
    tmdbId: 66732,
    tvmazeId: 2993,
    imdbId: "tt4574334",
    title: "Stranger Things",
    year: "2016",
    genres: ["Sci-Fi", "Mystery"],
    rating: 8.6,
    runtime: "52m",
    poster: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdrop: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    seasons: [
      { number: 1, episodes: 8 },
      { number: 2, episodes: 9 },
      { number: 3, episodes: 8 },
      { number: 4, episodes: 9 },
      { number: 5, episodes: 8 },
    ],
    overview:
      "When a young boy vanishes, a small town uncovers secret experiments, supernatural forces, and one strange little girl.",
  },
  {
    type: "tv",
    tmdbId: 87108,
    tvmazeId: 41803,
    imdbId: "tt7366338",
    title: "Chernobyl",
    year: "2019",
    genres: ["Drama", "History"],
    rating: 8.7,
    runtime: "1h 5m",
    poster: "/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg",
    backdrop: "/900tHlUYUkp7Ol04XFSoAaEIXcT.jpg",
    seasons: [{ number: 1, episodes: 5 }],
    overview:
      "The story of the 1986 nuclear disaster and the people who sacrificed everything to expose the truth.",
  },
  {
    type: "tv",
    tmdbId: 60625,
    tvmazeId: 216,
    imdbId: "tt2861424",
    title: "Rick and Morty",
    year: "2013",
    genres: ["Animation", "Comedy"],
    rating: 8.7,
    runtime: "23m",
    poster: "/gdIrmf2DdY5mgN6ycVP0XlzKzbE.jpg",
    backdrop: "/8kOWDBK6XlPUzckuHDo3wwVRFwt.jpg",
    seasons: [
      { number: 1, episodes: 11 },
      { number: 2, episodes: 10 },
      { number: 3, episodes: 10 },
      { number: 4, episodes: 10 },
      { number: 5, episodes: 10 },
      { number: 6, episodes: 10 },
      { number: 7, episodes: 10 },
    ],
    overview:
      "A sociopathic scientist drags his anxious grandson across dangerous interdimensional adventures.",
  },
];

const els = {
  hero: document.getElementById("hero"),
  posterGrid: document.getElementById("posterGrid"),
  detailPanel: document.getElementById("detailPanel"),
  searchInput: document.getElementById("searchInput"),
  clearSearch: document.getElementById("clearSearch"),
  sectionTitle: document.getElementById("sectionTitle"),
  eyebrow: document.getElementById("eyebrow"),
  resultCount: document.getElementById("resultCount"),
  emptyState: document.getElementById("emptyState"),
  continueRow: document.getElementById("continueRow"),
  continueStrip: document.getElementById("continueStrip"),
  clearContinue: document.getElementById("clearContinue"),
  profileButton: document.getElementById("profileButton"),
  profileName: document.getElementById("profileName"),
  profileAvatar: document.getElementById("profileAvatar"),
  settingsButton: document.getElementById("settingsButton"),
  settingsModal: document.getElementById("settingsModal"),
  settingsForm: document.getElementById("settingsForm"),
  nameInput: document.getElementById("nameInput"),
  accentInput: document.getElementById("accentInput"),
  tmdbInput: document.getElementById("tmdbInput"),
  omdbInput: document.getElementById("omdbInput"),
  playerColorInput: document.getElementById("playerColorInput"),
  autoPlayInput: document.getElementById("autoPlayInput"),
  episodeSelectorInput: document.getElementById("episodeSelectorInput"),
  nextEpisodeInput: document.getElementById("nextEpisodeInput"),
  resetProfile: document.getElementById("resetProfile"),
  playerOverlay: document.getElementById("playerOverlay"),
  playerFrame: document.getElementById("playerFrame"),
  playerTitle: document.getElementById("playerTitle"),
  playerMeta: document.getElementById("playerMeta"),
  playerControls: document.getElementById("playerControls"),
  closePlayer: document.getElementById("closePlayer"),
};

const state = {
  profile: loadProfile(),
  items: SEED_TITLES.map(normalizeSeed),
  selected: null,
  filter: "all",
  view: "home",
  query: "",
  isSearching: false,
  currentSeason: 1,
  currentEpisode: 1,
  activePlayerId: "",
  searchToken: 0,
  detailToken: 0,
  detailLoadingId: "",
};

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY) || "null");
    const profile = { ...DEFAULT_PROFILE, ...(saved || {}) };
    if (!saved || saved.name === "Mushfiq") profile.name = APP_NAME;
    return profile;
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

function saveProfile() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.profile));
}

function normalizeSeed(item) {
  return {
    ...item,
    id: `${item.type}-${item.tmdbId}`,
    posterUrl: imageUrl(item.poster, "w500"),
    backdropUrl: imageUrl(item.backdrop, "original"),
    source: APP_NAME,
  };
}

function imageUrl(path, size = "w500") {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${TMDB_IMAGE}/${size}${path}`;
}

function scoreLabel(item) {
  const imdbRating = item.imdbRating || item.omdbRating;
  const rating = imdbRating || item.rating;
  if (!rating) return "New";
  return Number(rating).toFixed(1);
}

function itemYear(item) {
  return item.year || "Unknown";
}

function mediaLabel(type) {
  return type === "tv" ? "TV Show" : "Movie";
}

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[char];
  });
}

function normalizeSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeCompact(value) {
  return normalizeSearch(value).replace(/\s+/g, "");
}

function searchForms(value) {
  const normalized = normalizeSearch(value);
  const compact = normalizeCompact(value);
  return Array.from(new Set([normalized, compact].filter(Boolean)));
}

function queryMatchesItem(item, query) {
  const queryForms = searchForms(query);
  if (!queryForms.length) return true;
  const values = [item.title, item.year, item.type, item.source, item.imdbId, item.tmdbId, ...(item.genres || [])];
  const haystacks = searchForms(values.join(" "));
  return queryForms.some((form) => {
    if (haystacks.some((haystack) => haystack.includes(form))) return true;
    const tokens = normalizeSearch(form).split(" ").filter(Boolean);
    return tokens.length > 1 && tokens.every((token) => haystacks.some((haystack) => haystack.includes(token)));
  });
}

function searchQueryVariants(query) {
  const normalized = normalizeSearch(query);
  const compact = normalizeCompact(query);
  const variants = [query.trim(), normalized, compact];
  if (/^[a-z0-9]{2,8}$/i.test(compact)) {
    variants.push(compact.split("").join("."));
  }
  return Array.from(new Set(variants.filter(Boolean)));
}

function usesPosterArtwork(item) {
  if (!item?.posterUrl) return false;
  if (!item.backdropUrl || item.backdropUrl === item.posterUrl) return true;
  return item.source === "IMDb" || item.source === "Wikidata";
}

function debounce(fn, wait = 350) {
  let timeout;
  return (...args) => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), wait);
  };
}

function itemDisplayId(item) {
  if (item.tmdbId) return `${item.type}-${item.tmdbId}`;
  if (item.imdbId) return `${item.type}-${item.imdbId}`;
  if (item.wikidataId) return `${item.type}-${item.wikidataId}`;
  if (item.tvmazeId) return `${item.type}-tvmaze-${item.tvmazeId}`;
  return `${item.type}-${normalizeSearch(item.title)}-${item.year || "unknown"}`;
}

function itemAliases(item) {
  return [
    item.tmdbId ? `${item.type}:tmdb:${item.tmdbId}` : "",
    item.imdbId ? `${item.type}:imdb:${item.imdbId}` : "",
    item.wikidataId ? `${item.type}:wikidata:${item.wikidataId}` : "",
    item.tvmazeId ? `${item.type}:tvmaze:${item.tvmazeId}` : "",
    item.title ? `${item.type}:title:${normalizeSearch(item.title)}:${item.year || ""}` : "",
  ].filter(Boolean);
}

function mergeItemData(existing, incoming) {
  if (!existing) return { ...incoming, id: itemDisplayId(incoming) };
  const merged = { ...existing, ...incoming };
  ["tmdbId", "posterUrl", "backdropUrl", "overview", "runtime", "imdbId", "wikidataId", "tvmazeId", "source"].forEach((key) => {
    merged[key] = incoming[key] || existing[key] || "";
  });
  ["genres", "cast", "seasons", "episodes"].forEach((key) => {
    merged[key] = incoming[key]?.length ? incoming[key] : existing[key] || [];
  });
  merged.rating = incoming.rating || existing.rating || null;
  merged.imdbRating = incoming.imdbRating || existing.imdbRating || null;
  merged.omdbRating = incoming.omdbRating || existing.omdbRating || null;
  merged.searchRank = Math.min(incoming.searchRank ?? 9999, existing.searchRank ?? 9999);
  merged.id = itemDisplayId(merged);
  return merged;
}

function mergeItems(...lists) {
  const map = new Map();
  const aliases = new Map();
  lists.flat().forEach((item) => {
    if (!item || !item.title) return;
    const itemWithId = { ...item, id: item.id || itemDisplayId(item) };
    const keys = itemAliases(itemWithId);
    const existingKey = keys.map((key) => aliases.get(key)).find(Boolean);
    const primaryKey = existingKey || itemWithId.id;
    const merged = mergeItemData(map.get(primaryKey), itemWithId);
    const nextKey = merged.id;
    if (nextKey !== primaryKey) map.delete(primaryKey);
    map.set(nextKey, merged);
    itemAliases(merged).forEach((key) => aliases.set(key, nextKey));
  });
  return Array.from(map.values());
}

function getVisibleItems() {
  const query = state.query.trim();
  let items = state.items;

  if (state.view === "watchlist") {
    const saved = new Set(state.profile.watchlist);
    items = items.filter((item) => saved.has(item.id));
  } else if (state.view === "movie" || state.view === "tv") {
    items = items.filter((item) => item.type === state.view);
  }

  if (state.filter !== "all") {
    items = items.filter((item) => item.type === state.filter);
  }

  if (query) {
    items = items.filter((item) => queryMatchesItem(item, query));
  }

  return items;
}

function applyTheme() {
  document.documentElement.style.setProperty("--accent", state.profile.accent || DEFAULT_PROFILE.accent);
  els.profileName.textContent = state.profile.name || APP_NAME;
  els.profileAvatar.textContent = (state.profile.name || APP_NAME).trim().slice(0, 1).toUpperCase();
}

function render() {
  applyTheme();

  const visible = getVisibleItems();
  if (!state.selected || !visible.some((item) => item.id === state.selected.id)) {
    state.selected = visible[0] || state.items[0] || null;
  }

  renderHero(state.selected);
  renderGrid(visible);
  renderDetail(state.selected);
  renderContinue();
  renderHeadings(visible.length);

  els.hero.classList.toggle("is-search-mode", Boolean(state.query));
  els.hero.classList.toggle("is-poster-art", usesPosterArtwork(state.selected));
  els.clearSearch.classList.toggle("is-visible", Boolean(state.query));
  els.emptyState.hidden = true;
}

function renderHeadings(count) {
  const titleMap = {
    home: state.query ? "Search results" : `Featured on ${APP_NAME}`,
    movie: state.query ? "Movie results" : "Movies",
    tv: state.query ? "TV results" : "TV Shows",
    watchlist: "Your watchlist",
  };
  els.sectionTitle.textContent = titleMap[state.view] || `Featured on ${APP_NAME}`;
  els.eyebrow.textContent = state.isSearching ? "Searching" : state.query ? "Search results" : "Ready to watch";
  els.resultCount.textContent = `${count} ${count === 1 ? "title" : "titles"}`;
}

function renderHero(item) {
  if (!item) {
    els.hero.innerHTML = "";
    return;
  }

  const heroImage = usesPosterArtwork(item) ? item.posterUrl : item.backdropUrl || item.posterUrl;
  els.hero.style.setProperty("--hero-image", `url("${heroImage}")`);
  const genres = (item.genres || []).slice(0, 3);
  const canPlay = Boolean(item.tmdbId);
  els.hero.innerHTML = `
    <div class="hero-inner">
      <p class="kicker">${safeText(mediaLabel(item.type))}</p>
      <h2>${safeText(item.title)}</h2>
      <p class="hero-overview">${safeText(item.overview || "No overview is available yet.")}</p>
      <div class="meta-row">
        <span class="rating-pill">Rating ${safeText(scoreLabel(item))}</span>
        <span class="pill">${safeText(itemYear(item))}</span>
        ${genres.map((genre) => `<span class="pill">${safeText(genre)}</span>`).join("")}
      </div>
      <div class="hero-actions">
        <button class="primary-button" type="button" data-action="play" data-id="${safeText(item.id)}" ${canPlay ? "" : "disabled"}>
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          ${canPlay ? "Play" : "Needs ID"}
        </button>
        <button class="secondary-button" type="button" data-action="toggle-watchlist" data-id="${safeText(item.id)}">
          <svg viewBox="0 0 24 24"><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21z"/></svg>
          ${isWatchlisted(item) ? "Saved" : "Watchlist"}
        </button>
      </div>
    </div>
  `;
}

function renderGrid(items) {
  const isSearch = Boolean(state.query);
  els.posterGrid.classList.toggle("search-results", isSearch);
  els.posterGrid.innerHTML = items
    .map(
      (item) => {
        const status = item.tmdbId ? "Vidking ready" : "Needs TMDB ID";
        const source = item.source || APP_NAME;
        const progress = playbackProgress(item);
        return `
      <button class="poster-card ${isSearch ? "search-card" : ""} ${state.selected?.id === item.id ? "is-selected" : ""}" type="button" data-action="select" data-id="${safeText(item.id)}">
        <span class="poster-art">
          ${item.posterUrl ? `<img src="${safeText(item.posterUrl)}" alt="${safeText(item.title)} poster" loading="lazy" />` : ""}
          <span class="poster-badge">${safeText(scoreLabel(item))}</span>
        </span>
        <span class="card-body">
          <h3>${safeText(item.title)}</h3>
          <span class="card-meta">
            <span>${safeText(itemYear(item))}</span>
            <span>${safeText(mediaLabel(item.type))}</span>
            ${isSearch ? `<span>${safeText(source)}</span>` : ""}
          </span>
          ${isSearch ? `<span class="result-status ${item.tmdbId ? "is-ready" : ""}">${safeText(status)}</span>` : ""}
          ${isSearch && item.overview ? `<span class="card-overview">${safeText(item.overview)}</span>` : ""}
          ${progress ? progressMarkup(progress, "card-progress") : ""}
        </span>
      </button>
    `;
      },
    )
    .join("");
}

function renderDetail(item) {
  if (!item) {
    els.detailPanel.innerHTML = `<div class="panel-empty">Select a title</div>`;
    return;
  }

  const watchText = isWatchlisted(item) ? "Saved" : "Add to Watchlist";
  const canPlay = Boolean(item.tmdbId);
  const episodeModel = getEpisodeModel(item);
  const season = episodeModel.find((entry) => entry.number === state.currentSeason) || episodeModel[0];
  const selectedSeason = season?.number || 1;
  const episodeOptions = season ? season.episodes : [];
  const selectedEpisode = episodeOptions.some((episode) => episode.number === state.currentEpisode)
    ? state.currentEpisode
    : episodeOptions[0]?.number || 1;
  const seasonCount = episodeModel.length;
  const episodeCount = episodeModel.reduce((total, entry) => total + entry.episodes.length, 0);
  const isLoadingEpisodes = state.detailLoadingId === item.id && item.type === "tv";
  const people = (item.cast || []).slice(0, 8);
  const ratings = [
    item.rating ? `TMDB ${Number(item.rating).toFixed(1)}` : "",
    item.imdbRating ? `IMDb ${Number(item.imdbRating).toFixed(1)}` : "",
    item.omdbRating ? `OMDb ${item.omdbRating}` : "",
  ].filter(Boolean);

  els.detailPanel.innerHTML = `
    <div class="panel-poster ${usesPosterArtwork(item) ? "is-poster" : ""}">
      ${item.backdropUrl || item.posterUrl ? `<img src="${safeText(usesPosterArtwork(item) ? item.posterUrl : item.backdropUrl || item.posterUrl)}" alt="${safeText(item.title)} artwork" />` : ""}
    </div>
    <h2>${safeText(item.title)}</h2>
    <div class="panel-meta">
      <span>${safeText(mediaLabel(item.type))}</span>
      <span>${safeText(itemYear(item))}</span>
      ${item.runtime ? `<span>${safeText(item.runtime)}</span>` : ""}
    </div>
    <div class="rating-row">
      ${ratings.length ? ratings.map((rating) => `<span class="rating-pill">${safeText(rating)}</span>`).join("") : `<span class="rating-pill">Rating ${safeText(scoreLabel(item))}</span>`}
    </div>
    <p class="overview">${safeText(item.overview || "No overview is available yet.")}</p>
    <div class="hero-actions">
      <button class="primary-button" type="button" data-action="play" data-id="${safeText(item.id)}" ${canPlay ? "" : "disabled"}>
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        Play
      </button>
      <button class="secondary-button" type="button" data-action="toggle-watchlist" data-id="${safeText(item.id)}">
        ${safeText(watchText)}
      </button>
    </div>
    ${
      item.type === "tv"
        ? `
      <div class="panel-section">
        <div class="panel-section-head">
          <h3>Episodes</h3>
          <span>${safeText(`${seasonCount} ${seasonCount === 1 ? "season" : "seasons"}`)}</span>
        </div>
        ${
          canPlay
            ? `
          <p class="episode-summary ${isLoadingEpisodes ? "is-refreshing" : ""}">
            ${safeText(isLoadingEpisodes ? "Checking latest season list..." : `${seasonCount} ${seasonCount === 1 ? "season" : "seasons"} / ${episodeCount} ${episodeCount === 1 ? "episode" : "episodes"}`)}
          </p>
          <div class="episode-grid">
            <label>
              <span>Season</span>
              <select id="seasonSelect">
                ${episodeModel.map((entry) => `<option value="${entry.number}" ${entry.number === selectedSeason ? "selected" : ""}>Season ${entry.number}</option>`).join("")}
              </select>
            </label>
            <label>
              <span>Episode</span>
              <select id="episodeSelect">
                ${episodeOptions.map((ep) => `<option value="${ep.number}" ${ep.number === selectedEpisode ? "selected" : ""}>Episode ${ep.number}${ep.name ? ` - ${safeText(ep.name)}` : ""}</option>`).join("")}
              </select>
            </label>
          </div>
        `
            : `
          <p class="manual-help">This TVmaze result needs a TMDB show ID before Vidking can play it.</p>
          <div class="manual-id">
            <input id="manualTmdbInput" inputmode="numeric" placeholder="TMDB show ID" />
            <button class="chip-button" type="button" data-action="attach-tmdb" data-id="${safeText(item.id)}">Use ID</button>
          </div>
        `
        }
      </div>
    `
        : ""
    }
    ${
      people.length
        ? `
      <div class="panel-section">
        <h3>Cast</h3>
        <div class="cast-list">${people.map((person) => `<span>${safeText(person)}</span>`).join("")}</div>
      </div>
    `
        : ""
    }
  `;

  const seasonSelect = document.getElementById("seasonSelect");
  const episodeSelect = document.getElementById("episodeSelect");
  if (seasonSelect) {
    seasonSelect.addEventListener("change", () => {
      state.currentSeason = Number(seasonSelect.value);
      const nextSeason = getEpisodeModel(item).find((entry) => entry.number === state.currentSeason);
      state.currentEpisode = nextSeason?.episodes?.[0]?.number || 1;
      renderDetail(item);
    });
  }
  if (episodeSelect) {
    episodeSelect.addEventListener("change", () => {
      state.currentEpisode = Number(episodeSelect.value);
      renderDetail(item);
    });
  }
}

function renderContinue() {
  const entries = state.profile.continueWatching
    .map((entry) => ({ entry, item: findItem(entry.id) }))
    .filter(({ item }) => item)
    .slice(0, 8);

  els.continueRow.hidden = entries.length === 0;
  els.continueStrip.innerHTML = entries
    .map(({ entry, item }) => {
      const meta = item.type === "tv" ? `S${entry.season || 1} E${entry.episode || 1}` : "Movie";
      const progress = playbackProgress(item, entry);
      return `
        <button class="mini-card" type="button" data-action="play-continue" data-id="${safeText(item.id)}">
          ${item.posterUrl ? `<img src="${safeText(item.posterUrl)}" alt="${safeText(item.title)} poster" loading="lazy" />` : "<span></span>"}
          <span class="mini-copy">
            <strong>${safeText(item.title)}</strong>
            <span class="mini-meta">${safeText(meta)} &middot; ${safeText(itemYear(item))}</span>
            ${progress ? progressMarkup(progress, "mini-progress") : ""}
          </span>
        </button>
      `;
    })
    .join("");
}

function continueEntryFor(itemOrId) {
  const id = typeof itemOrId === "string" ? itemOrId : itemOrId?.id;
  return state.profile.continueWatching.find((entry) => entry.id === id);
}

function progressMarkup(progress, className = "") {
  return `
    <span class="watch-progress ${className}">
      <span class="watch-progress-line">
        <strong>${safeText(progress.label)}</strong>
        <span>${safeText(progress.detail)}</span>
      </span>
      <span class="progress-track" aria-label="${progress.percent}% watched">
        <span class="progress-fill" style="width: ${progress.percent}%"></span>
      </span>
    </span>
  `;
}

function playbackProgress(item, entry = continueEntryFor(item)) {
  if (!item || !entry) return null;
  const savedPercent = clampPercent(entry.progressPercent);

  if (Number.isFinite(savedPercent) && savedPercent > 0) {
    const timeDetail =
      Number.isFinite(entry.currentTime) && Number.isFinite(entry.duration) && entry.duration > 0
        ? `${formatTime(entry.currentTime)} / ${formatTime(entry.duration)}`
        : `${savedPercent}% watched`;
    return {
      percent: savedPercent,
      label: item.type === "tv" ? `S${entry.season || 1} E${entry.episode || 1}` : "Movie",
      detail: timeDetail,
    };
  }

  if (item.type !== "tv") {
    return {
      percent: 6,
      label: "Started",
      detail: "Resume movie",
    };
  }

  const model = getEpisodeModel(item);
  const seasonNumber = Number(entry.season || 1);
  const episodeNumber = Number(entry.episode || 1);
  const totalEpisodes = model.reduce((total, season) => total + season.episodes.length, 0);
  let previousEpisodes = 0;
  for (const season of model) {
    if (season.number >= seasonNumber) break;
    previousEpisodes += season.episodes.length;
  }

  const currentSeason = model.find((season) => season.number === seasonNumber);
  const foundIndex = currentSeason?.episodes.findIndex((episode) => episode.number === episodeNumber) ?? -1;
  const episodeIndex = foundIndex >= 0 ? foundIndex + 1 : Math.max(1, episodeNumber);
  const currentPosition = totalEpisodes ? Math.min(totalEpisodes, previousEpisodes + episodeIndex) : 1;
  const percent = totalEpisodes ? clampPercent((currentPosition / totalEpisodes) * 100) : 1;

  return {
    percent: Math.max(1, percent),
    label: `S${seasonNumber} E${episodeNumber}`,
    detail: totalEpisodes ? `${currentPosition}/${totalEpisodes} episodes` : "Resume show",
  };
}

function clampPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return NaN;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function formatTime(seconds) {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(totalSeconds / 60);
  const remaining = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function getEpisodeModel(item) {
  if (item?.episodes?.length) {
    const grouped = new Map();
    item.episodes.forEach((episode) => {
      if (!grouped.has(episode.season)) grouped.set(episode.season, []);
      grouped.get(episode.season).push({
        number: episode.number,
        name: episode.name,
      });
    });
    return Array.from(grouped.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([number, episodes]) => ({
        number,
        episodes: episodes.sort((a, b) => a.number - b.number),
      }));
  }

  if (item?.seasons?.length) {
    return item.seasons
      .filter((season) => season.number > 0 && season.episodes > 0)
      .map((season) => ({
        number: season.number,
        episodes: Array.from({ length: season.episodes }, (_, index) => ({
          number: index + 1,
          name: "",
        })),
      }));
  }

  return [{ number: 1, episodes: Array.from({ length: 8 }, (_, index) => ({ number: index + 1, name: "" })) }];
}

function findItem(id) {
  return state.items.find((item) => item.id === id);
}

function isWatchlisted(item) {
  return state.profile.watchlist.includes(item.id);
}

function toggleWatchlist(item) {
  if (!item) return;
  const saved = new Set(state.profile.watchlist);
  if (saved.has(item.id)) saved.delete(item.id);
  else saved.add(item.id);
  state.profile.watchlist = Array.from(saved);
  saveProfile();
  render();
}

function rememberPlay(item, season = state.currentSeason, episode = state.currentEpisode) {
  updateContinueEntry(item, {
    season,
    episode,
    resetProgress: true,
  });
}

function updateContinueEntry(item, updates = {}) {
  if (!item) return;
  const previous = continueEntryFor(item) || {};
  const sameEpisode =
    item.type !== "tv" ||
    (Number(previous.season || 1) === Number(updates.season || previous.season || 1) &&
      Number(previous.episode || 1) === Number(updates.episode || previous.episode || 1));
  const progressPercent = updates.resetProgress && !sameEpisode ? null : updates.progressPercent ?? previous.progressPercent ?? null;
  const currentTime = updates.resetProgress && !sameEpisode ? null : updates.currentTime ?? previous.currentTime ?? null;
  const duration = updates.resetProgress && !sameEpisode ? null : updates.duration ?? previous.duration ?? null;
  const next = state.profile.continueWatching.filter((entry) => entry.id !== item.id);

  next.unshift({
    id: item.id,
    season: item.type === "tv" ? updates.season ?? previous.season ?? state.currentSeason : null,
    episode: item.type === "tv" ? updates.episode ?? previous.episode ?? state.currentEpisode : null,
    progressPercent,
    currentTime,
    duration,
    updatedAt: Date.now(),
  });
  state.profile.continueWatching = next.slice(0, 12);
  saveProfile();
}

function cleanHex(value, fallback = "d8b15f") {
  const hex = String(value || "").replace(/[^0-9a-f]/gi, "").slice(0, 6);
  return hex.length === 6 ? hex.toLowerCase() : fallback;
}

function buildVidkingUrl(item, season = 1, episode = 1) {
  const base =
    item.type === "tv"
      ? `${VIDKING_BASE}/tv/${encodeURIComponent(item.tmdbId)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`
      : `${VIDKING_BASE}/movie/${encodeURIComponent(item.tmdbId)}`;

  const params = new URLSearchParams();
  params.set("color", cleanHex(state.profile.playerColor));
  if (state.profile.autoPlay) params.set("autoPlay", "true");
  if (item.type === "tv" && state.profile.nextEpisode) params.set("nextEpisode", "true");
  if (item.type === "tv") params.set("episodeSelector", "true");
  return `${base}?${params.toString()}`;
}

function currentEpisodeName(item, season, episode) {
  const seasonModel = getEpisodeModel(item).find((entry) => entry.number === Number(season));
  const episodeModel = seasonModel?.episodes?.find((entry) => entry.number === Number(episode));
  return episodeModel?.name || "";
}

function syncPlayerLabels(item, season = state.currentSeason, episode = state.currentEpisode) {
  if (!item) return;
  els.playerTitle.textContent = item.title;
  const episodeName = item.type === "tv" ? currentEpisodeName(item, season, episode) : "";
  els.playerMeta.textContent =
    item.type === "tv"
      ? `Season ${season}, Episode ${episode}${episodeName ? ` - ${episodeName}` : ""}`
      : `${itemYear(item)} movie`;
  const seasonSelect = els.playerControls.querySelector('select[aria-label="Season"]');
  const episodeSelect = els.playerControls.querySelector('select[aria-label="Episode"]');
  if (seasonSelect) seasonSelect.value = String(season);
  if (episodeSelect) episodeSelect.value = String(episode);
}

function playItem(item, opts = {}) {
  if (!item) return;
  if (!item.tmdbId) {
    renderDetail(item);
    return;
  }

  const season = item.type === "tv" ? opts.season || state.currentSeason || 1 : 1;
  const episode = item.type === "tv" ? opts.episode || state.currentEpisode || 1 : 1;
  state.currentSeason = season;
  state.currentEpisode = episode;
  state.activePlayerId = item.id;

  const url = buildVidkingUrl(item, season, episode);
  syncPlayerLabels(item, season, episode);
  els.playerFrame.src = url;
  els.playerOverlay.hidden = false;
  renderPlayerControls(item);
  rememberPlay(item, season, episode);
  renderContinue();

  const requestFullscreen = els.playerOverlay.requestFullscreen || els.playerOverlay.webkitRequestFullscreen;
  if (requestFullscreen) {
    requestFullscreen.call(els.playerOverlay).catch?.(() => {});
  }
}

function renderPlayerControls(item) {
  els.playerControls.innerHTML = "";
  if (item.type !== "tv") return;

  const model = getEpisodeModel(item);
  const season = model.find((entry) => entry.number === state.currentSeason) || model[0];
  const seasonSelect = document.createElement("select");
  seasonSelect.setAttribute("aria-label", "Season");
  seasonSelect.innerHTML = model
    .map((entry) => `<option value="${entry.number}" ${entry.number === state.currentSeason ? "selected" : ""}>Season ${entry.number}</option>`)
    .join("");

  const episodeSelect = document.createElement("select");
  episodeSelect.setAttribute("aria-label", "Episode");
  episodeSelect.innerHTML = (season?.episodes || [])
    .map((ep) => `<option value="${ep.number}" ${ep.number === state.currentEpisode ? "selected" : ""}>Episode ${ep.number}</option>`)
    .join("");

  seasonSelect.addEventListener("change", () => {
    state.currentSeason = Number(seasonSelect.value);
    state.currentEpisode = getEpisodeModel(item).find((entry) => entry.number === state.currentSeason)?.episodes?.[0]?.number || 1;
    syncPlayerLabels(item, state.currentSeason, state.currentEpisode);
    playItem(item, { season: state.currentSeason, episode: state.currentEpisode });
  });

  episodeSelect.addEventListener("change", () => {
    state.currentEpisode = Number(episodeSelect.value);
    syncPlayerLabels(item, state.currentSeason, state.currentEpisode);
    playItem(item, { season: state.currentSeason, episode: state.currentEpisode });
  });

  els.playerControls.append(seasonSelect, episodeSelect);
}

function closePlayer() {
  els.playerOverlay.hidden = true;
  els.playerFrame.src = "about:blank";
  state.activePlayerId = "";
  if (document.fullscreenElement) {
    document.exitFullscreen().catch?.(() => {});
  }
}

function parsePlayerMessage(data) {
  if (!data) return null;
  const payload = typeof data === "string" ? (() => {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  })() : data;
  if (!payload || typeof payload !== "object") return null;

  const candidates = [payload, payload.data, payload.detail, payload.progress, payload.media, payload.episode].filter(Boolean);
  const parsed = {};
  for (const candidate of candidates) {
    if (typeof candidate === "number") {
      parsed.progressPercent = clampPercent(candidate <= 1 ? candidate * 100 : candidate);
      continue;
    }
    if (!candidate || typeof candidate !== "object") continue;

    const season = Number(candidate.season ?? candidate.s ?? candidate.seasonNumber);
    const episode = Number(candidate.episode ?? candidate.e ?? candidate.episodeNumber);
    if (Number.isFinite(season) && season > 0 && Number.isFinite(episode) && episode > 0) {
      parsed.season = season;
      parsed.episode = episode;
    }

    const currentTime = Number(candidate.currentTime ?? candidate.current ?? candidate.position ?? candidate.elapsed ?? candidate.seconds);
    const duration = Number(candidate.duration ?? candidate.totalDuration ?? candidate.total ?? candidate.length);
    const progressValue = Number(candidate.percent ?? candidate.percentage ?? candidate.progressPercent);
    if (Number.isFinite(progressValue)) {
      parsed.progressPercent = clampPercent(progressValue <= 1 ? progressValue * 100 : progressValue);
    } else if (Number.isFinite(currentTime) && Number.isFinite(duration) && duration > 0) {
      parsed.progressPercent = clampPercent((currentTime / duration) * 100);
    }
    if (Number.isFinite(currentTime) && currentTime >= 0) parsed.currentTime = currentTime;
    if (Number.isFinite(duration) && duration > 0) parsed.duration = duration;
  }
  return Object.keys(parsed).length ? parsed : null;
}

function handlePlayerMessage(event) {
  if (els.playerOverlay.hidden || event.source !== els.playerFrame.contentWindow) return;
  const update = parsePlayerMessage(event.data);
  const activeItem = findItem(state.activePlayerId) || state.selected;
  if (!update || !activeItem) return;
  if (activeItem.type === "tv" && update.season && update.episode) {
    state.currentSeason = update.season;
    state.currentEpisode = update.episode;
    syncPlayerLabels(activeItem, update.season, update.episode);
  }
  updateContinueEntry(activeItem, {
    season: activeItem.type === "tv" ? update.season || state.currentSeason : null,
    episode: activeItem.type === "tv" ? update.episode || state.currentEpisode : null,
    progressPercent: update.progressPercent,
    currentTime: update.currentTime,
    duration: update.duration,
  });
  renderContinue();
}

async function hydrateHome() {
  state.items = SEED_TITLES.map(normalizeSeed);
  if (!state.profile.tmdbKey) {
    render();
    enrichRatings(state.items);
    return;
  }

  try {
    const [trendingMovies, trendingMoviesPage2, trendingTv, trendingTvPage2] = await Promise.all([
      tmdbFetch("/trending/movie/week", { page: "1" }),
      tmdbFetch("/trending/movie/week", { page: "2" }),
      tmdbFetch("/trending/tv/week", { page: "1" }),
      tmdbFetch("/trending/tv/week", { page: "2" }),
    ]);
    const liveItems = [
      ...(trendingMovies.results || []).map((item) => normalizeTmdbItem(item, "movie")),
      ...(trendingMoviesPage2.results || []).map((item) => normalizeTmdbItem(item, "movie")),
      ...(trendingTv.results || []).map((item) => normalizeTmdbItem(item, "tv")),
      ...(trendingTvPage2.results || []).map((item) => normalizeTmdbItem(item, "tv")),
    ];
    state.items = mergeItems(SEED_TITLES.map(normalizeSeed), liveItems);
    state.selected = state.items[0];
    render();
    enrichRatings(state.items);
  } catch (error) {
    console.warn("TMDB home load failed", error);
    render();
  }
}

async function tmdbFetch(path, params = {}) {
  if (!state.profile.tmdbKey) throw new Error("TMDB key is not configured.");
  const url = new URL(`${TMDB_API}${path}`);
  url.searchParams.set("api_key", state.profile.tmdbKey.trim());
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  });
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`TMDB request failed: ${response.status}`);
  return response.json();
}

function normalizeTmdbItem(item, explicitType) {
  const type = explicitType || item.media_type;
  const isTv = type === "tv";
  const date = isTv ? item.first_air_date : item.release_date;
  return {
    id: `${isTv ? "tv" : "movie"}-${item.id}`,
    type: isTv ? "tv" : "movie",
    tmdbId: item.id,
    title: isTv ? item.name : item.title,
    year: date ? date.slice(0, 4) : "",
    genres: [],
    rating: item.vote_average || null,
    poster: item.poster_path,
    backdrop: item.backdrop_path,
    posterUrl: imageUrl(item.poster_path, "w500"),
    backdropUrl: imageUrl(item.backdrop_path || item.poster_path, "original"),
    overview: item.overview || "",
    source: "TMDB",
  };
}

async function tmdbSearchPages(query) {
  if (!state.profile.tmdbKey) return [];
  const pages = [1, 2, 3];
  const results = await Promise.all(
    pages.map((page) =>
      tmdbFetch("/search/multi", {
        query,
        include_adult: "false",
        page: String(page),
      }).catch(() => ({ results: [] })),
    ),
  );
  return results
    .flatMap((data) => data.results || [])
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .map((item, index) => ({ ...normalizeTmdbItem(item), searchRank: index }));
}

function normalizeTvMazeResult(result) {
  const show = result.show || result;
  const imdbId = show.externals?.imdb || "";
  const tmdbId = imdbId ? IMDB_TO_TMDB[imdbId] : null;
  const image = show.image?.original || show.image?.medium || "";
  return {
    id: tmdbId ? `tv-${tmdbId}` : `tvmaze-${show.id}`,
    type: "tv",
    tmdbId,
    tvmazeId: show.id,
    imdbId,
    title: show.name,
    year: show.premiered ? show.premiered.slice(0, 4) : "",
    genres: show.genres || [],
    rating: show.rating?.average || null,
    runtime: show.averageRuntime ? `${show.averageRuntime}m` : "",
    posterUrl: image,
    backdropUrl: image,
    overview: stripTags(show.summary || ""),
    source: "TVmaze",
  };
}

function claimValues(entity, property) {
  return (entity.claims?.[property] || [])
    .map((claim) => claim.mainsnak?.datavalue?.value)
    .filter((value) => value !== undefined && value !== null);
}

function claimString(entity, property) {
  const value = claimValues(entity, property)[0];
  return typeof value === "string" ? value : "";
}

function claimYear(entity, ...properties) {
  for (const property of properties) {
    const value = claimValues(entity, property)[0];
    const time = typeof value === "object" ? value?.time : "";
    const match = String(time).match(/[+-](\d{4})/);
    if (match) return match[1];
  }
  return "";
}

function wikimediaImageUrl(fileName, width = 500) {
  if (!fileName) return "";
  return `${WIKIMEDIA_FILE}${encodeURIComponent(fileName)}?width=${width}`;
}

function normalizeWikidataEntity(entity, preferredType, searchRank = 999) {
  if (!entity) return null;
  const movieId = claimString(entity, "P4947");
  const tvId = claimString(entity, "P4983");
  const type = preferredType || (movieId ? "movie" : "tv");
  const tmdbId = type === "movie" ? movieId : tvId;
  const image = claimString(entity, "P18");

  if (!tmdbId) return null;

  return {
    id: `${type}-${tmdbId}`,
    type,
    tmdbId,
    wikidataId: entity.id,
    imdbId: claimString(entity, "P345"),
    title: entity.labels?.en?.value || "",
    year: claimYear(entity, "P577", "P580", "P571"),
    genres: [],
    rating: null,
    posterUrl: wikimediaImageUrl(image, 500),
    backdropUrl: wikimediaImageUrl(image, 1200),
    overview: entity.descriptions?.en?.value || "",
    source: "Wikidata",
    searchRank,
  };
}

async function wikidataSearch(query, property, type) {
  const searchUrl = new URL(WIKIDATA_API);
  searchUrl.searchParams.set("action", "query");
  searchUrl.searchParams.set("list", "search");
  searchUrl.searchParams.set("srsearch", `${query} haswbstatement:${property}`);
  searchUrl.searchParams.set("format", "json");
  searchUrl.searchParams.set("origin", "*");
  searchUrl.searchParams.set("srlimit", "30");

  const searchData = await fetch(searchUrl.toString()).then((response) => (response.ok ? response.json() : null));
  const ids = (searchData?.query?.search || []).map((result) => result.title).filter((id) => /^Q\d+$/.test(id));
  if (!ids.length) return [];

  const entityUrl = new URL(WIKIDATA_API);
  entityUrl.searchParams.set("action", "wbgetentities");
  entityUrl.searchParams.set("ids", ids.join("|"));
  entityUrl.searchParams.set("props", "claims|labels|descriptions");
  entityUrl.searchParams.set("languages", "en");
  entityUrl.searchParams.set("format", "json");
  entityUrl.searchParams.set("origin", "*");

  const entityData = await fetch(entityUrl.toString()).then((response) => (response.ok ? response.json() : null));
  return ids
    .map((id, index) => normalizeWikidataEntity(entityData?.entities?.[id], type, index))
    .filter(Boolean);
}

async function searchWikidataMedia(query) {
  try {
    const [movies, tv] = await Promise.all([wikidataSearch(query, "P4947", "movie"), wikidataSearch(query, "P4983", "tv")]);
    return [...movies, ...tv];
  } catch (error) {
    console.warn("Wikidata search failed", error);
    return [];
  }
}

function normalizeImdbSuggestion(item, index) {
  const qid = item.qid || "";
  const type = qid.toLowerCase().includes("tv") ? "tv" : "movie";
  return {
    id: `${type}-${item.id}`,
    type,
    imdbId: item.id,
    title: item.l,
    year: item.y ? String(item.y) : "",
    genres: [],
    rating: null,
    posterUrl: item.i?.imageUrl || "",
    backdropUrl: item.i?.imageUrl || "",
    overview: item.s || "",
    source: "IMDb",
    searchRank: index,
  };
}

async function searchImdbSuggestions(query) {
  try {
    const response = await fetch(`/api/imdb-suggest?q=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.d || [])
      .filter((item) => item.id && item.l && ["movie", "tvMovie", "tvSeries", "tvMiniSeries"].includes(item.qid))
      .slice(0, 24)
      .map(normalizeImdbSuggestion);
  } catch {
    return [];
  }
}

function searchResultScore(item, query) {
  const title = normalizeSearch(item.title);
  const compactTitle = normalizeCompact(item.title);
  const normalizedQuery = normalizeSearch(query);
  const compactQuery = normalizeCompact(query);
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  let score = 0;

  if (title === normalizedQuery || compactTitle === compactQuery) score += 140;
  else if (title.startsWith(normalizedQuery) || compactTitle.startsWith(compactQuery)) score += 80;
  else if (title.includes(normalizedQuery) || compactTitle.includes(compactQuery)) score += 52;
  else if (queryTokens.every((token) => title.includes(token) || compactTitle.includes(token))) score += 42;

  if (item.tmdbId) score += 26;
  if (item.type === "movie") score += 6;
  if (item.posterUrl) score += 12;
  if (item.overview) score += 6;
  if (item.rating || item.imdbRating) score += 6;
  if (item.source === "TMDB") score += 12;
  if (item.source === APP_NAME) score += 10;
  score += Math.max(0, 24 - (item.searchRank || 0));
  return score;
}

function sortSearchResults(items, query) {
  return [...items].sort((a, b) => {
    const scoreDiff = searchResultScore(b, query) - searchResultScore(a, query);
    if (scoreDiff) return scoreDiff;
    return Number(b.year || 0) - Number(a.year || 0);
  });
}

function stripTags(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || div.innerText || "";
}

async function searchRemote(query) {
  const token = ++state.searchToken;
  state.isSearching = true;
  renderHeadings(getVisibleItems().length);

  const localMatches = SEED_TITLES.map(normalizeSeed).filter((item) => queryMatchesItem(item, query));
  const variants = searchQueryVariants(query);

  const requests = [
    state.profile.tmdbKey ? Promise.all(variants.map((variant) => tmdbSearchPages(variant))).then((lists) => lists.flat()) : Promise.resolve([]),
    Promise.all(variants.map((variant) => searchWikidataMedia(variant))).then((lists) => lists.flat()),
    Promise.all(variants.map((variant) => searchImdbSuggestions(variant))).then((lists) => lists.flat()),
    Promise.all(
      variants.map((variant) =>
        fetch(`${TVMAZE_API}/search/shows?q=${encodeURIComponent(variant)}`)
          .then((response) => (response.ok ? response.json() : []))
          .then((data) => data.map(normalizeTvMazeResult))
          .catch(() => []),
      ),
    ).then((lists) => lists.flat()),
  ];

  const results = await Promise.all(requests);
  if (token !== state.searchToken) return;

  state.items = sortSearchResults(mergeItems(SEED_TITLES.map(normalizeSeed), ...results, localMatches), query);
  state.isSearching = false;
  state.selected = getVisibleItems()[0] || state.items[0] || null;
  scrollToTop();
  render();
  enrichSelected(state.selected);
  enrichRatings(getVisibleItems());
}

async function enrichSelected(item) {
  if (!item) return;

  const detailToken = ++state.detailToken;
  const selectedId = item.id;
  state.detailLoadingId = selectedId;
  if (state.selected?.id === selectedId) render();

  const updates = {};
  if (state.profile.tmdbKey && item.tmdbId) {
    try {
      const path = item.type === "tv" ? `/tv/${item.tmdbId}` : `/movie/${item.tmdbId}`;
      const data = await tmdbFetch(path, { append_to_response: "credits,external_ids" });
      updates.overview = data.overview || item.overview;
      updates.rating = data.vote_average || item.rating;
      updates.genres = (data.genres || []).map((genre) => genre.name);
      updates.imdbId = data.external_ids?.imdb_id || item.imdbId;
      updates.posterUrl = imageUrl(data.poster_path || item.poster, "w500");
      updates.backdropUrl = imageUrl(data.backdrop_path || item.backdrop || data.poster_path, "original");
      updates.cast = (data.credits?.cast || []).slice(0, 10).map((person) => person.name);
      if (item.type === "movie") {
        updates.runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : item.runtime;
      } else {
        updates.runtime = data.episode_run_time?.[0] ? `${data.episode_run_time[0]}m` : item.runtime;
        updates.seasons = (data.seasons || [])
          .filter((season) => season.season_number > 0)
          .map((season) => ({ number: season.season_number, episodes: season.episode_count }));
      }
    } catch (error) {
      console.warn("TMDB detail load failed", error);
    }
  }

  if (item.type === "tv" && item.tvmazeId) {
    try {
      const response = await fetch(`${TVMAZE_API}/shows/${item.tvmazeId}/episodes`);
      if (response.ok) {
        const episodes = await response.json();
        updates.episodes = episodes
          .filter((episode) => episode.season && episode.number)
          .map((episode) => ({
            season: episode.season,
            number: episode.number,
            name: episode.name || "",
          }));
      }
    } catch (error) {
      console.warn("TVmaze episodes failed", error);
    }
  }

  if (item.type === "tv" && !item.tvmazeId) {
    try {
      const lookup = new URL(`${TVMAZE_API}/singlesearch/shows`);
      lookup.searchParams.set("q", item.title);
      const show = await fetch(lookup.toString()).then((response) => (response.ok ? response.json() : null));
      if (show?.id) {
        updates.tvmazeId = show.id;
        updates.runtime = show.averageRuntime ? `${show.averageRuntime}m` : item.runtime;
        updates.overview = item.overview || stripTags(show.summary || "");
        const episodes = await fetch(`${TVMAZE_API}/shows/${show.id}/episodes`).then((response) => (response.ok ? response.json() : []));
        updates.episodes = episodes
          .filter((episode) => episode.season && episode.number)
          .map((episode) => ({
            season: episode.season,
            number: episode.number,
            name: episode.name || "",
          }));
      }
    } catch (error) {
      console.warn("TVmaze title lookup failed", error);
    }
  }

  if (detailToken !== state.detailToken) return;

  const latest = findItem(selectedId) || item;
  const merged = { ...latest, ...updates };
  state.detailLoadingId = "";
  state.items = state.items.map((candidate) => (candidate.id === selectedId ? merged : candidate));
  if (state.selected?.id === selectedId) state.selected = merged;
  render();
  enrichRatings([merged]);
}

async function enrichRatings(items) {
  const withIds = items.filter((item) => item.imdbId);
  if (withIds.length) {
    try {
      const url = new URL(AGREGARR_API);
      withIds.slice(0, 80).forEach((item) => url.searchParams.append("id", item.imdbId));
      const response = await fetch(url.toString());
      if (response.ok) {
        const ratings = await response.json();
        const byId = new Map(ratings.map((rating) => [rating.imdbId, rating]));
        state.items = state.items.map((item) => {
          const rating = byId.get(item.imdbId);
          return rating?.rating ? { ...item, imdbRating: rating.rating, imdbVotes: rating.votes } : item;
        });
        if (state.selected) state.selected = findItem(state.selected.id) || state.selected;
        render();
      }
    } catch (error) {
      console.warn("IMDb rating enrichment failed", error);
    }
  }

  if (!state.profile.omdbKey) return;
  await Promise.all(
    items
      .filter((item) => item.imdbId && !item.omdbRating)
      .slice(0, 8)
      .map(async (item) => {
        try {
          const url = new URL(OMDB_API);
          url.searchParams.set("apikey", state.profile.omdbKey.trim());
          url.searchParams.set("i", item.imdbId);
          const response = await fetch(url.toString());
          if (!response.ok) return;
          const data = await response.json();
          if (data.Response === "True") {
            const updated = {
              ...item,
              omdbRating: data.imdbRating !== "N/A" ? data.imdbRating : item.omdbRating,
              runtime: data.Runtime && data.Runtime !== "N/A" ? data.Runtime : item.runtime,
            };
            state.items = state.items.map((candidate) => (candidate.id === item.id ? updated : candidate));
          }
        } catch (error) {
          console.warn("OMDb enrichment failed", error);
        }
      }),
  );
  if (state.selected) state.selected = findItem(state.selected.id) || state.selected;
  render();
}

function setActiveNav() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === state.view);
  });
}

function setActiveFilter() {
  document.querySelectorAll(".segmented button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === state.filter);
  });
}

function scrollToTop(behavior = "smooth") {
  window.scrollTo({ top: 0, behavior });
}

function applySection(view, filter = view === "home" ? "all" : view) {
  state.view = view;
  state.filter = filter;
  setActiveNav();
  setActiveFilter();
  state.selected = getVisibleItems()[0] || state.items[0] || null;
  scrollToTop();
  render();
  enrichSelected(state.selected);
}

function clearSearchState() {
  els.searchInput.value = "";
  state.query = "";
  scrollToTop();
  hydrateHome();
}

function selectedIndex() {
  return getVisibleItems().findIndex((item) => item.id === state.selected?.id);
}

function selectRelativeItem(direction) {
  const visible = getVisibleItems();
  if (!visible.length) return;
  const current = selectedIndex();
  const nextIndex = current < 0 ? 0 : (current + direction + visible.length) % visible.length;
  state.selected = visible[nextIndex];
  state.currentSeason = 1;
  state.currentEpisode = 1;
  render();
  enrichSelected(state.selected);
}

function goBackOneStep() {
  if (!els.playerOverlay.hidden) {
    closePlayer();
    return;
  }
  if (els.settingsModal.open) {
    els.settingsModal.close();
    return;
  }
  if (state.query) {
    clearSearchState();
    return;
  }
  if (state.view !== "home" || state.filter !== "all") {
    applySection("home", "all");
    return;
  }
  if (document.activeElement === els.searchInput) {
    els.searchInput.blur();
  }
}

function isTypingTarget(target) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target?.isContentEditable
  );
}

function openSettings() {
  els.nameInput.value = state.profile.name || "";
  els.accentInput.value = state.profile.accent || DEFAULT_PROFILE.accent;
  if (els.tmdbInput) els.tmdbInput.value = state.profile.tmdbKey || "";
  if (els.omdbInput) els.omdbInput.value = state.profile.omdbKey || "";
  els.playerColorInput.value = cleanHex(state.profile.playerColor);
  els.autoPlayInput.checked = Boolean(state.profile.autoPlay);
  if (els.episodeSelectorInput) els.episodeSelectorInput.checked = Boolean(state.profile.episodeSelector);
  els.nextEpisodeInput.checked = Boolean(state.profile.nextEpisode);
  els.settingsModal.showModal();
}

function saveSettings() {
  state.profile = {
    ...state.profile,
    name: els.nameInput.value.trim() || APP_NAME,
    accent: els.accentInput.value || DEFAULT_PROFILE.accent,
    tmdbKey: els.tmdbInput ? els.tmdbInput.value.trim() : state.profile.tmdbKey,
    omdbKey: els.omdbInput ? els.omdbInput.value.trim() : state.profile.omdbKey,
    playerColor: cleanHex(els.playerColorInput.value),
    autoPlay: els.autoPlayInput.checked,
    episodeSelector: els.episodeSelectorInput ? els.episodeSelectorInput.checked : false,
    nextEpisode: els.nextEpisodeInput.checked,
  };
  saveProfile();
  hydrateHome();
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const item = findItem(button.dataset.id);
  switch (button.dataset.action) {
    case "select":
      state.selected = item;
      state.currentSeason = 1;
      state.currentEpisode = 1;
      render();
      enrichSelected(item);
      if (item?.tmdbId) playItem(item);
      break;
    case "play":
      if (item) playItem(item);
      break;
    case "play-continue": {
      const entry = state.profile.continueWatching.find((candidate) => candidate.id === button.dataset.id);
      if (item) playItem(item, { season: entry?.season || 1, episode: entry?.episode || 1 });
      break;
    }
    case "toggle-watchlist":
      toggleWatchlist(item);
      break;
    case "attach-tmdb": {
      const input = document.getElementById("manualTmdbInput");
      const tmdbId = Number(input?.value || 0);
      if (item && tmdbId > 0) {
        const updated = { ...item, tmdbId, id: `tv-${tmdbId}` };
        state.profile.watchlist = state.profile.watchlist.map((id) => (id === item.id ? updated.id : id));
        state.items = state.items.map((candidate) => (candidate.id === item.id ? updated : candidate));
        state.selected = updated;
        saveProfile();
        render();
      }
      break;
    }
  }
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.view;
    applySection(view, view === "home" || view === "watchlist" ? "all" : view);
  });
});

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    if (state.view === "movie" && state.filter !== "movie") state.view = "home";
    if (state.view === "tv" && state.filter !== "tv") state.view = "home";
    setActiveNav();
    setActiveFilter();
    state.selected = getVisibleItems()[0] || state.items[0] || null;
    scrollToTop();
    render();
    enrichSelected(state.selected);
  });
});

els.searchInput.addEventListener(
  "input",
  debounce(() => {
    state.query = els.searchInput.value.trim();
    if (state.query.length >= 2) searchRemote(state.query);
    else {
      state.items = SEED_TITLES.map(normalizeSeed);
      state.selected = getVisibleItems()[0] || state.items[0] || null;
      scrollToTop();
      render();
      if (!state.query) hydrateHome();
    }
  }, 320),
);

els.clearSearch.addEventListener("click", () => {
  clearSearchState();
});

els.settingsButton.addEventListener("click", openSettings);
els.profileButton.addEventListener("click", openSettings);

els.settingsForm.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  saveSettings();
  els.settingsModal.close();
});

els.resetProfile.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  state.profile = { ...DEFAULT_PROFILE };
  state.items = SEED_TITLES.map(normalizeSeed);
  state.selected = state.items[0];
  els.settingsModal.close();
  render();
});

els.clearContinue.addEventListener("click", () => {
  state.profile.continueWatching = [];
  saveProfile();
  renderContinue();
});

els.closePlayer.addEventListener("click", closePlayer);
window.addEventListener("message", handlePlayerMessage);
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const typing = isTypingTarget(event.target);

  if (event.key === "Escape") {
    event.preventDefault();
    goBackOneStep();
    return;
  }

  if (typing || els.settingsModal.open || !els.playerOverlay.hidden) return;

  if (event.key === "/") {
    event.preventDefault();
    els.searchInput.focus();
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    playItem(state.selected);
    return;
  }

  if (key === "w") {
    event.preventDefault();
    toggleWatchlist(state.selected);
    return;
  }

  if (key === "h") {
    event.preventDefault();
    applySection("home", "all");
    return;
  }

  if (key === "m") {
    event.preventDefault();
    applySection("movie", "movie");
    return;
  }

  if (key === "t") {
    event.preventDefault();
    applySection("tv", "tv");
    return;
  }

  if (key === "s") {
    event.preventDefault();
    openSettings();
    return;
  }

  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
    event.preventDefault();
    selectRelativeItem(1);
    return;
  }

  if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
    event.preventDefault();
    selectRelativeItem(-1);
  }
});

window.addEventListener("error", (event) => {
  const target = event.target;
  if (target instanceof HTMLImageElement) {
    target.style.opacity = "0";
  }
}, true);

setActiveNav();
setActiveFilter();
state.selected = state.items[0];
scrollToTop("auto");
render();
hydrateHome();
