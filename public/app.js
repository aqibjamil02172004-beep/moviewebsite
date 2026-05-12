"use strict";

const APP_NAME = "FlixDok";
const STORAGE_KEY = "flixdok.profile.v1";
const LEGACY_STORAGE_KEY = "mushfiq.profile.v1";
const TMDB_API = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p";
const TMDB_PROXY = "https://db.videasy.net/3";
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

const CATEGORY_PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 180;
const SEARCH_CACHE_LIMIT = 260;
const CONTENT_CACHE_KEY = "flixdok.content.v2";
const CONTENT_CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const PLAYER_RECOVERY_COOLDOWN_MS = 12000;
const DRAG_START_THRESHOLD = 10;
const DRAG_CLICK_CANCEL_THRESHOLD = 18;

const TMDB_GENRES = {
  12: "Adventure",
  14: "Fantasy",
  16: "Animation",
  18: "Drama",
  27: "Horror",
  28: "Action",
  35: "Comedy",
  36: "History",
  53: "Thriller",
  80: "Crime",
  878: "Sci-Fi",
  9648: "Mystery",
  10749: "Romance",
  10751: "Family",
  10759: "Action",
  10765: "Sci-Fi",
};

const STATIC_COLLECTIONS = {
  bollywood: {
    title: "Bollywood Movies",
    subtitle: "High-energy Indian cinema ready to open",
    path: "/category/bollywood/",
    type: "movie",
    region: "Bollywood",
    endpoint: "/discover/movie",
    params: { with_original_language: "hi", sort_by: "popularity.desc" },
    pages: [1, 2, 3],
  },
  hollywood: {
    title: "Hollywood Movies",
    subtitle: "Big-screen favorites and modern blockbusters",
    path: "/category/hollywood/",
    type: "movie",
    region: "Hollywood",
    endpoint: "/discover/movie",
    params: { with_original_language: "en", sort_by: "popularity.desc" },
    pages: [1, 2, 3],
  },
  "genre-action": {
    title: "Action Movies",
    subtitle: "Fast, loud, and built for a big screen night",
    path: "/genre/action/",
    type: "movie",
    genre: "Action",
    endpoint: "/discover/movie",
    params: { with_genres: "28", sort_by: "popularity.desc" },
  },
  "genre-comedy": {
    title: "Comedy Movies",
    subtitle: "Easy picks when you want something lighter",
    path: "/genre/comedy/",
    type: "movie",
    genre: "Comedy",
    endpoint: "/discover/movie",
    params: { with_genres: "35", sort_by: "popularity.desc" },
  },
  "genre-anime": {
    title: "Anime",
    subtitle: "Animated worlds, cult favorites, and bingeable series",
    path: "/genre/anime/",
    type: "tv",
    genre: "Animation",
    endpoint: "/discover/tv",
    params: { with_genres: "16", with_original_language: "ja", sort_by: "popularity.desc" },
  },
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
    type: "movie",
    tmdbId: 579974,
    imdbId: "tt8178634",
    title: "RRR",
    year: "2022",
    region: "Bollywood",
    genres: ["Action", "Drama"],
    rating: 7.8,
    runtime: "3h 7m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BNWMwODYyMjQtMTczMi00NTQ1LWFkYjItMGJhMWRkY2E3NDAyXkEyXkFqcGc@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BNWMwODYyMjQtMTczMi00NTQ1LWFkYjItMGJhMWRkY2E3NDAyXkEyXkFqcGc@._V1_.jpg",
    overview: "Two revolutionaries form a fearless friendship while fighting against colonial rule.",
  },
  {
    type: "movie",
    tmdbId: 872906,
    imdbId: "tt15354916",
    title: "Jawan",
    year: "2023",
    region: "Bollywood",
    genres: ["Action", "Thriller"],
    rating: 7.0,
    runtime: "2h 49m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMGExNGI1NDktOWI2Mi00NDM3LWIxMmQtNTQxYTgzMzI0MTA1XkEyXkFqcGc@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BMGExNGI1NDktOWI2Mi00NDM3LWIxMmQtNTQxYTgzMzI0MTA1XkEyXkFqcGc@._V1_.jpg",
    overview: "A driven man takes on a dangerous system while confronting the wounds of his past.",
  },
  {
    type: "movie",
    tmdbId: 587412,
    imdbId: "tt10698680",
    title: "K.G.F: Chapter 2",
    year: "2022",
    region: "Bollywood",
    genres: ["Action", "Crime"],
    rating: 8.2,
    runtime: "2h 46m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZmQzZjVkZTUtYjI4ZC00ZDJmLWI0ZDUtZTFmMGM1Mzc5ZjIyXkEyXkFqcGc@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BZmQzZjVkZTUtYjI4ZC00ZDJmLWI0ZDUtZTFmMGM1Mzc5ZjIyXkEyXkFqcGc@._V1_.jpg",
    overview: "Rocky expands his empire while enemies close in from every direction.",
  },
  {
    type: "movie",
    tmdbId: 864692,
    imdbId: "tt12844910",
    title: "Pathaan",
    year: "2023",
    region: "Bollywood",
    genres: ["Action", "Adventure"],
    rating: 5.8,
    runtime: "2h 26m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BNDdkNTY1MDQtY2I5MC00OTFlLTg5OWQtZWE2YzE5NWFiMDgzXkEyXkFqcGc@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BNDdkNTY1MDQtY2I5MC00OTFlLTg5OWQtZWE2YzE5NWFiMDgzXkEyXkFqcGc@._V1_.jpg",
    overview: "An exiled agent returns for a high-stakes mission against a global threat.",
  },
  {
    type: "movie",
    tmdbId: 360814,
    imdbId: "tt5074352",
    title: "Dangal",
    year: "2016",
    region: "Bollywood",
    genres: ["Drama", "Sport"],
    rating: 8.3,
    runtime: "2h 41m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMTQ4MzQzMzM2Nl5BMl5BanBnXkFtZTgwMTQ1NzU3MDI@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BMTQ4MzQzMzM2Nl5BMl5BanBnXkFtZTgwMTQ1NzU3MDI@._V1_.jpg",
    overview: "A former wrestler trains his daughters to become world-class champions.",
  },
  {
    type: "movie",
    tmdbId: 20453,
    imdbId: "tt1187043",
    title: "3 Idiots",
    year: "2009",
    region: "Bollywood",
    genres: ["Comedy", "Drama"],
    rating: 8.4,
    runtime: "2h 50m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BNzc4ZWQ3NmYtODE0Ny00YTQ4LTlkZWItNTBkMGQ0MmUwMmJlXkEyXkFqcGc@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BNzc4ZWQ3NmYtODE0Ny00YTQ4LTlkZWItNTBkMGQ0MmUwMmJlXkEyXkFqcGc@._V1_.jpg",
    overview: "Three friends challenge a rigid education system while chasing their own meaning of success.",
  },
  {
    type: "movie",
    tmdbId: 297222,
    imdbId: "tt2338151",
    title: "PK",
    year: "2014",
    region: "Bollywood",
    genres: ["Comedy", "Drama"],
    rating: 8.1,
    runtime: "2h 33m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMTYzOTE2NjkxN15BMl5BanBnXkFtZTgwMDgzMTg0MzE@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BMTYzOTE2NjkxN15BMl5BanBnXkFtZTgwMDgzMTg0MzE@._V1_.jpg",
    overview: "A curious stranger questions social habits, faith, and fear with disarming honesty.",
  },
  {
    type: "movie",
    tmdbId: 348892,
    imdbId: "tt3863552",
    title: "Bajrangi Bhaijaan",
    year: "2015",
    region: "Bollywood",
    genres: ["Adventure", "Drama"],
    rating: 8.1,
    runtime: "2h 43m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BYzVjMjZiNGUtZjZiNy00Yzg4LWEzYzYtMmI1NDg5NWNiNjUwXkEyXkFqcGc@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BYzVjMjZiNGUtZjZiNy00Yzg4LWEzYzYtMmI1NDg5NWNiNjUwXkEyXkFqcGc@._V1_.jpg",
    overview: "A devoted man crosses borders to reunite a lost child with her family.",
  },
  {
    type: "movie",
    tmdbId: 496331,
    imdbId: "tt6277462",
    title: "Brahmastra Part One: Shiva",
    year: "2022",
    region: "Bollywood",
    genres: ["Fantasy", "Action"],
    rating: 5.6,
    runtime: "2h 47m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZjZiOTE2Y2ItMTY4My00ZjE0LTlkZTAtYWY4M2I4OTVkMjQ5XkEyXkFqcGc@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BZjZiOTE2Y2ItMTY4My00ZjE0LTlkZTAtYWY4M2I4OTVkMjQ5XkEyXkFqcGc@._V1_.jpg",
    overview: "A young man discovers a hidden power connected to an ancient celestial weapon.",
  },
  {
    type: "movie",
    tmdbId: 534780,
    imdbId: "tt8108198",
    title: "Andhadhun",
    year: "2018",
    region: "Bollywood",
    genres: ["Thriller", "Mystery"],
    rating: 8.2,
    runtime: "2h 19m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZjc5OWIzOTgtMmM2ZS00ZjZhLTkyZWItMTFjYTc0NWQ4NzhkXkEyXkFqcGc@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BZjc5OWIzOTgtMmM2ZS00ZjZhLTkyZWItMTFjYTc0NWQ4NzhkXkEyXkFqcGc@._V1_.jpg",
    overview: "A pianist's carefully guarded act pulls him into a murder mystery.",
  },
  {
    type: "movie",
    tmdbId: 352173,
    imdbId: "tt4430212",
    title: "Drishyam",
    year: "2015",
    region: "Bollywood",
    genres: ["Crime", "Thriller"],
    rating: 8.2,
    runtime: "2h 43m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMDRlZWFkMjEtYmYyZi00MmE5LWIzMzUtYmM2N2M5Y2UxZDJjXkEyXkFqcGc@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BMDRlZWFkMjEtYmYyZi00MmE5LWIzMzUtYmM2N2M5Y2UxZDJjXkEyXkFqcGc@._V1_.jpg",
    overview: "A family man builds an airtight cover story after a desperate night changes everything.",
  },
  {
    type: "movie",
    tmdbId: 61202,
    imdbId: "tt1562872",
    title: "Zindagi Na Milegi Dobara",
    year: "2011",
    region: "Bollywood",
    genres: ["Drama", "Comedy"],
    rating: 8.2,
    runtime: "2h 35m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BOGIzYzg5NzItNDRkYS00NmIzLTk3NzQtZWYwY2VlZDhiYWQ4XkEyXkFqcGc@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BOGIzYzg5NzItNDRkYS00NmIzLTk3NzQtZWYwY2VlZDhiYWQ4XkEyXkFqcGc@._V1_.jpg",
    overview: "Three friends turn a road trip into a reckoning with love, fear, and adulthood.",
  },
  {
    type: "movie",
    tmdbId: 27205,
    imdbId: "tt1375666",
    title: "Inception",
    year: "2010",
    region: "Hollywood",
    genres: ["Sci-Fi", "Thriller"],
    rating: 8.4,
    runtime: "2h 28m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    overview: "A thief who steals secrets through dreams is offered a chance to erase his past.",
  },
  {
    type: "movie",
    tmdbId: 603,
    imdbId: "tt0133093",
    title: "The Matrix",
    year: "1999",
    region: "Hollywood",
    genres: ["Sci-Fi", "Action"],
    rating: 8.2,
    runtime: "2h 16m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_.jpg",
    overview: "A hacker discovers the world he knows is a simulation built to hide a war for humanity.",
  },
  {
    type: "movie",
    tmdbId: 76600,
    imdbId: "tt1630029",
    title: "Avatar: The Way of Water",
    year: "2022",
    region: "Hollywood",
    genres: ["Sci-Fi", "Adventure"],
    rating: 7.5,
    runtime: "3h 12m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BNWI0Y2NkOWEtMmM2OC00MjQ3LWI1YzItZGQxYzQ3NzI4NWZmXkEyXkFqcGc@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BNWI0Y2NkOWEtMmM2OC00MjQ3LWI1YzItZGQxYzQ3NzI4NWZmXkEyXkFqcGc@._V1_.jpg",
    overview: "Jake Sully and his family seek refuge with ocean clans as an old threat returns.",
  },
  {
    type: "movie",
    tmdbId: 550,
    imdbId: "tt0137523",
    title: "Fight Club",
    year: "1999",
    region: "Hollywood",
    genres: ["Drama", "Thriller"],
    rating: 8.4,
    runtime: "2h 19m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BOTgyOGQ1NDItNGU3Ny00MjU3LTg2YWEtNmEyYjBiMjI1Y2M5XkEyXkFqcGc@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BOTgyOGQ1NDItNGU3Ny00MjU3LTg2YWEtNmEyYjBiMjI1Y2M5XkEyXkFqcGc@._V1_.jpg",
    overview: "An office worker and a magnetic stranger create an underground club that spirals out of control.",
  },
  {
    type: "movie",
    tmdbId: 238,
    imdbId: "tt0068646",
    title: "The Godfather",
    year: "1972",
    region: "Hollywood",
    genres: ["Crime", "Drama"],
    rating: 8.7,
    runtime: "2h 55m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_.jpg",
    overview: "The aging head of a crime family transfers power while his reluctant son is drawn in.",
  },
  {
    type: "movie",
    tmdbId: 76341,
    imdbId: "tt1392190",
    title: "Mad Max: Fury Road",
    year: "2015",
    region: "Hollywood",
    genres: ["Action", "Adventure"],
    rating: 7.6,
    runtime: "2h 1m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BZDRkODJhOTgtOTc1OC00NTgzLTk4NjItNDgxZDY4YjlmNDY2XkEyXkFqcGc@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BZDRkODJhOTgtOTc1OC00NTgzLTk4NjItNDgxZDY4YjlmNDY2XkEyXkFqcGc@._V1_.jpg",
    overview: "A rebel warrior and a haunted drifter race across a wasteland to escape a tyrant.",
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
    imdbId: "tt39334604",
    title: "Delikanlı",
    originalTitle: "Delikanlı",
    englishTitle: "The Gentleman",
    aliases: ["Delikanli", "Delikanlı", "The Gentleman", "Delikanl", "Delik"],
    year: "2026",
    genres: ["Drama", "Romance"],
    rating: 5.8,
    runtime: "140m",
    posterUrl: "https://m.media-amazon.com/images/M/MV5BYzA5NTIzYTMtMWI2OC00ZThmLWFjODYtNTMwOGQxOGQ1MjAxXkEyXkFqcGc@._V1_.jpg",
    backdropUrl: "https://m.media-amazon.com/images/M/MV5BYzA5NTIzYTMtMWI2OC00ZThmLWFjODYtNTMwOGQxOGQ1MjAxXkEyXkFqcGc@._V1_.jpg",
    seasons: [{ number: 1, episodes: 8 }],
    overview:
      "Yusuf tries to keep his family afloat in Istanbul, but old wounds, power games, and hidden secrets pull him into a dangerous new life.",
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
  homeScreen: document.getElementById("homeScreen"),
  railArea: document.getElementById("railArea"),
  browseBlock: document.getElementById("browseBlock"),
  quickHelp: document.getElementById("quickHelp"),
  posterGrid: document.getElementById("posterGrid"),
  categoryTools: document.getElementById("categoryTools"),
  categoryMore: document.getElementById("categoryMore"),
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
  shortcutsButton: document.getElementById("shortcutsButton"),
  shortcutsModal: document.getElementById("shortcutsModal"),
  closeShortcuts: document.getElementById("closeShortcuts"),
  playerOverlay: document.getElementById("playerOverlay"),
  playerFrame: document.getElementById("playerFrame"),
  playerTitle: document.getElementById("playerTitle"),
  playerMeta: document.getElementById("playerMeta"),
  playerShieldTitle: document.getElementById("playerShieldTitle"),
  playerShieldMeta: document.getElementById("playerShieldMeta"),
  playerControls: document.getElementById("playerControls"),
  closePlayer: document.getElementById("closePlayer"),
};

const state = {
  profile: loadProfile(),
  items: SEED_TITLES.map(normalizeSeed),
  selected: null,
  page: "home",
  filter: "all",
  view: "home",
  query: "",
  isSearching: false,
  currentSeason: 1,
  currentEpisode: 1,
  activePlayerId: "",
  searchToken: 0,
  detailToken: 0,
  routeToken: 0,
  detailLoadingId: "",
  heroIndex: 0,
  heroItemId: "",
  heroTransitioning: false,
  categoryQuery: "",
  categoryGenre: "all",
  categorySort: "featured",
  categoryTab: "trending",
  categoryLimit: CATEGORY_PAGE_SIZE,
  searchCache: new Map(),
  collectionLoading: {},
  collectionLoaded: {},
  contentHydratedAt: 0,
  activePlayerUrl: "",
  playerLoadStartedAt: 0,
  lastPlayerSignalAt: 0,
  lastPlayerRecoveryAt: 0,
  playerRecoveryCount: 0,
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
  const posterUrl = item.posterUrl || imageUrl(item.poster, "w500");
  const backdropUrl = item.backdropUrl || imageUrl(item.backdrop || item.poster, "original");
  const normalized = {
    ...item,
    posterUrl,
    backdropUrl,
    originalTitle: item.originalTitle || item.title,
    providerTitle: item.providerTitle || item.title,
    aliases: uniqueValues([item.title, item.originalTitle, ...(item.aliases || [])]),
    region: item.region || (item.type === "movie" ? "Hollywood" : "TV"),
    source: APP_NAME,
  };
  return { ...normalized, id: itemDisplayId(normalized) };
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

function numericTmdbId(value) {
  const id = String(value || "").trim();
  return /^\d+$/.test(id) ? id : "";
}

function providerId(item) {
  return numericTmdbId(item?.tmdbId);
}

function hasPlayableId(item) {
  return Boolean(providerId(item));
}

function providerStatus(item) {
  if (hasPlayableId(item)) return "Vidking ready";
  if (item?.imdbId && !item.providerChecked) return "Checking availability";
  return "Not available";
}

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[char];
  });
}

const SEARCH_CHARACTER_MAP = {
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

const SEARCH_ARTICLES = new Set(["a", "an", "the", "el", "la", "le", "les", "de", "der", "die", "das", "los", "las", "al"]);
const SEARCH_DESCRIPTOR_WORDS = new Set(["chapter", "chap", "part", "pt", "volume", "vol", "season", "episode", "ep"]);
const SEARCH_REMOTE_VARIANT_LIMIT = 16;
const SEARCH_KEYWORD_LIMIT = 140;
const SEARCH_FIELD_CACHE_LIMIT = 700;
const SEARCH_FIELD_CACHE = new Map();

const SEARCH_TYPE_KEYWORDS = {
  movie: ["movie", "movies", "film", "films", "cinema", "feature", "watch movie"],
  tv: ["tv", "tv show", "show", "shows", "series", "serial", "episode", "season", "web series"],
};

const SEARCH_REGION_KEYWORDS = {
  bollywood: ["bollywood", "hindi", "indian", "india", "desi"],
  hollywood: ["hollywood", "english", "american", "usa", "western"],
  tv: ["tv", "series", "show"],
};

const SEARCH_GENRE_KEYWORDS = {
  action: ["fight", "fighting", "martial arts", "hero"],
  adventure: ["journey", "quest", "explore"],
  animation: ["animated", "cartoon", "anime"],
  comedy: ["funny", "humor", "humour", "laugh"],
  crime: ["gangster", "mafia", "police", "detective"],
  drama: ["emotional", "serious"],
  fantasy: ["magic", "supernatural"],
  history: ["historical", "true story"],
  horror: ["scary", "ghost"],
  mystery: ["detective", "secret"],
  romance: ["love", "romantic"],
  "sci fi": ["sci-fi", "science fiction", "space", "future"],
  "sci-fi": ["sci fi", "science fiction", "space", "future"],
  sport: ["sports"],
  thriller: ["suspense", "mystery"],
};

function transliterate(value) {
  return String(value || "")
    .replace(
      /[\u0131\u0130\u015f\u015e\u011f\u011e\u00fc\u00dc\u00f6\u00d6\u00e7\u00c7\u00e6\u00c6\u0153\u0152\u00f8\u00d8\u00e5\u00c5\u00f1\u00d1\u00df\u0111\u0110\u0142\u0141\u00fe\u00de\u00f0\u00d0]/g,
      (char) => SEARCH_CHARACTER_MAP[char] || char,
    )
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeSearch(value) {
  return transliterate(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeCompact(value) {
  return normalizeSearch(value).replace(/\s+/g, "");
}

function tokenizeSearch(value) {
  return normalizeSearch(value).split(" ").filter(Boolean);
}

function uniqueValues(values) {
  return Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)));
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

function searchSkeleton(value) {
  return relaxedCompact(value).replace(/[aeiouy]/g, "");
}

function stripLeadingArticles(value) {
  const tokens = tokenizeSearch(value);
  while (tokens.length > 1 && SEARCH_ARTICLES.has(tokens[0])) tokens.shift();
  return tokens.join(" ");
}

function stripTitleDescriptors(value) {
  return tokenizeSearch(value)
    .filter((token) => !SEARCH_DESCRIPTOR_WORDS.has(token))
    .join(" ");
}

function titleInitials(value) {
  return tokenizeSearch(value)
    .filter((token) => !SEARCH_ARTICLES.has(token) && !SEARCH_DESCRIPTOR_WORDS.has(token))
    .map((token) => token[0])
    .join("");
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
  const noDescriptors = normalizeCompact(stripTitleDescriptors(value));
  if (noDescriptors && noDescriptors !== compact) alternates.add(noDescriptors);
  return Array.from(alternates).filter((variant) => variant.length >= 2);
}

function titleSearchForms(value) {
  const normalized = normalizeSearch(value);
  const compact = normalizeCompact(value);
  const stripped = stripLeadingArticles(value);
  const descriptorless = stripTitleDescriptors(value);
  const tokens = tokenizeSearch(value);
  const forms = [
    normalized,
    compact,
    stripped,
    normalizeCompact(stripped),
    descriptorless,
    normalizeCompact(descriptorless),
    relaxedCompact(value),
    searchSkeleton(value),
    titleInitials(value),
    ...spellingAlternates(value),
    ...tokens,
  ];

  for (let index = 0; index < tokens.length - 1; index += 1) {
    forms.push(`${tokens[index]} ${tokens[index + 1]}`, `${tokens[index]}${tokens[index + 1]}`);
  }

  if (/^[a-z0-9]{2,12}$/.test(compact)) forms.push(compact.split("").join("."));
  if (compact.includes("kgf")) forms.push("k g f", "k.g.f", "kgf");

  return uniqueValues(forms).filter((form) => form.length >= 2);
}

function itemKeywordValues(item) {
  const titleValues = uniqueValues([item.title, item.originalTitle, item.englishTitle, item.providerTitle, ...(item.aliases || [])]);
  const genreValues = uniqueValues(
    (item.genres || []).flatMap((genre) => {
      const key = normalizeSearch(genre);
      return [genre, key, ...(SEARCH_GENRE_KEYWORDS[key] || [])];
    }),
  );
  const regionKey = normalizeSearch(item.region);
  const typeValues = SEARCH_TYPE_KEYWORDS[item.type] || [];
  const regionValues = SEARCH_REGION_KEYWORDS[regionKey] || [];
  const yearValues = item.year ? [item.year, `${item.year} ${mediaLabel(item.type)}`, `${item.year} ${item.type}`] : [];
  const idValues = uniqueValues([item.imdbId, item.tmdbId, item.wikidataId, item.tvmazeId]);
  const keywordValues = uniqueValues([...(item.keywords || []), ...(item.searchAliases || [])]);

  return uniqueValues([
    ...titleValues,
    ...titleValues.flatMap(titleSearchForms),
    ...genreValues,
    ...typeValues,
    ...regionValues,
    ...yearValues,
    ...idValues,
    ...keywordValues,
  ]).slice(0, SEARCH_KEYWORD_LIMIT);
}

function isSearchableLatinTitle(value) {
  return normalizeCompact(value).length >= 3;
}

function displayTitleFromProvider(providerTitle, originalTitle, originalLanguage = "") {
  const provider = String(providerTitle || originalTitle || "").trim();
  const original = String(originalTitle || provider || "").trim();
  if (!provider) return original;
  if (!original) return provider;

  const providerKey = normalizeCompact(provider);
  const originalKey = normalizeCompact(original);
  const language = String(originalLanguage || "").toLowerCase();

  if (language && language !== "en" && providerKey !== originalKey && isSearchableLatinTitle(original)) {
    return original;
  }

  return provider;
}

function searchForms(value) {
  const normalized = normalizeSearch(value);
  const compact = normalizeCompact(value);
  return uniqueValues([normalized, compact]);
}

function searchFieldCacheKey(item) {
  return [
    item.id,
    item.title,
    item.originalTitle,
    item.englishTitle,
    item.providerTitle,
    item.year,
    item.type,
    item.region,
    item.source,
    (item.aliases || []).join("|"),
    (item.searchAliases || []).join("|"),
    (item.genres || []).join("|"),
    (item.cast || []).join("|"),
  ].join("::");
}

function searchableFields(item) {
  const cacheKey = searchFieldCacheKey(item);
  const cached = SEARCH_FIELD_CACHE.get(cacheKey);
  if (cached) return cached;

  const aliases = Array.isArray(item.aliases) ? item.aliases : [];
  const searchAliases = Array.isArray(item.searchAliases) ? item.searchAliases : [];
  const titleFields = uniqueValues([item.title, item.originalTitle, item.englishTitle, item.providerTitle, ...aliases]);
  const keywordFields = itemKeywordValues(item);
  const metadata = uniqueValues([item.year, mediaLabel(item.type), item.type, item.source, item.region, item.imdbId, item.tmdbId, item.wikidataId, item.tvmazeId]);
  const fields = [
    ...titleFields.map((value) => ({ value, weight: 1 })),
    ...titleFields.flatMap((value) => titleSearchForms(value).map((form) => ({ value: form, weight: 0.92 }))),
    ...keywordFields.map((value) => ({ value, weight: 0.72 })),
    ...searchAliases.map((value) => ({ value, weight: 0.16 })),
    ...(item.genres || []).map((value) => ({ value, weight: 0.78 })),
    ...(item.cast || []).map((value) => ({ value, weight: 0.66 })),
    ...metadata.map((value) => ({ value, weight: 0.5 })),
    ...(item.overview ? [{ value: item.overview, weight: 0.34 }] : []),
  ];
  SEARCH_FIELD_CACHE.set(cacheKey, fields);
  if (SEARCH_FIELD_CACHE.size > SEARCH_FIELD_CACHE_LIMIT) {
    Array.from(SEARCH_FIELD_CACHE.keys())
      .slice(0, SEARCH_FIELD_CACHE.size - SEARCH_FIELD_CACHE_LIMIT)
      .forEach((key) => SEARCH_FIELD_CACHE.delete(key));
  }
  return fields;
}

function ngrams(value, size = 2) {
  const compact = normalizeCompact(value);
  if (compact.length <= size) return compact ? [compact] : [];
  const grams = [];
  for (let index = 0; index <= compact.length - size; index += 1) {
    grams.push(compact.slice(index, index + size));
  }
  return grams;
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

function phoneticKey(value) {
  const compact = normalizeCompact(value)
    .replace(/ph/g, "f")
    .replace(/[cq]/g, "k")
    .replace(/[vw]/g, "v")
    .replace(/[zs]/g, "s");
  if (!compact) return "";
  return `${compact[0]}${compact.slice(1).replace(/[aeiou]/g, "").replace(/(.)\1+/g, "$1")}`;
}

function fieldMatchScore(fieldValue, queryContext) {
  const normalized = normalizeSearch(fieldValue);
  const compact = normalizeCompact(fieldValue);
  const relaxed = relaxedCompact(fieldValue);
  const skeleton = searchSkeleton(fieldValue);
  if (!normalized || !queryContext.normalized) return 0;

  let score = 0;
  if (normalized === queryContext.normalized || compact === queryContext.compact) score = Math.max(score, 180);
  if (queryContext.articleCompact && compact === queryContext.articleCompact) score = Math.max(score, 176);
  if (queryContext.descriptorCompact && compact === queryContext.descriptorCompact) score = Math.max(score, 168);
  if (relaxed && queryContext.relaxed && relaxed === queryContext.relaxed) score = Math.max(score, 166);
  if (skeleton.length >= 3 && queryContext.skeleton.length >= 3 && skeleton === queryContext.skeleton) score = Math.max(score, 160);
  if (normalized.startsWith(queryContext.normalized)) score = Math.max(score, 130);
  if (compact.startsWith(queryContext.compact)) score = Math.max(score, 124);
  if (queryContext.articleCompact && compact.startsWith(queryContext.articleCompact)) score = Math.max(score, 122);
  if (queryContext.descriptorCompact && compact.startsWith(queryContext.descriptorCompact)) score = Math.max(score, 118);
  if (relaxed && queryContext.relaxed && relaxed.startsWith(queryContext.relaxed)) score = Math.max(score, 116);
  if (skeleton.length >= 3 && queryContext.skeleton.length >= 3 && skeleton.startsWith(queryContext.skeleton)) score = Math.max(score, 112);
  if (normalized.includes(queryContext.normalized)) score = Math.max(score, 94);
  if (compact.includes(queryContext.compact)) score = Math.max(score, 88);
  if (queryContext.articleCompact && compact.includes(queryContext.articleCompact)) score = Math.max(score, 84);
  if (queryContext.descriptorCompact && compact.includes(queryContext.descriptorCompact)) score = Math.max(score, 82);
  if (relaxed && queryContext.relaxed && relaxed.includes(queryContext.relaxed)) score = Math.max(score, 78);
  if (skeleton.length >= 4 && queryContext.skeleton.length >= 4 && skeleton.includes(queryContext.skeleton)) score = Math.max(score, 76);

  const meaningfulTokens = queryContext.tokens.filter((token) => token.length >= 2);
  if (meaningfulTokens.length > 1) {
    const fieldTokens = tokenizeSearch(fieldValue);
    const tokenHits = meaningfulTokens.filter((token) => {
      const relaxedToken = relaxedCompact(token);
      return (
        normalized.includes(token) ||
        compact.includes(token) ||
        fieldTokens.some((fieldToken) => fieldToken.startsWith(token) || relaxedCompact(fieldToken).startsWith(relaxedToken))
      );
    });
    if (tokenHits.length === meaningfulTokens.length) score = Math.max(score, 76);
    else if (tokenHits.length) score = Math.max(score, 34 + tokenHits.length * 12);
  }

  if (queryContext.compact.length >= 3 && compact.length >= 3) {
    const queryGrams = queryContext.grams;
    const fieldGrams = new Set(ngrams(compact, queryContext.compact.length <= 4 ? 2 : 3));
    const overlap = queryGrams.filter((gram) => fieldGrams.has(gram)).length;
    if (queryGrams.length) score = Math.max(score, Math.round((overlap / queryGrams.length) * 66));
  }

  if (queryContext.compact.length >= 4 && compact.length >= 4) {
    const windowLength = Math.min(compact.length, Math.max(queryContext.compact.length - 1, 3));
    const candidates = [compact];
    for (let index = 0; index <= compact.length - windowLength; index += 1) {
      candidates.push(compact.slice(index, index + windowLength));
    }
    const distance = Math.min(...candidates.map((candidate) => levenshteinDistance(candidate, queryContext.compact, 3)));
    if (distance <= 1) score = Math.max(score, 82);
    else if (distance === 2) score = Math.max(score, 58);
    else if (distance === 3 && queryContext.compact.length >= 7) score = Math.max(score, 42);
  }

  if (queryContext.relaxed.length >= 4 && relaxed.length >= 4) {
    const distance = levenshteinDistance(relaxed, queryContext.relaxed, 3);
    if (distance <= 1) score = Math.max(score, 92);
    else if (distance === 2) score = Math.max(score, 68);
    else if (distance === 3 && queryContext.relaxed.length >= 7) score = Math.max(score, 48);
  }

  if (queryContext.skeleton.length >= 4 && skeleton.length >= 4) {
    const distance = levenshteinDistance(skeleton, queryContext.skeleton, 2);
    if (distance <= 1) score = Math.max(score, 86);
    else if (distance === 2 && queryContext.skeleton.length >= 5) score = Math.max(score, 58);
  }

  if (queryContext.sound && phoneticKey(compact).startsWith(queryContext.sound)) score = Math.max(score, 36);
  return score;
}

function aggregateFieldMatchScore(fields, queryContext) {
  const meaningfulTokens = queryContext.tokens.filter((token) => token.length >= 2);
  if (meaningfulTokens.length <= 1) return 0;

  const normalizedText = fields.map((field) => normalizeSearch(field.value)).join(" ");
  const compactText = normalizedText.replace(/\s+/g, "");
  const relaxedText = relaxedCompact(normalizedText);
  const tokenHits = meaningfulTokens.filter((token) => {
    const compactToken = normalizeCompact(token);
    const relaxedToken = relaxedCompact(token);
    return normalizedText.includes(token) || compactText.includes(compactToken) || relaxedText.includes(relaxedToken);
  });

  if (tokenHits.length === meaningfulTokens.length) return Math.min(150, 92 + meaningfulTokens.length * 16);
  if (tokenHits.length >= 2) return 46 + tokenHits.length * 12;
  return 0;
}

function buildQueryContext(query) {
  const normalized = normalizeSearch(query);
  const compact = normalizeCompact(query);
  const relaxed = relaxedCompact(query);
  const skeleton = searchSkeleton(query);
  const articleStripped = stripLeadingArticles(query);
  const descriptorless = stripTitleDescriptors(query);
  return {
    normalized,
    compact,
    relaxed,
    skeleton,
    articleStripped,
    articleCompact: normalizeCompact(articleStripped),
    descriptorless,
    descriptorCompact: normalizeCompact(descriptorless),
    tokens: tokenizeSearch(query),
    grams: ngrams(compact, compact.length <= 4 ? 2 : 3),
    sound: phoneticKey(query),
  };
}

function realTitleFields(item) {
  const aliases = Array.isArray(item.aliases) ? item.aliases : [];
  return uniqueValues([item.title, item.originalTitle, item.englishTitle, item.providerTitle, ...aliases]);
}

function wholeTitleMatchScore(fieldValue, queryContext) {
  const normalized = normalizeSearch(fieldValue);
  const compact = normalizeCompact(fieldValue);
  const relaxed = relaxedCompact(fieldValue);
  const skeleton = searchSkeleton(fieldValue);
  if (!normalized || !queryContext.normalized) return 0;

  if (normalized === queryContext.normalized || compact === queryContext.compact) return 230;
  if (queryContext.articleCompact && compact === queryContext.articleCompact) return 224;
  if (queryContext.descriptorCompact && compact === queryContext.descriptorCompact) return 214;
  if (relaxed && queryContext.relaxed && relaxed === queryContext.relaxed) return 210;
  if (skeleton.length >= 3 && queryContext.skeleton.length >= 3 && skeleton === queryContext.skeleton) return 202;
  if (normalized.startsWith(queryContext.normalized) || compact.startsWith(queryContext.compact)) return queryContext.compact.length <= 3 ? 180 : 170;
  if (queryContext.articleCompact && compact.startsWith(queryContext.articleCompact)) return queryContext.articleCompact.length <= 3 ? 176 : 164;
  if (queryContext.descriptorCompact && compact.startsWith(queryContext.descriptorCompact)) return queryContext.descriptorCompact.length <= 3 ? 170 : 158;
  if (relaxed && queryContext.relaxed && relaxed.startsWith(queryContext.relaxed)) return queryContext.relaxed.length <= 3 ? 166 : 154;
  if (skeleton.length >= 3 && queryContext.skeleton.length >= 3 && skeleton.startsWith(queryContext.skeleton)) return queryContext.skeleton.length <= 3 ? 154 : 146;

  const extraLength = Math.abs(compact.length - queryContext.compact.length);
  const fullDistance = levenshteinDistance(compact, queryContext.compact, 4);
  if (fullDistance <= 1 && extraLength <= 2) return 175;
  if (fullDistance <= 2 && extraLength <= 3) return 156;
  if (fullDistance <= 3 && extraLength <= 4 && queryContext.compact.length >= 7) return 126;

  const relaxedDistance = levenshteinDistance(relaxed, queryContext.relaxed, 3);
  if (relaxedDistance <= 1 && queryContext.relaxed.length >= 4) return 168;
  if (relaxedDistance <= 2 && queryContext.relaxed.length >= 6) return 142;

  const skeletonDistance = levenshteinDistance(skeleton, queryContext.skeleton, 2);
  if (skeletonDistance <= 1 && queryContext.skeleton.length >= 4) return 158;
  if (skeletonDistance <= 2 && queryContext.skeleton.length >= 6) return 132;

  if (compact.includes(queryContext.compact)) {
    const trailingLength = compact.length - queryContext.compact.length;
    return trailingLength <= 4 ? 146 : 92;
  }

  if (queryContext.relaxed && relaxed.includes(queryContext.relaxed)) return 88;
  if (queryContext.skeleton.length >= 4 && skeleton.includes(queryContext.skeleton)) return 82;

  return 0;
}

function realTitleScore(item, query) {
  const queryContext = buildQueryContext(query);
  if (!queryContext.normalized) return 1;
  return realTitleFields(item).reduce(
    (maxScore, value) => Math.max(maxScore, fieldMatchScore(value, queryContext), wholeTitleMatchScore(value, queryContext)),
    0,
  );
}

function searchTextScore(item, query) {
  const compact = normalizeCompact(query);
  const queryContext = buildQueryContext(query);
  if (!queryContext.normalized) return 1;
  const fields = searchableFields(item);
  const best = fields.reduce((maxScore, field) => {
    const score = fieldMatchScore(field.value, queryContext) * field.weight;
    return Math.max(maxScore, score);
  }, 0);
  const aggregate = aggregateFieldMatchScore(fields, queryContext);

  const aliasParts = uniqueValues([item.title, item.originalTitle, item.englishTitle, item.providerTitle, ...(item.aliases || [])]).flatMap(tokenizeSearch);
  const tokenPrefixBonus = aliasParts.some((part) => {
    const relaxedPart = relaxedCompact(part);
    const skeletonPart = searchSkeleton(part);
    return (
      (compact && part.startsWith(compact)) ||
      (queryContext.relaxed && relaxedPart.startsWith(queryContext.relaxed)) ||
      (queryContext.skeleton.length >= 3 && skeletonPart.startsWith(queryContext.skeleton))
    );
  })
    ? 26
    : 0;
  return Math.max(best, aggregate) + tokenPrefixBonus;
}

function queryMatchesItem(item, query) {
  const compact = normalizeCompact(query);
  if (!compact) return true;
  const textScore = searchTextScore(item, query);
  const titleScore = realTitleScore(item, query);
  const titleThreshold = compact.length <= 2 ? 42 : compact.length <= 4 ? 46 : compact.length <= 7 ? 50 : 44;
  const keywordThreshold = compact.length <= 2 ? 54 : compact.length <= 4 ? 60 : compact.length <= 7 ? 74 : 80;
  return titleScore >= titleThreshold || textScore >= keywordThreshold;
}

function searchQueryVariants(query) {
  const normalized = normalizeSearch(query);
  const compact = normalizeCompact(query);
  const stripped = stripLeadingArticles(query);
  const descriptorless = stripTitleDescriptors(query);
  const variants = [
    query.trim(),
    normalized,
    compact,
    stripped,
    normalizeCompact(stripped),
    descriptorless,
    normalizeCompact(descriptorless),
    relaxedCompact(query),
    searchSkeleton(query),
    titleInitials(query),
    ...spellingAlternates(query),
  ];
  tokenizeSearch(query).forEach((token) => {
    variants.push(token, ...spellingAlternates(token));
  });
  if (/^[a-z0-9]{2,10}$/i.test(compact)) variants.push(compact.split("").join("."));
  if (compact.length >= 5) variants.push(compact.slice(0, -1));
  if (compact.endsWith("l")) variants.push(`${compact}i`);
  if (compact.endsWith("i")) variants.push(compact.slice(0, -1));
  if (compact.includes("kgf")) variants.push(compact.replace(/kgf/g, "k.g.f"));
  return uniqueValues(variants)
    .filter((variant) => normalizeCompact(variant).length >= 2)
    .slice(0, SEARCH_REMOTE_VARIANT_LIMIT);
}

function usesPosterArtwork(item) {
  if (!item?.posterUrl) return false;
  if (!item.backdropUrl || item.backdropUrl === item.posterUrl) return true;
  return item.source === "IMDb" || item.source === "Wikidata";
}

function siteOrigin() {
  return location.origin || "https://flixdok.xyz";
}

function cleanRoutePath(path) {
  const value = String(path || "/");
  return value.endsWith("/") ? value : `${value}/`;
}

function slugify(value) {
  return normalizeSearch(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleSlug(item) {
  const base = slugify(item?.title || item?.originalTitle || item?.providerTitle || "");
  const year = item?.year ? `-${item.year}` : "";
  return `${base || "title"}${year}`;
}

function titlePath(itemOrId) {
  if (itemOrId && typeof itemOrId === "object" && itemOrId.title && itemOrId.type) {
    return cleanRoutePath(`/${itemOrId.type === "tv" ? "tv" : "movie"}/${titleSlug(itemOrId)}`);
  }
  const id = typeof itemOrId === "string" ? itemOrId : itemOrId?.id;
  return cleanRoutePath(`/title/${encodeURIComponent(id || "")}`);
}

function actorPath(name) {
  return cleanRoutePath(`/actor/${slugify(name)}`);
}

function collectionDefinition(view = state.view) {
  if (STATIC_COLLECTIONS[view]) return { key: view, ...STATIC_COLLECTIONS[view] };
  if (view?.startsWith("actor-")) {
    const slug = view.slice("actor-".length);
    const label = titleCaseFromSlug(slug);
    return {
      key: view,
      title: `${label} Movies & Shows`,
      subtitle: `Filmography, popular titles, and recommendations connected to ${label}`,
      path: `/actor/${slug}/`,
      actorSlug: slug,
      actorName: label,
    };
  }
  return null;
}

function titleCaseFromSlug(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function categoryPath(category) {
  return cleanRoutePath(collectionDefinition(category)?.path || `/category/${encodeURIComponent(category)}`);
}

function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

function currentReturnPath() {
  if (location.pathname.startsWith("/category/")) return cleanRoutePath(location.pathname);
  if (isCategoryView()) return categoryPath(state.view);
  return "/";
}

function compactDescription(value, fallback) {
  const text = String(value || fallback || "").replace(/\s+/g, " ").trim();
  if (text.length <= 160) return text;
  return `${text.slice(0, 157).replace(/\s+\S*$/, "")}...`;
}

function seoKeywords(values) {
  return uniqueValues(values)
    .slice(0, 18)
    .join(", ");
}

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement(selector.startsWith("link") ? "link" : "meta");
    const nameMatch = selector.match(/\[(name|property|rel)="([^"]+)"\]/);
    if (nameMatch) element.setAttribute(nameMatch[1], nameMatch[2]);
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

function updateStructuredData(data) {
  let script = document.getElementById("structuredData");
  if (!script) {
    script = document.createElement("script");
    script.id = "structuredData";
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function itemStructuredData(item, url) {
  const isTv = item.type === "tv";
  return {
    "@context": "https://schema.org",
    "@type": isTv ? "TVSeries" : "Movie",
    name: item.title,
    alternateName: uniqueValues([item.originalTitle, item.englishTitle, item.providerTitle, ...(item.aliases || [])]).filter((value) => value !== item.title),
    url,
    image: item.posterUrl || item.backdropUrl || undefined,
    description: item.overview || undefined,
    datePublished: item.year || undefined,
    genre: item.genres || undefined,
    actor: (item.cast || []).slice(0, 8).map((name) => ({ "@type": "Person", name })),
    aggregateRating: scoreValue(item)
      ? {
          "@type": "AggregateRating",
          ratingValue: Number(scoreValue(item)).toFixed(1),
          bestRating: "10",
        }
      : undefined,
  };
}

function updateSeoMeta(item = state.selected) {
  const baseDescription = "Search movies and TV shows on FlixDok with ratings, posters, watchlists, progress tracking, and episode selection.";
  let title = APP_NAME;
  let description = baseDescription;
  let path = "/";
  let image = "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg";
  let ogType = "website";
  let keywords = seoKeywords([APP_NAME, "movies", "TV shows", "watch movies", "movie ratings", "episode guide", "Bollywood movies", "Hollywood movies", "streaming search", "watchlist"]);
  let structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: absoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  if (state.page === "detail" && item?.title && item.title !== "Loading title...") {
    const media = mediaLabel(item.type);
    title = `${item.title} (${item.year || media}) - Watch ${media} on ${APP_NAME}`;
    description = compactDescription(item.overview, `Watch ${item.title} on ${APP_NAME}. View ratings, cast, posters, and ${item.type === "tv" ? "episodes" : "movie"} details.`);
    path = titlePath(item);
    image = item.backdropUrl || item.posterUrl || image;
    ogType = "video.other";
    keywords = seoKeywords([item.title, item.originalTitle, item.englishTitle, item.providerTitle, ...(item.aliases || []), media, item.year, ...(item.genres || []), ...(item.cast || []).slice(0, 6), APP_NAME]);
    structuredData = itemStructuredData(item, absoluteUrl(path));
  } else if (isCategoryView()) {
    const collection = collectionDefinition();
    title = `${categoryTitle()} - ${APP_NAME}`;
    description = compactDescription(`Browse ${categoryTitle().toLowerCase()} on ${APP_NAME} with ratings, posters, filters, recommendations, and watchlist support.`, baseDescription);
    path = categoryPath(state.view);
    keywords = seoKeywords([categoryTitle(), collection?.actorName, collection?.genre, collection?.region, "movies", "TV shows", "ratings", "posters", APP_NAME]);
    structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: categoryTitle(),
      url: absoluteUrl(path),
      description,
      about: collection?.actorName ? { "@type": "Person", name: collection.actorName } : undefined,
    };
  } else if (state.view === "movie") {
    title = `Movies - ${APP_NAME}`;
    description = `Browse movies on ${APP_NAME} with ratings, posters, watchlists, and search.`;
    path = "/movies/";
    keywords = seoKeywords(["movies", "watch movies", "movie ratings", "Hollywood movies", "Bollywood movies", APP_NAME]);
  } else if (state.view === "tv") {
    title = `TV Shows - ${APP_NAME}`;
    description = `Browse TV shows on ${APP_NAME} with seasons, episodes, ratings, posters, and search.`;
    path = "/tv-shows/";
    keywords = seoKeywords(["TV shows", "series", "episodes", "seasons", "episode guide", "watch TV shows", APP_NAME]);
  } else if (state.view === "watchlist") {
    title = `Watchlist - ${APP_NAME}`;
    description = `Your local ${APP_NAME} watchlist and continue watching progress.`;
    path = "/watchlist/";
    keywords = seoKeywords(["watchlist", "continue watching", "movie progress", "TV progress", APP_NAME]);
  } else if (state.query) {
    title = `Search results for "${state.query}" - ${APP_NAME}`;
    description = compactDescription(`Search results for ${state.query} on ${APP_NAME}. Find matching movies and TV shows with ratings and posters.`, baseDescription);
    keywords = seoKeywords([state.query, "movie search", "TV search", "streaming search", APP_NAME]);
  }

  document.title = title;
  setMeta('meta[name="description"]', { content: description });
  setMeta('meta[name="keywords"]', { content: keywords });
  setMeta('link[rel="canonical"]', { href: absoluteUrl(path) });
  setMeta('meta[property="og:site_name"]', { content: APP_NAME });
  setMeta('meta[property="og:title"]', { content: title });
  setMeta('meta[property="og:description"]', { content: description });
  setMeta('meta[property="og:type"]', { content: ogType });
  setMeta('meta[property="og:url"]', { content: absoluteUrl(path) });
  setMeta('meta[property="og:image"]', { content: absoluteUrl(image) });
  setMeta('meta[name="twitter:card"]', { content: "summary_large_image" });
  setMeta('meta[name="twitter:title"]', { content: title });
  setMeta('meta[name="twitter:description"]', { content: description });
  setMeta('meta[name="twitter:image"]', { content: absoluteUrl(image) });
  updateStructuredData(structuredData);
}

function debounce(fn, wait = 350) {
  let timeout;
  return (...args) => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), wait);
  };
}

function itemDisplayId(item) {
  const tmdbId = numericTmdbId(item.tmdbId);
  if (tmdbId) return `${item.type}-${tmdbId}`;
  if (item.imdbId) return `${item.type}-${item.imdbId}`;
  if (item.wikidataId) return `${item.type}-${item.wikidataId}`;
  if (item.tvmazeId) return `${item.type}-tvmaze-${item.tvmazeId}`;
  return `${item.type}-${normalizeSearch(item.title)}-${item.year || "unknown"}`;
}

function itemAliases(item) {
  const aliases = Array.isArray(item.aliases) ? item.aliases : [];
  const tmdbId = numericTmdbId(item.tmdbId);
  return [
    tmdbId ? `${item.type}:tmdb:${tmdbId}` : "",
    item.imdbId ? `${item.type}:imdb:${item.imdbId}` : "",
    item.wikidataId ? `${item.type}:wikidata:${item.wikidataId}` : "",
    item.tvmazeId ? `${item.type}:tvmaze:${item.tvmazeId}` : "",
    item.title ? `${item.type}:title:${normalizeSearch(item.title)}:${item.year || ""}` : "",
    item.originalTitle ? `${item.type}:original:${normalizeSearch(item.originalTitle)}:${item.year || ""}` : "",
    item.providerTitle ? `${item.type}:provider:${normalizeSearch(item.providerTitle)}:${item.year || ""}` : "",
    ...aliases.map((alias) => `${item.type}:alias:${normalizeSearch(alias)}:${item.year || ""}`),
  ].filter(Boolean);
}

function mergeItemData(existing, incoming) {
  if (!existing) return { ...incoming, id: itemDisplayId(incoming) };
  const merged = { ...existing, ...incoming };
  ["tmdbId", "posterUrl", "backdropUrl", "overview", "runtime", "imdbId", "wikidataId", "tvmazeId", "source", "originalTitle", "englishTitle", "providerTitle", "originalLanguage"].forEach((key) => {
    merged[key] = incoming[key] || existing[key] || "";
  });
  ["genres", "cast", "seasons", "episodes"].forEach((key) => {
    merged[key] = incoming[key]?.length ? incoming[key] : existing[key] || [];
  });
  merged.collections = uniqueValues([...(existing.collections || []), ...(incoming.collections || [])]);
  merged.aliases = uniqueValues([
    ...(existing.aliases || []),
    ...(incoming.aliases || []),
    existing.title,
    incoming.title,
    existing.originalTitle,
    incoming.originalTitle,
    existing.providerTitle,
    incoming.providerTitle,
  ]);
  merged.searchAliases = uniqueValues([...(existing.searchAliases || []), ...(incoming.searchAliases || [])]);
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
  const collection = collectionDefinition();
  let items = state.items;

  if (query) {
    items = items.filter((item) => queryMatchesItem(item, query));
    return items;
  }

  if (collection) {
    items = categoryBaseItems(collection);
  } else if (state.view === "watchlist") {
    const saved = new Set(state.profile.watchlist);
    items = items.filter((item) => saved.has(item.id));
  } else if (state.view === "movie" || state.view === "tv") {
    items = items.filter((item) => item.type === state.view);
  }

  if (state.filter !== "all") {
    items = items.filter((item) => item.type === state.filter);
  }

  if (collection) {
    const categorySearch = state.categoryQuery.trim();
    if (categorySearch) items = items.filter((item) => queryMatchesItem(item, categorySearch));
    if (state.categoryGenre !== "all") {
      items = items.filter((item) => (item.genres || []).some((genre) => normalizeSearch(genre) === state.categoryGenre));
    }
  }

  return items;
}

function itemMatchesActiveScope(item) {
  if (!item) return false;
  const collection = collectionDefinition();
  if (collection) return categoryItemMatches(item, collection);
  if (state.view === "movie" || state.view === "tv") return item.type === state.view;
  if (state.filter !== "all") return item.type === state.filter;
  return true;
}

function isCategoryView(view = state.view) {
  return Boolean(collectionDefinition(view));
}

function categoryRegionForView(view = state.view) {
  return collectionDefinition(view)?.region || "";
}

function categoryTitle(view = state.view) {
  return collectionDefinition(view)?.title || "";
}

function categoryItemMatches(item, collection = collectionDefinition()) {
  if (!item || !collection) return false;
  if (item.collections?.includes(collection.key)) return true;
  if (collection.type && item.type !== collection.type) return false;
  if (collection.region && item.region !== collection.region) return false;
  if (collection.genre && !(item.genres || []).some((genre) => normalizeSearch(genre) === normalizeSearch(collection.genre))) return false;
  if (collection.actorName && !(item.cast || []).some((person) => normalizeSearch(person) === normalizeSearch(collection.actorName))) return false;
  return Boolean(collection.region || collection.genre || collection.actorName || collection.key);
}

function categoryBaseItems(collection = collectionDefinition()) {
  if (!collection) return [];
  return state.items.filter((item) => categoryItemMatches(item, collection));
}

function displayItems(items = getVisibleItems()) {
  if (!isCategoryView()) return items;
  return sortCategoryItems(items);
}

function sortCategoryItems(items) {
  const mode = state.categorySort;
  const tab = state.categoryTab;
  return [...items].sort((a, b) => {
    if (mode === "title") return a.title.localeCompare(b.title);
    if (mode === "newest" || (mode === "featured" && tab === "recent")) {
      return Number(b.year || 0) - Number(a.year || 0) || scoreValue(b) - scoreValue(a);
    }
    if (mode === "rating" || (mode === "featured" && tab === "top-rated")) {
      return scoreValue(b) - scoreValue(a) || Number(b.year || 0) - Number(a.year || 0);
    }
    return scoreValue(b) * 12 + Number(b.year || 0) / 8 - (scoreValue(a) * 12 + Number(a.year || 0) / 8);
  });
}

function applyTheme() {
  document.documentElement.style.setProperty("--accent", state.profile.accent || DEFAULT_PROFILE.accent);
  els.profileName.textContent = state.profile.name || APP_NAME;
  els.profileAvatar.textContent = (state.profile.name || APP_NAME).trim().slice(0, 1).toUpperCase();
}

function render() {
  applyTheme();
  setActiveNav();
  setActiveFilter();
  els.clearSearch.classList.toggle("is-visible", Boolean(state.query));

  const rawVisible = getVisibleItems();
  const visible = displayItems(rawVisible);
  const showBrowse = Boolean(state.query) || state.view !== "home";
  const categoryMode = isCategoryView();
  const gridItems = categoryMode ? visible.slice(0, state.categoryLimit) : visible;

  if (state.page === "detail" && state.selected) {
    els.homeScreen.hidden = true;
    els.quickHelp.hidden = true;
    els.detailPanel.hidden = false;
    updateSeoMeta(state.selected);
    renderDetail(state.selected);
    return;
  }

  els.homeScreen.hidden = false;
  els.quickHelp.hidden = true;
  els.detailPanel.hidden = true;
  updateSeoMeta(state.selected);
  if (!state.selected || !visible.some((item) => item.id === state.selected.id)) {
    state.selected = featuredItem(visible) || state.items[0] || null;
  }

  const heroItem = featuredItem(visible) || state.selected;
  if (!showBrowse && heroItem) state.selected = heroItem;
  renderHero(heroItem);
  renderContinue();
  renderRails(showBrowse ? [] : visible);
  renderCategoryTools(categoryMode ? visible : []);
  renderGrid(showBrowse ? gridItems : []);
  renderCategoryMore(categoryMode ? visible.length : 0);
  renderHeadings(visible.length);

  els.railArea.hidden = showBrowse;
  els.browseBlock.hidden = !showBrowse;
  els.hero.classList.toggle("is-search-mode", Boolean(state.query));
  els.hero.classList.toggle("is-poster-art", usesPosterArtwork(heroItem));
  const loadingCollection = isCategoryView() && state.collectionLoading[state.view];
  els.emptyState.hidden = visible.length > 0 || state.isSearching || loadingCollection;
  if (!visible.length) {
    els.emptyState.innerHTML = `<strong>No titles found</strong><span>Try another search or clear the current filter.</span>`;
  }
}

function renderHeadings(count) {
  const titleMap = {
    home: state.query ? "Search results" : `Featured on ${APP_NAME}`,
    movie: state.query ? "Movie results" : "Movies",
    tv: state.query ? "TV results" : "TV Shows",
    watchlist: "Your watchlist",
    bollywood: "Bollywood Movies",
    hollywood: "Hollywood Movies",
  };
  els.sectionTitle.textContent = titleMap[state.view] || categoryTitle() || `Featured on ${APP_NAME}`;
  els.eyebrow.textContent = state.isSearching
    ? "Searching"
    : state.query
      ? "Search results"
      : isCategoryView()
        ? "Curated library"
        : "Ready to watch";
  els.resultCount.textContent = `${count} ${count === 1 ? "title" : "titles"}`;
}

function featuredItem(items) {
  const candidates = sortedByScore(items).filter((item) => item.backdropUrl && !usesPosterArtwork(item));
  if (!state.query && state.view === "home" && candidates.length) {
    return candidates[state.heroIndex % candidates.length];
  }
  return candidates[0] || items[0] || null;
}

function scoreValue(item) {
  return Number(item.imdbRating || item.omdbRating || item.rating || 0);
}

function sortedByScore(items) {
  return [...items].sort((a, b) => scoreValue(b) - scoreValue(a) || Number(b.year || 0) - Number(a.year || 0));
}

function sortedByYear(items) {
  return [...items].sort((a, b) => Number(b.year || 0) - Number(a.year || 0) || scoreValue(b) - scoreValue(a));
}

function renderHero(item) {
  if (!item) {
    els.hero.innerHTML = "";
    state.heroItemId = "";
    return;
  }

  state.heroItemId = item.id;
  const heroImage = usesPosterArtwork(item) ? item.posterUrl : item.backdropUrl || item.posterUrl;
  els.hero.style.setProperty("--hero-image", `url("${heroImage}")`);
  els.hero.classList.toggle("is-poster-art", usesPosterArtwork(item));
  const genres = (item.genres || []).slice(0, 3);
  const canPlay = hasPlayableId(item);
  const canAttemptPlay = canPlay || (!item.providerChecked && Boolean(item.imdbId || item.title));
  els.hero.innerHTML = `
    <div class="hero-inner">
      <p class="kicker">${safeText(mediaLabel(item.type))}</p>
      <h2>${safeText(item.title)}</h2>
      <p class="hero-overview">${safeText(item.overview || "No overview is available yet.")}</p>
      <div class="meta-row">
        <span class="rating-pill">${safeText(scoreLabel(item))}</span>
        <span class="pill">${safeText(itemYear(item))}</span>
        ${item.runtime ? `<span class="pill">${safeText(item.runtime)}</span>` : ""}
        ${genres.map((genre) => `<span class="pill">${safeText(genre)}</span>`).join("")}
      </div>
      <div class="hero-actions">
        <button class="primary-button" type="button" data-action="play" data-id="${safeText(item.id)}" ${canAttemptPlay ? "" : "disabled"}>
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          ${canAttemptPlay ? "Play" : "Not Available"}
        </button>
        <button class="secondary-button" type="button" data-action="open-title" data-id="${safeText(item.id)}">
          <svg viewBox="0 0 24 24"><path d="M12 5h.01M12 9v10"/></svg>
          Details
        </button>
        <button class="secondary-button" type="button" data-action="toggle-watchlist" data-id="${safeText(item.id)}">
          <svg viewBox="0 0 24 24"><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21z"/></svg>
          ${isWatchlisted(item) ? "Saved" : "Watchlist"}
        </button>
      </div>
    </div>
  `;
}

function transitionHeroTo(item) {
  if (!item || state.heroTransitioning || state.heroItemId === item.id) return;
  state.heroTransitioning = true;
  state.selected = item;
  els.hero.classList.add("is-transitioning");

  window.setTimeout(() => {
    renderHero(item);
    els.hero.classList.remove("is-transitioning");
    els.hero.classList.add("is-entering");

    window.setTimeout(() => {
      els.hero.classList.remove("is-entering");
      state.heroTransitioning = false;
    }, 460);
  }, 220);
}

function collectionItems(key, fallback = []) {
  const tagged = state.items.filter((item) => item.collections?.includes(key));
  return tagged.length ? tagged : fallback;
}

function genreItems(pattern, type = "") {
  return state.items.filter((item) => (!type || item.type === type) && (item.genres || []).some((genre) => pattern.test(genre)));
}

function renderRails(items) {
  if (!items.length) {
    els.railArea.innerHTML = "";
    return;
  }

  const allItems = sortedByScore(state.items);
  const movieItems = state.items.filter((item) => item.type === "movie");
  const tvItems = state.items.filter((item) => item.type === "tv");
  const hollywoodItems = sortedByScore(movieItems.filter((item) => item.region === "Hollywood"));
  const bollywoodItems = sortedByScore(movieItems.filter((item) => item.region === "Bollywood"));
  const sciFiItems = sortedByScore(state.items.filter((item) => (item.genres || []).some((genre) => /sci-fi|mystery|thriller/i.test(genre))));
  const actionItems = sortedByScore(collectionItems("genre-action", genreItems(/action|adventure|thriller/i, "movie")));
  const comedyItems = sortedByScore(collectionItems("genre-comedy", genreItems(/comedy/i, "movie")));
  const animeItems = sortedByScore(collectionItems("genre-anime", genreItems(/animation|anime/i)));
  const trendingItems = sortedByScore([...collectionItems("trending-movies"), ...collectionItems("trending-tv")]);
  const latestMovies = sortedByYear(collectionItems("latest-movies", movieItems));
  const latestTv = sortedByYear(collectionItems("latest-tv", tvItems));
  const recentlyAdded = sortedByYear(collectionItems("recently-added", state.items));
  const topRatedItems = sortedByScore([...collectionItems("top-rated-movies"), ...collectionItems("top-rated-tv")]);
  const watchlistItems = state.items.filter((item) => isWatchlisted(item));
  const sections = [
    {
      key: "top-10",
      title: "Top 10 Today",
      subtitle: "Highest rated picks across movies and shows",
      items: allItems.slice(0, 10),
      card: "poster",
      ranked: true,
    },
    {
      key: "trending-today",
      title: "Trending Today",
      subtitle: "Fresh titles people are opening right now",
      items: (trendingItems.length ? trendingItems : sortedByYear(items)).slice(0, 18),
      card: "wide",
    },
    {
      key: "recently-added",
      title: "Recently Added",
      subtitle: "Newer titles and fresh discoveries from the live catalog",
      items: recentlyAdded.slice(0, 18),
      card: "poster",
    },
    {
      key: "latest-movies",
      title: "Latest Movies",
      subtitle: "Recent films pulled into the library",
      items: latestMovies.slice(0, 18),
      card: "wide",
      category: "hollywood",
    },
    {
      key: "latest-tv",
      title: "Latest TV & New Episodes",
      subtitle: "Shows with recent seasons and episode tracking",
      items: latestTv.slice(0, 18),
      card: "wide",
    },
    {
      key: "bollywood",
      title: "Bollywood Movies",
      subtitle: "High-energy Indian cinema ready to open",
      items: sortedByScore(collectionItems("bollywood", bollywoodItems)).slice(0, 18),
      card: "poster",
      category: "bollywood",
    },
    {
      key: "hollywood",
      title: "Hollywood Movies",
      subtitle: "Big-screen favorites and modern blockbusters",
      items: sortedByScore(collectionItems("hollywood", hollywoodItems)).slice(0, 18),
      card: "wide",
      category: "hollywood",
    },
    {
      key: "action",
      title: "Action Hits",
      subtitle: "High-impact picks, chases, missions, and spectacle",
      items: actionItems.slice(0, 18),
      card: "poster",
      category: "genre-action",
    },
    {
      key: "comedy",
      title: "Comedy Picks",
      subtitle: "Lighter movies for an easy night",
      items: comedyItems.slice(0, 18),
      card: "poster",
      category: "genre-comedy",
    },
    {
      key: "anime",
      title: "Anime & Animation",
      subtitle: "Animated stories with strong binge energy",
      items: animeItems.slice(0, 18),
      card: "wide",
      category: "genre-anime",
    },
    {
      key: "binge-tv",
      title: "Binge-Worthy TV",
      subtitle: "Shows with seasons and episode selection",
      items: sortedByScore(tvItems).slice(0, 18),
      card: "wide",
    },
    {
      key: "mind-bending",
      title: "Mind-Bending Picks",
      subtitle: "Sci-fi, mystery, and late-night rabbit holes",
      items: sciFiItems.slice(0, 18),
      card: "poster",
    },
    {
      key: "top-rated",
      title: "Top Rated",
      subtitle: "The strongest picks across the whole catalog",
      items: (topRatedItems.length ? topRatedItems : allItems).slice(0, 18),
      card: "compact",
    },
  ];

  if (watchlistItems.length) {
    sections.splice(1, 0, {
      key: "saved",
      title: "Saved for Later",
      subtitle: `${watchlistItems.length} ${watchlistItems.length === 1 ? "title" : "titles"} in your watchlist`,
      items: watchlistItems.slice(0, 12),
      card: "poster",
    });
  }

  els.railArea.innerHTML = sections
    .filter((section) => section.items.length)
    .map(renderRail)
    .join("");
}

function renderRail(section) {
  const railId = `rail-${normalizeCompact(section.key || section.title)}`;
  const cardClass = `${section.card === "wide" ? "is-wide" : ""} ${section.card === "compact" ? "is-compact-row" : ""}`;
  return `
    <section class="media-rail">
      <div class="rail-head">
        <div>
          <h2>${safeText(section.title)}</h2>
          <p>${safeText(section.subtitle)}</p>
        </div>
        <div class="rail-actions">
          ${
            section.category
              ? `<button class="text-button see-more-button" type="button" data-action="category-page" data-category="${safeText(section.category)}">See More</button>`
              : ""
          }
          <button class="rail-arrow" type="button" data-action="rail-scroll" data-target="${safeText(railId)}" data-direction="-1" aria-label="Scroll ${safeText(section.title)} left">
            <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button class="rail-arrow" type="button" data-action="rail-scroll" data-target="${safeText(railId)}" data-direction="1" aria-label="Scroll ${safeText(section.title)} right">
            <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
      <div class="rail-track ${cardClass}" id="${safeText(railId)}" data-drag-scroll>
        ${section.items
          .map((item, index) =>
            renderMediaCard(item, {
              rank: section.ranked ? index + 1 : 0,
              wide: section.card === "wide",
              compact: section.card === "compact",
            }),
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderMediaCard(item, opts = {}) {
  const artwork = opts.wide ? item.backdropUrl || item.posterUrl : item.posterUrl || item.backdropUrl;
  const progress = playbackProgress(item);
  const meta = [item.runtime, itemYear(item), mediaLabel(item.type)].filter(Boolean).join(" / ");
  const subline = (item.genres || []).slice(0, 2).join(" / ") || meta;
  const posterSourceClass = opts.wide && usesPosterArtwork(item) ? "is-poster-source" : "";
  const href = titlePath(item);
  return `
    <a class="media-card ${opts.wide ? "is-wide" : ""} ${opts.compact ? "is-compact" : ""} ${posterSourceClass}" href="${safeText(href)}" data-action="open-title" data-id="${safeText(item.id)}">
      <span class="media-art">
        ${artwork ? `<img src="${safeText(artwork)}" alt="${safeText(item.title)} artwork" loading="lazy" />` : ""}
        ${opts.rank ? `<span class="rank-badge">#${String(opts.rank).padStart(2, "0")}</span>` : ""}
        <span class="media-overlay-meta">
          <b>${safeText(scoreLabel(item))}</b>
          <span>${safeText(meta)}</span>
        </span>
        <span class="quick-play" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </span>
        ${progress ? progressMarkup(progress, "art-progress") : ""}
      </span>
      <span class="media-card-copy">
        <strong>${safeText(item.title)}</strong>
        <span>${safeText(subline)}</span>
      </span>
    </a>
  `;
}

function renderGrid(items) {
  const isSearch = Boolean(state.query);
  els.posterGrid.classList.toggle("search-results", isSearch);
  if ((state.isSearching || (isCategoryView() && state.collectionLoading[state.view])) && !items.length) {
    els.posterGrid.innerHTML = renderSkeletonCards(isSearch ? 4 : 8);
    return;
  }
  els.posterGrid.innerHTML = items
    .map(
      (item) => {
        const status = providerStatus(item);
        const statusClass = hasPlayableId(item) ? "is-ready" : item.imdbId && !item.providerChecked ? "is-pending" : "is-unavailable";
        const source = item.source || APP_NAME;
        const progress = playbackProgress(item);
        const href = titlePath(item);
        return `
      <a class="poster-card ${isSearch ? "search-card" : ""} ${state.selected?.id === item.id ? "is-selected" : ""}" href="${safeText(href)}" data-action="open-title" data-id="${safeText(item.id)}">
        <span class="poster-art">
          ${item.posterUrl ? `<img src="${safeText(item.posterUrl)}" alt="${safeText(item.title)} poster" loading="lazy" />` : ""}
          <span class="poster-badge">${safeText(scoreLabel(item))}</span>
          <span class="poster-overlay">
            <span>${safeText(item.runtime || itemYear(item))}</span>
            <span>${safeText(mediaLabel(item.type))}</span>
          </span>
          <span class="quick-play" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </span>
          ${progress ? progressMarkup(progress, "art-progress") : ""}
        </span>
        <span class="card-body">
          <h3>${safeText(item.title)}</h3>
          <span class="card-meta">
            <span>${safeText(itemYear(item))}</span>
            <span>${safeText(mediaLabel(item.type))}</span>
            ${isSearch ? `<span>${safeText(source)}</span>` : ""}
          </span>
          ${isSearch ? `<span class="result-status ${statusClass}">${safeText(status)}</span>` : ""}
          ${isSearch && item.overview ? `<span class="card-overview">${safeText(item.overview)}</span>` : ""}
          ${progress ? progressMarkup(progress, "card-progress") : ""}
        </span>
      </a>
    `;
      },
    )
    .join("");
}

function renderCategoryTools(items) {
  if (!isCategoryView()) {
    els.categoryTools.hidden = true;
    els.categoryTools.innerHTML = "";
    return;
  }

  const collection = collectionDefinition();
  const genreMap = new Map();
  categoryBaseItems(collection)
    .flatMap((item) => item.genres || [])
    .filter(Boolean)
    .forEach((genre) => genreMap.set(normalizeSearch(genre), genre));
  const genres = Array.from(genreMap, ([value, label]) => ({ value, label }));
  const genreOptions = genres
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((genre) => `<option value="${safeText(genre.value)}" ${state.categoryGenre === genre.value ? "selected" : ""}>${safeText(genre.label)}</option>`)
    .join("");
  const tabs = [
    ["trending", "Trending"],
    ["recent", "Recent"],
    ["top-rated", "Top Rated"],
  ];

  els.categoryTools.hidden = false;
  els.categoryTools.innerHTML = `
    <div class="category-tabs" role="tablist" aria-label="${safeText(categoryTitle())} tabs">
      ${tabs
        .map(
          ([tab, label]) =>
            `<button class="${state.categoryTab === tab ? "is-active" : ""}" type="button" role="tab" aria-selected="${state.categoryTab === tab}" data-action="category-tab" data-tab="${tab}">${label}</button>`,
        )
        .join("")}
    </div>
    <div class="category-fields">
      <label>
        <span>Search this page</span>
        <input id="categorySearch" value="${safeText(state.categoryQuery)}" placeholder="Search ${safeText(collection?.title || "this collection")}" />
      </label>
      <label>
        <span>Genre</span>
        <select id="categoryGenreSelect">
          <option value="all">All genres</option>
          ${genreOptions}
        </select>
      </label>
      <label>
        <span>Sort</span>
        <select id="categorySortSelect">
          <option value="featured" ${state.categorySort === "featured" ? "selected" : ""}>Featured</option>
          <option value="rating" ${state.categorySort === "rating" ? "selected" : ""}>Highest rated</option>
          <option value="newest" ${state.categorySort === "newest" ? "selected" : ""}>Newest first</option>
          <option value="title" ${state.categorySort === "title" ? "selected" : ""}>A to Z</option>
        </select>
      </label>
    </div>
    <p class="category-note">${items.length} ${items.length === 1 ? "title" : "titles"} matched your filters.</p>
  `;
}

function renderCategoryMore(total) {
  if (!isCategoryView() || total <= state.categoryLimit) {
    els.categoryMore.hidden = true;
    els.categoryMore.innerHTML = "";
    return;
  }

  const remaining = total - state.categoryLimit;
  els.categoryMore.hidden = false;
  els.categoryMore.innerHTML = `
    <button class="secondary-button" type="button" data-action="category-more">
      Show ${Math.min(CATEGORY_PAGE_SIZE, remaining)} more
    </button>
  `;
}

function renderSkeletonCards(count = 8) {
  return Array.from(
    { length: count },
    () => `
      <span class="skeleton-card" aria-hidden="true">
        <span></span>
        <b></b>
        <i></i>
      </span>
    `,
  ).join("");
}

function recommendationItems(item, limit = 12, options = {}) {
  if (!item) return [];
  const itemGenreKeys = new Set((item.genres || []).map(normalizeSearch));
  const itemActors = new Set((item.cast || []).slice(0, 8).map(normalizeSearch));
  const preferredType = options.sameType ? item.type : "";
  return state.items
    .filter((candidate) => candidate.id !== item.id)
    .map((candidate) => {
      const genreOverlap = (candidate.genres || []).filter((genre) => itemGenreKeys.has(normalizeSearch(genre))).length;
      const actorOverlap = (candidate.cast || []).filter((person) => itemActors.has(normalizeSearch(person))).length;
      const typeBoost = candidate.type === item.type ? 2 : 0;
      const regionBoost = candidate.region && candidate.region === item.region ? 1.4 : 0;
      const collectionBoost = (candidate.collections || []).some((key) => (item.collections || []).includes(key)) ? 1 : 0;
      const typePenalty = preferredType && candidate.type !== preferredType ? -10 : 0;
      return {
        item: candidate,
        score: scoreValue(candidate) + genreOverlap * 3 + actorOverlap * 2.2 + typeBoost + regionBoost + collectionBoost + typePenalty,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.item.year || 0) - Number(a.item.year || 0))
    .slice(0, limit)
    .map((entry) => entry.item);
}

function genreCollectionKey(genre) {
  const key = normalizeSearch(genre);
  if (key === "action" || key === "adventure" || key === "thriller") return "genre-action";
  if (key === "comedy") return "genre-comedy";
  if (key === "animation" || key === "anime") return "genre-anime";
  return "";
}

function detailFactList(item, seasonCount, episodeCount) {
  return [
    ["Type", mediaLabel(item.type)],
    ["Released", itemYear(item)],
    ["Runtime", item.runtime],
    ["Genres", (item.genres || []).slice(0, 4).join(", ")],
    ["Rating", scoreLabel(item)],
    item.type === "tv" ? ["Episodes", `${episodeCount} episodes across ${seasonCount} seasons`] : null,
  ].filter((entry) => entry && entry[1]);
}

function trailerSearchUrl(item) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${item.title} ${item.year || ""} official trailer`)}`;
}

function renderDetail(item) {
  if (!item) {
    els.detailPanel.innerHTML = `<div class="panel-empty">Select a title</div>`;
    return;
  }

  const watchText = isWatchlisted(item) ? "Saved" : "Add to Watchlist";
  const canPlay = hasPlayableId(item);
  const canAttemptPlay = canPlay || (!item.providerChecked && Boolean(item.imdbId || item.title));
  const isResolvingProvider = !canPlay && Boolean(item.imdbId) && state.detailLoadingId === item.id;
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
  const people = (item.cast || []).slice(0, 10);
  const ratings = [
    item.rating ? `TMDB ${Number(item.rating).toFixed(1)}` : "",
    item.imdbRating ? `IMDb ${Number(item.imdbRating).toFixed(1)}` : "",
    item.omdbRating ? `OMDb ${item.omdbRating}` : "",
  ].filter(Boolean);
  const heroImage = usesPosterArtwork(item) ? item.posterUrl : item.backdropUrl || item.posterUrl;
  const similar = recommendationItems(item, 12);
  const sameTypeRecommendations = recommendationItems(item, 12, { sameType: true });
  const facts = detailFactList(item, seasonCount, episodeCount);
  const linkedGenres = (item.genres || [])
    .map((genre) => ({ genre, key: genreCollectionKey(genre) }))
    .filter((entry) => entry.key)
    .slice(0, 3);
  const titlePhrase = `${item.title}${item.year ? ` (${item.year})` : ""}`;
  const overviewText =
    item.overview ||
    `${titlePhrase} is available in the FlixDok catalog with ratings, posters, watchlist support, and ${item.type === "tv" ? "episode details" : "movie details"}.`;

  els.detailPanel.style.setProperty("--detail-image", `url("${heroImage}")`);
  els.detailPanel.innerHTML = `
    <button class="floating-back" type="button" data-action="back">
      <svg viewBox="0 0 24 24"><path d="M15 18 9 12l6-6"/></svg>
      Back
    </button>
    <section class="title-hero">
      <div class="title-copy">
        <p class="kicker">${safeText(mediaLabel(item.type))}</p>
        <h1>${safeText(item.title)}</h1>
        <div class="title-meta">
          ${ratings.length ? ratings.map((rating) => `<span><b>${safeText(rating)}</b></span>`).join("") : `<span><b>${safeText(scoreLabel(item))}</b></span>`}
          <span>${safeText(itemYear(item))}</span>
          ${item.runtime ? `<span>${safeText(item.runtime)}</span>` : ""}
          ${(item.genres || []).slice(0, 3).map((genre) => `<span>${safeText(genre)}</span>`).join("")}
        </div>
        <p class="overview">${safeText(overviewText)}</p>
        <div class="hero-actions">
          <button class="primary-button" type="button" data-action="play" data-id="${safeText(item.id)}" ${canAttemptPlay ? "" : "disabled"}>
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            ${canPlay || canAttemptPlay ? (isResolvingProvider ? "Checking..." : "Play") : "Not Available"}
          </button>
          <a class="secondary-button" href="${safeText(trailerSearchUrl(item))}" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z"/><path d="m10 9 5 3-5 3z"/></svg>
            Trailer
          </a>
          <button class="secondary-button" type="button" data-action="toggle-watchlist" data-id="${safeText(item.id)}">
            <svg viewBox="0 0 24 24"><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21z"/></svg>
            ${safeText(watchText)}
          </button>
        </div>
      </div>
      <aside class="title-poster">
        ${item.posterUrl ? `<img src="${safeText(item.posterUrl)}" alt="${safeText(item.title)} poster" />` : ""}
      </aside>
    </section>
    <section class="detail-section detail-copy-grid">
      <article class="detail-copy-card">
        <p class="kicker">About ${safeText(mediaLabel(item.type))}</p>
        <h2>${safeText(titlePhrase)}</h2>
        <p>${safeText(overviewText)}</p>
        <p>${safeText(`${APP_NAME} tracks ${item.type === "tv" ? "season progress, episode selection" : "watch progress"}, ratings, cast details, similar titles, and watchlist status locally in your browser.`)}</p>
      </article>
      <aside class="detail-facts" aria-label="${safeText(item.title)} facts">
        ${facts.map(([label, value]) => `<span><b>${safeText(label)}</b><strong>${safeText(value)}</strong></span>`).join("")}
      </aside>
    </section>
    ${
      linkedGenres.length
        ? `
      <section class="detail-section">
        <div class="section-heading compact"><h2>Explore by genre</h2></div>
        <div class="detail-link-list">
          ${linkedGenres
            .map(
              ({ genre, key }) => `
              <a href="${safeText(categoryPath(key))}" data-action="category-page" data-category="${safeText(key)}">
                ${safeText(genre)}
              </a>
            `,
            )
            .join("")}
        </div>
      </section>
    `
        : ""
    }
    ${
      item.type === "tv"
        ? `
      <section class="detail-section">
        <div class="section-heading compact">
          <h2>Episodes</h2>
          <span>${safeText(`${seasonCount} ${seasonCount === 1 ? "season" : "seasons"} / ${episodeCount} ${episodeCount === 1 ? "episode" : "episodes"}`)}</span>
        </div>
        ${
          canPlay
            ? `
          <p class="episode-summary ${isLoadingEpisodes ? "is-refreshing" : ""}">
            ${safeText(isLoadingEpisodes ? "Checking latest season list..." : `Choose a season, then click an episode to play.`)}
          </p>
          <div class="episode-grid">
            <label>
              <span>Season</span>
              <select id="seasonSelect">
                ${episodeModel.map((entry) => `<option value="${entry.number}" ${entry.number === selectedSeason ? "selected" : ""}>Season ${entry.number}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="episode-list">
            ${episodeOptions
              .slice(0, 16)
              .map(
                (ep) => `
                <button class="episode-card ${ep.number === selectedEpisode ? "is-active" : ""}" type="button" data-action="play-episode" data-id="${safeText(item.id)}" data-season="${selectedSeason}" data-episode="${ep.number}">
                  <span>Episode ${ep.number}</span>
                  <strong>${safeText(ep.name || `Season ${selectedSeason}, Episode ${ep.number}`)}</strong>
                  <small>${canPlay ? "Play episode" : "Not available"}</small>
                </button>
              `,
              )
              .join("")}
          </div>
        `
            : `
          <p class="manual-help">Not available yet. This title needs a provider ID before playback can open.</p>
        `
        }
      </section>
    `
        : ""
    }
    ${
      people.length
        ? `
      <section class="detail-section">
        <div class="section-heading compact"><h2>Cast</h2></div>
        <div class="cast-list">${people
          .map(
            (person) => `
            <a href="${safeText(actorPath(person))}" data-action="category-page" data-category="actor-${safeText(slugify(person))}">
              ${safeText(person)}
            </a>
          `,
          )
          .join("")}</div>
      </section>
    `
        : ""
    }
    ${
      similar.length
        ? `
      <section class="detail-section">
        <div class="section-heading compact"><h2>More like this</h2></div>
        <div class="rail-track is-wide">${similar.map((candidate) => renderMediaCard(candidate, { wide: true })).join("")}</div>
      </section>
    `
        : ""
    }
    ${
      sameTypeRecommendations.length
        ? `
      <section class="detail-section">
        <div class="section-heading compact"><h2>Because you watched ${safeText(item.title)}</h2></div>
        <div class="rail-track">${sameTypeRecommendations.map((candidate) => renderMediaCard(candidate, { compact: true })).join("")}</div>
      </section>
    `
        : ""
    }
  `;

  const seasonSelect = document.getElementById("seasonSelect");
  if (seasonSelect) {
    seasonSelect.addEventListener("change", () => {
      state.currentSeason = Number(seasonSelect.value);
      const nextSeason = getEpisodeModel(item).find((entry) => entry.number === state.currentSeason);
      state.currentEpisode = nextSeason?.episodes?.[0]?.number || 1;
      renderDetail(item);
    });
  }
}

function renderContinue() {
  const entries = state.profile.continueWatching
    .map((entry) => ({ entry, item: findItem(entry.id) }))
    .filter(({ item }) => item)
    .filter(({ item }) => itemMatchesActiveScope(item))
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
  if (!id) return null;
  return (
    state.items.find((item) => item.id === id) ||
    state.searchCache.get(id) ||
    SEED_TITLES.map(normalizeSeed).find((item) => item.id === id) ||
    null
  );
}

function slugCandidates(item) {
  return uniqueValues([
    titleSlug(item),
    slugify(item.title),
    slugify(item.originalTitle),
    slugify(item.providerTitle),
    ...(item.aliases || []).map((alias) => slugify(alias)),
  ]);
}

function findItemBySlug(type, slug) {
  const mediaType = type === "tv" ? "tv" : "movie";
  const allItems = mergeItems(state.items, SEED_TITLES.map(normalizeSeed), Array.from(state.searchCache.values()));
  return allItems.find((item) => item.type === mediaType && slugCandidates(item).includes(slug)) || null;
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

function remapStoredItemId(oldId, newId) {
  if (!oldId || !newId || oldId === newId) return;
  let changed = false;
  state.profile.watchlist = state.profile.watchlist.map((id) => {
    if (id !== oldId) return id;
    changed = true;
    return newId;
  });
  state.profile.continueWatching = state.profile.continueWatching.map((entry) => {
    if (entry.id !== oldId) return entry;
    changed = true;
    return { ...entry, id: newId };
  });
  if (changed) saveProfile();
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
  const id = providerId(item);
  const base =
    item.type === "tv"
      ? `${VIDKING_BASE}/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`
      : `${VIDKING_BASE}/movie/${encodeURIComponent(id)}`;

  const params = new URLSearchParams();
  params.set("color", cleanHex(state.profile.playerColor));
  params.set("autoPlay", "true");
  params.set("autoplay", "true");
  params.set("auto_play", "true");
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
  const metaText =
    item.type === "tv"
      ? `Season ${season}, Episode ${episode}${episodeName ? ` - ${episodeName}` : ""}`
      : `${itemYear(item)} movie`;
  els.playerMeta.textContent = metaText;
  if (els.playerShieldTitle) els.playerShieldTitle.textContent = item.title;
  if (els.playerShieldMeta) els.playerShieldMeta.textContent = metaText;
  const seasonSelect = els.playerControls.querySelector('select[aria-label="Season"]');
  const episodeSelect = els.playerControls.querySelector('select[aria-label="Episode"]');
  if (seasonSelect) seasonSelect.value = String(season);
  if (episodeSelect) episodeSelect.value = String(episode);
}

function notePlayerSignal() {
  state.lastPlayerSignalAt = Date.now();
  state.playerRecoveryCount = 0;
}

function setPlayerSource(url) {
  state.activePlayerUrl = url;
  state.playerLoadStartedAt = Date.now();
  state.lastPlayerSignalAt = Date.now();
  state.playerRecoveryCount = 0;
  els.playerFrame.src = url;
}

function attemptPlayerRecovery(reason = "player recovery") {
  if (els.playerOverlay.hidden || !state.activePlayerUrl) return;
  const now = Date.now();
  if (now - state.lastPlayerRecoveryAt < PLAYER_RECOVERY_COOLDOWN_MS) return;
  if (state.playerRecoveryCount >= 3) return;

  state.lastPlayerRecoveryAt = now;
  state.playerRecoveryCount += 1;
  const recoveryUrl = new URL(state.activePlayerUrl);
  recoveryUrl.searchParams.set("fdRecovery", String(now));
  console.warn(`FlixDok ${reason}; reloading player frame`);
  els.playerFrame.src = "about:blank";
  window.setTimeout(() => {
    if (!els.playerOverlay.hidden) els.playerFrame.src = recoveryUrl.toString();
  }, 80);
}

async function playItem(item, opts = {}) {
  if (!item) return;
  if (!hasPlayableId(item)) {
    const resolved = await resolveProviderItem(item);
    if (providerId(resolved)) {
      item = upsertResolvedItem(item, resolved);
      if (state.page === "detail") render();
    }
  }

  if (!hasPlayableId(item)) {
    item = upsertResolvedItem(item, { ...item, providerChecked: true });
    openTitle(item);
    return;
  }

  const season = item.type === "tv" ? opts.season || state.currentSeason || 1 : 1;
  const episode = item.type === "tv" ? opts.episode || state.currentEpisode || 1 : 1;
  state.currentSeason = season;
  state.currentEpisode = episode;
  state.activePlayerId = item.id;

  els.playerOverlay.hidden = false;
  renderPlayerControls(item);
  const url = buildVidkingUrl(item, season, episode);
  syncPlayerLabels(item, season, episode);
  setPlayerSource(url);
  rememberPlay(item, season, episode);
  renderContinue();
  window.setTimeout(() => els.playerFrame.focus?.(), 0);

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
  state.activePlayerUrl = "";
  state.playerRecoveryCount = 0;
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
      return { event: data };
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

    const eventName = String(candidate.event ?? candidate.type ?? candidate.status ?? candidate.state ?? "").toLowerCase();
    if (/(stalled|suspend|waiting|buffer|error|abort|retry|reconnect)/.test(eventName)) parsed.playerEvent = eventName;

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
  notePlayerSignal();
  if (/(stalled|suspend|error|abort|retry|reconnect)/.test(update.playerEvent || "")) {
    attemptPlayerRecovery(update.playerEvent);
  }
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

function loadContentCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CONTENT_CACHE_KEY) || "null");
    if (!cached?.savedAt || !Array.isArray(cached.items)) return [];
    if (Date.now() - cached.savedAt > CONTENT_CACHE_TTL_MS) return [];
    return cached.items;
  } catch {
    return [];
  }
}

function saveContentCache(items) {
  try {
    localStorage.setItem(
      CONTENT_CACHE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        items: items.slice(0, 260),
      }),
    );
  } catch {
    // Content freshness should never block the app if storage is unavailable.
  }
}

async function proxyFetch(path, params = {}) {
  const url = new URL(`${TMDB_PROXY}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  });
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Proxy request failed: ${response.status}`);
  return response.json();
}

function normalizeFeedItem(raw, feed = {}) {
  const mediaType = feed.type || raw.media_type;
  if (mediaType !== "movie" && mediaType !== "tv") return null;
  const item = normalizeTmdbItem(raw, mediaType);
  return {
    ...item,
    collections: uniqueValues([...(item.collections || []), feed.key, ...(feed.collections || [])]),
    genres: uniqueValues([...(item.genres || []), feed.genre]),
    region: feed.region || item.region,
    cast: feed.actorName ? uniqueValues([...(item.cast || []), feed.actorName]) : item.cast || [],
  };
}

async function fetchProxyFeed(feed) {
  const pages = feed.pages || [1];
  const payloads = await Promise.allSettled(pages.map((page) => proxyFetch(feed.endpoint, { ...(feed.params || {}), page: String(page) })));
  return payloads
    .flatMap((result) => (result.status === "fulfilled" ? result.value.results || result.value.cast || [] : []))
    .map((raw) => normalizeFeedItem(raw, feed))
    .filter(Boolean);
}

const HOME_FEEDS = [
  { key: "trending-movies", endpoint: "/trending/movie/day", type: "movie", collections: ["recently-added"], pages: [1, 2] },
  { key: "trending-tv", endpoint: "/trending/tv/day", type: "tv", collections: ["latest-tv", "recently-added"], pages: [1, 2] },
  { key: "latest-movies", endpoint: "/movie/now_playing", type: "movie", collections: ["recently-added"], pages: [1, 2] },
  { key: "latest-tv", endpoint: "/tv/on_the_air", type: "tv", collections: ["recently-added"], pages: [1] },
  { key: "bollywood", endpoint: "/discover/movie", type: "movie", region: "Bollywood", params: { with_original_language: "hi", sort_by: "popularity.desc" }, pages: [1, 2] },
  { key: "hollywood", endpoint: "/discover/movie", type: "movie", region: "Hollywood", params: { with_original_language: "en", sort_by: "popularity.desc" }, pages: [1, 2] },
  { key: "genre-action", endpoint: "/discover/movie", type: "movie", genre: "Action", params: { with_genres: "28", sort_by: "popularity.desc" }, pages: [1, 2] },
  { key: "genre-comedy", endpoint: "/discover/movie", type: "movie", genre: "Comedy", params: { with_genres: "35", sort_by: "popularity.desc" }, pages: [1, 2] },
  { key: "genre-anime", endpoint: "/discover/tv", type: "tv", genre: "Animation", params: { with_genres: "16", with_original_language: "ja", sort_by: "popularity.desc" }, pages: [1, 2] },
  { key: "top-rated-movies", endpoint: "/movie/top_rated", type: "movie", pages: [1] },
  { key: "top-rated-tv", endpoint: "/tv/top_rated", type: "tv", pages: [1] },
];

async function loadHomeProxyContent() {
  const results = await Promise.allSettled(HOME_FEEDS.map(fetchProxyFeed));
  return mergeItems(...results.map((result) => (result.status === "fulfilled" ? result.value : [])));
}

async function loadActorCollection(collection) {
  const personSearch = await proxyFetch("/search/person", { query: collection.actorName, page: "1" });
  const person = (personSearch.results || []).find((entry) => normalizeSearch(entry.name) === normalizeSearch(collection.actorName)) || personSearch.results?.[0];
  if (!person?.id) return [];
  const credits = await proxyFetch(`/person/${person.id}/combined_credits`);
  return (credits.cast || [])
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0))
    .slice(0, 60)
    .map((raw) =>
      normalizeFeedItem(raw, {
        key: collection.key,
        actorName: collection.actorName,
      }),
    )
    .filter(Boolean);
}

async function loadCollectionContent(view) {
  const collection = collectionDefinition(view);
  if (!collection) return [];
  if (collection.actorName) return loadActorCollection(collection);
  if (collection.endpoint) return fetchProxyFeed(collection);
  return [];
}

function ensureCollectionLoaded(view = state.view) {
  const collection = collectionDefinition(view);
  if (!collection || state.collectionLoaded[view] || state.collectionLoading[view]) return;
  if (!collection.endpoint && !collection.actorName) return;
  state.collectionLoading[view] = true;
  loadCollectionContent(view)
    .then((items) => {
      if (items.length) state.items = mergeItems(state.items, items);
      state.collectionLoaded[view] = true;
    })
    .catch((error) => console.warn("Collection load failed", error))
    .finally(() => {
      state.collectionLoading[view] = false;
      if (state.view === view || state.page === "detail") render();
    });
}

async function hydrateHome() {
  const selectedId = state.selected?.id;
  const seedItems = SEED_TITLES.map(normalizeSeed);
  const cached = loadContentCache();
  state.items = mergeItems(seedItems, cached, state.items);
  if (cached.length) {
    state.selected = state.page === "detail" ? findItem(selectedId) || state.selected : featuredItem(state.items) || state.items[0];
    render();
  }

  try {
    const liveItems = await loadHomeProxyContent();
    if (liveItems.length) {
      state.items = mergeItems(seedItems, liveItems, state.items);
      state.contentHydratedAt = Date.now();
      saveContentCache(liveItems);
      state.selected = state.page === "detail" ? findItem(selectedId) || state.selected : featuredItem(state.items) || state.items[0];
      render();
    }
  } catch (error) {
    console.warn("Proxy home load failed", error);
  }

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
    state.items = mergeItems(seedItems, liveItems, state.items);
    state.selected = state.page === "detail" ? findItem(state.selected?.id) || state.selected : state.items[0];
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

function titleSimilarityScore(left, right) {
  return fieldMatchScore(left, buildQueryContext(right));
}

function proxyMatchDate(match, type) {
  return type === "tv" ? match.first_air_date : match.release_date;
}

function normalizeProxyMatch(item, match) {
  if (!match?.id) return item;
  const isTv = item.type === "tv";
  const providerTitle = isTv ? match.name || item.title : match.title || item.title;
  const originalTitle = isTv ? match.original_name || providerTitle : match.original_title || providerTitle;
  const title = displayTitleFromProvider(providerTitle, originalTitle, match.original_language);
  const preferredTitle = titleSimilarityScore(item.title || "", originalTitle || "") > titleSimilarityScore(item.title || "", title || "") ? item.title : title;
  const date = proxyMatchDate(match, item.type);
  return {
    ...item,
    id: `${item.type}-${match.id}`,
    tmdbId: match.id,
    title: preferredTitle || title,
    originalTitle,
    providerTitle,
    originalLanguage: match.original_language || item.originalLanguage || "",
    aliases: uniqueValues([...(item.aliases || []), preferredTitle, title, originalTitle, providerTitle]),
    year: date ? String(date).slice(0, 4) : item.year,
    posterUrl: imageUrl(match.poster_path, "w500") || item.posterUrl,
    backdropUrl: imageUrl(match.backdrop_path || match.poster_path, "original") || item.backdropUrl,
    overview: match.overview || item.overview,
    rating: match.vote_average || item.rating,
    source: item.source === "IMDb" ? "IMDb + TMDB" : item.source,
    providerChecked: true,
  };
}

function normalizeProxyDetail(data, type) {
  if (!data?.id) return null;
  const isTv = type === "tv";
  const providerTitle = isTv ? data.name || data.original_name : data.title || data.original_title;
  const originalTitle = isTv ? data.original_name || providerTitle : data.original_title || providerTitle;
  const title = displayTitleFromProvider(providerTitle, originalTitle, data.original_language);
  const date = isTv ? data.first_air_date : data.release_date;
  const runtime = isTv
    ? data.episode_run_time?.[0]
      ? `${data.episode_run_time[0]}m`
      : ""
    : data.runtime
      ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m`
      : "";

  return {
    id: `${type}-${data.id}`,
    type,
    tmdbId: data.id,
    imdbId: isTv ? data.external_ids?.imdb_id || "" : data.imdb_id || "",
    title,
    originalTitle,
    providerTitle,
    originalLanguage: data.original_language || "",
    aliases: uniqueValues([title, originalTitle, providerTitle]),
    year: date ? String(date).slice(0, 4) : "",
    genres: (data.genres || []).map((genre) => genre.name).filter(Boolean),
    rating: data.vote_average || null,
    runtime,
    posterUrl: imageUrl(data.poster_path, "w500"),
    backdropUrl: imageUrl(data.backdrop_path || data.poster_path, "original"),
    overview: data.overview || "",
    seasons: isTv
      ? (data.seasons || [])
          .filter((season) => season.season_number > 0)
          .map((season) => ({ number: season.season_number, episodes: season.episode_count }))
      : [],
    source: "TMDB",
    region: data.origin_country?.includes("IN") ? "Bollywood" : isTv ? "TV" : "Hollywood",
    providerChecked: true,
  };
}

async function fetchProxyDetail(type, tmdbId) {
  const id = numericTmdbId(tmdbId);
  if (!id) return null;
  try {
    const response = await fetch(`${TMDB_PROXY}/${type}/${encodeURIComponent(id)}`);
    if (!response.ok) return null;
    return normalizeProxyDetail(await response.json(), type);
  } catch (error) {
    console.warn("Provider detail lookup failed", error);
    return null;
  }
}

function pickTitleSearchMatch(item, results) {
  if (!results?.length) return null;
  const itemYearValue = Number(item.year || 0);
  return [...results].sort((a, b) => {
    const titleA = item.type === "tv" ? a.name : a.title;
    const titleB = item.type === "tv" ? b.name : b.title;
    const originalA = item.type === "tv" ? a.original_name : a.original_title;
    const originalB = item.type === "tv" ? b.original_name : b.original_title;
    const scoreA = Math.max(titleSimilarityScore(titleA || "", item.title || ""), titleSimilarityScore(originalA || "", item.title || ""));
    const scoreB = Math.max(titleSimilarityScore(titleB || "", item.title || ""), titleSimilarityScore(originalB || "", item.title || ""));
    if (scoreA !== scoreB) return scoreB - scoreA;
    if (itemYearValue) {
      const yearA = Number(String(proxyMatchDate(a, item.type) || "").slice(0, 4));
      const yearB = Number(String(proxyMatchDate(b, item.type) || "").slice(0, 4));
      return Math.abs(yearA - itemYearValue) - Math.abs(yearB - itemYearValue);
    }
    return Number(b.popularity || 0) - Number(a.popularity || 0);
  })[0];
}

async function resolveTitleToTmdb(item) {
  if (!item?.title || providerId(item)) return item;
  const queries = uniqueValues([item.title, item.originalTitle, ...(item.aliases || [])]).slice(0, 5);
  for (const query of queries) {
    try {
      const url = new URL(`${TMDB_PROXY}/search/${item.type}`);
      url.searchParams.set("query", query);
      const response = await fetch(url.toString());
      if (!response.ok) continue;
      const data = await response.json();
      const match = pickTitleSearchMatch(item, data.results || []);
      if (!match) continue;
      const normalized = normalizeProxyMatch(item, match);
      if (providerId(normalized)) return (await fetchProxyDetail(normalized.type, providerId(normalized))) || normalized;
    } catch (error) {
      console.warn("Title provider lookup failed", error);
    }
  }
  return { ...item, providerChecked: true };
}

async function resolveProviderItem(item) {
  if (!item || providerId(item)) return item;
  let resolved = item;
  if (resolved.imdbId) resolved = await resolveImdbToTmdb(resolved);
  if (!providerId(resolved)) resolved = await resolveTitleToTmdb(resolved);
  return resolved;
}

function upsertResolvedItem(original, resolved) {
  if (!resolved?.id) return original;
  const oldId = original?.id;
  state.items = mergeItems(state.items, [resolved]);
  const stored = findItem(resolved.id) || resolved;
  if (oldId && oldId !== stored.id) remapStoredItemId(oldId, stored.id);
  if (state.selected?.id === oldId || state.selected?.id === stored.id) state.selected = stored;
  if (state.activePlayerId === oldId) state.activePlayerId = stored.id;
  return stored;
}

function pickProxyMatch(item, data) {
  const results = item.type === "tv" ? data?.tv_results || [] : data?.movie_results || [];
  if (!results.length) return null;
  const itemYearValue = Number(item.year || 0);
  return [...results].sort((a, b) => {
    const titleA = item.type === "tv" ? a.name : a.title;
    const titleB = item.type === "tv" ? b.name : b.title;
    const scoreA = titleSimilarityScore(titleA || "", item.title || "");
    const scoreB = titleSimilarityScore(titleB || "", item.title || "");
    if (scoreA !== scoreB) return scoreB - scoreA;
    if (itemYearValue) {
      const yearA = Number(String(proxyMatchDate(a, item.type) || "").slice(0, 4));
      const yearB = Number(String(proxyMatchDate(b, item.type) || "").slice(0, 4));
      return Math.abs(yearA - itemYearValue) - Math.abs(yearB - itemYearValue);
    }
    return Number(b.popularity || 0) - Number(a.popularity || 0);
  })[0];
}

async function resolveImdbToTmdb(item) {
  if (!item?.imdbId || providerId(item)) return item;
  try {
    const url = new URL(`${TMDB_PROXY}/find/${encodeURIComponent(item.imdbId)}`);
    url.searchParams.set("external_source", "imdb_id");
    const response = await fetch(url.toString());
    if (!response.ok) return item;
    const data = await response.json();
    const match = pickProxyMatch(item, data);
    return match ? normalizeProxyMatch(item, match) : { ...item, providerChecked: true };
  } catch (error) {
    console.warn("IMDb to TMDB resolution failed", error);
    return { ...item, providerChecked: true, providerError: true };
  }
}

async function resolveProviderIds(items) {
  const queue = items.filter((item) => item?.imdbId && !providerId(item)).slice(0, 48);
  if (!queue.length) return items;
  const resolved = await Promise.all(queue.map(resolveProviderItem));
  const byOriginalId = new Map(queue.map((item, index) => [item.id, resolved[index]]));
  return items.map((item) => byOriginalId.get(item.id) || item);
}

function normalizeTmdbItem(item, explicitType) {
  const type = explicitType || item.media_type;
  const isTv = type === "tv";
  const date = isTv ? item.first_air_date : item.release_date;
  const providerTitle = isTv ? item.name : item.title;
  const originalTitle = isTv ? item.original_name || providerTitle : item.original_title || providerTitle;
  const title = displayTitleFromProvider(providerTitle, originalTitle, item.original_language);
  return {
    id: `${isTv ? "tv" : "movie"}-${item.id}`,
    type: isTv ? "tv" : "movie",
    tmdbId: item.id,
    title,
    originalTitle,
    providerTitle,
    originalLanguage: item.original_language || "",
    aliases: uniqueValues([title, providerTitle, originalTitle]),
    year: date ? date.slice(0, 4) : "",
    genres: uniqueValues((item.genre_ids || []).map((id) => TMDB_GENRES[id])),
    rating: item.vote_average || null,
    poster: item.poster_path,
    backdrop: item.backdrop_path,
    posterUrl: imageUrl(item.poster_path, "w500"),
    backdropUrl: imageUrl(item.backdrop_path || item.poster_path, "original"),
    overview: item.overview || "",
    region: type === "movie" && item.original_language === "hi" ? "Bollywood" : type === "movie" ? "Hollywood" : "TV",
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
    .map((item, index) => {
      const normalized = normalizeTmdbItem(item);
      return { ...normalized, searchAliases: uniqueValues([...(normalized.searchAliases || []), query]), searchRank: index };
    });
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
    originalTitle: show.name,
    aliases: uniqueValues([show.name]),
    searchAliases: uniqueValues([show.language, show.network?.name, show.webChannel?.name]),
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

function claimText(entity, property) {
  const value = claimValues(entity, property)[0];
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value.text || value.value || "";
  return "";
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

function entityBestLabel(entity) {
  const labels = entity?.labels || {};
  const preferred = ["en", "tr", "hi", "es", "fr", "de", "it", "pt", "ar"];
  for (const language of preferred) {
    if (labels[language]?.value) return labels[language].value;
  }
  return Object.values(labels)[0]?.value || "";
}

function entityAliasValues(entity) {
  return Object.values(entity?.aliases || {})
    .flatMap((aliases) => aliases.map((alias) => alias.value))
    .filter(Boolean)
    .slice(0, 20);
}

function normalizeWikidataEntity(entity, preferredType, searchRank = 999) {
  if (!entity) return null;
  const movieId = claimString(entity, "P4947");
  const tvId = claimString(entity, "P4983");
  const type = preferredType || (movieId ? "movie" : "tv");
  const tmdbId = type === "movie" ? movieId : tvId;
  const image = claimString(entity, "P18");
  const originalTitle = claimText(entity, "P1476");
  const title = entityBestLabel(entity) || originalTitle;
  const aliases = uniqueValues([title, originalTitle, ...entityAliasValues(entity)]);

  if (!tmdbId) return null;

  return {
    id: `${type}-${tmdbId}`,
    type,
    tmdbId,
    wikidataId: entity.id,
    imdbId: claimString(entity, "P345"),
    title,
    originalTitle,
    aliases,
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
  entityUrl.searchParams.set("props", "claims|labels|descriptions|aliases");
  entityUrl.searchParams.set("languages", "en|tr|hi|es|fr|de|it|pt|ar");
  entityUrl.searchParams.set("format", "json");
  entityUrl.searchParams.set("origin", "*");

  const entityData = await fetch(entityUrl.toString()).then((response) => (response.ok ? response.json() : null));
  return ids
    .map((id, index) => normalizeWikidataEntity(entityData?.entities?.[id], type, index))
    .filter(Boolean)
    .map((item) => ({ ...item, searchAliases: uniqueValues([...(item.searchAliases || []), query]) }));
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

function imdbSuggestionType(qid) {
  const value = String(qid || "").toLowerCase();
  if (value === "tvseries" || value === "tvminiseries") return "tv";
  return "movie";
}

function normalizeImdbSuggestion(item, index) {
  const qid = item.qid || "";
  const type = imdbSuggestionType(qid);
  const title = item.l || "";
  const cast = String(item.s || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 5);
  return {
    id: `${type}-${item.id}`,
    type,
    imdbId: item.id,
    title,
    originalTitle: title,
    aliases: uniqueValues([title]),
    searchAliases: uniqueValues([item.q, item.rank ? String(item.rank) : ""]),
    year: item.y ? String(item.y) : "",
    genres: [],
    cast,
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
      .map((item, index) => {
        const normalized = normalizeImdbSuggestion(item, index);
        return { ...normalized, searchAliases: uniqueValues([...(normalized.searchAliases || []), query]) };
      });
  } catch {
    return [];
  }
}

function searchResultScore(item, query) {
  const textScore = searchTextScore(item, query);
  const titleScore = realTitleScore(item, query);
  const queryLength = normalizeCompact(query).length;
  let score = textScore * 1.35 + titleScore * 4.4;

  if (titleScore >= 220) score += 520;
  else if (titleScore >= 190) score += 430;
  else if (titleScore >= 160) score += 340;
  else if (titleScore >= 120) score += 220;
  else if (titleScore >= 90) score += 130;
  else if (titleScore >= 58) score += 58;
  else if (queryLength >= 5) score -= textScore >= 90 ? 40 : 220;

  if (hasPlayableId(item)) score += 34;
  else if (item.imdbId) score += 10;
  if (item.type === "movie") score += 6;
  if (item.posterUrl) score += 12;
  if (item.overview) score += 6;
  if (item.rating || item.imdbRating) score += 6;
  if (item.source === "TMDB") score += 12;
  if (item.source === "IMDb + TMDB") score += 14;
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

function rememberSearchResults(items) {
  items.forEach((item) => {
    if (!item?.id) return;
    state.searchCache.set(item.id, item);
  });
  if (state.searchCache.size > SEARCH_CACHE_LIMIT) {
    Array.from(state.searchCache.keys())
      .slice(0, state.searchCache.size - SEARCH_CACHE_LIMIT)
      .forEach((key) => state.searchCache.delete(key));
  }
}

function cachedSearchItems(query) {
  return mergeItems(SEED_TITLES.map(normalizeSeed), state.items, Array.from(state.searchCache.values())).filter((item) => queryMatchesItem(item, query));
}

function showInstantSearchResults(query) {
  const instant = sortSearchResults(cachedSearchItems(query), query);
  if (!instant.length) return;
  state.items = instant;
  state.selected = displayItems()[0] || state.items[0] || null;
}

async function settleList(promise) {
  try {
    return await promise;
  } catch {
    return [];
  }
}

async function searchRemote(query) {
  const token = ++state.searchToken;
  state.isSearching = true;
  showInstantSearchResults(query);
  render();

  const localMatches = SEED_TITLES.map(normalizeSeed).filter((item) => queryMatchesItem(item, query));
  const variants = searchQueryVariants(query);
  const primaryVariants = variants.slice(0, 7);
  const wikiVariants = variants.slice(0, 5);

  const requests = [
    state.profile.tmdbKey ? Promise.all(primaryVariants.map((variant) => tmdbSearchPages(variant))).then((lists) => lists.flat()) : Promise.resolve([]),
    Promise.all(wikiVariants.map((variant) => searchWikidataMedia(variant))).then((lists) => lists.flat()),
    searchImdbSuggestions(query),
    Promise.all(
      primaryVariants.map((variant) =>
        fetch(`${TVMAZE_API}/search/shows?q=${encodeURIComponent(variant)}`)
          .then((response) => (response.ok ? response.json() : []))
          .then((data) =>
            data.map((result, index) => {
              const normalized = normalizeTvMazeResult(result);
              return { ...normalized, searchAliases: uniqueValues([...(normalized.searchAliases || []), variant]), searchRank: index };
            }),
          )
          .catch(() => []),
      ),
    ).then((lists) => lists.flat()),
  ];

  const results = await Promise.all(requests.map(settleList));
  if (token !== state.searchToken) return;

  const resolvedResults = await resolveProviderIds(results.flat());
  if (token !== state.searchToken) return;

  state.items = sortSearchResults(mergeItems(SEED_TITLES.map(normalizeSeed), state.items, resolvedResults, localMatches), query);
  rememberSearchResults(state.items);
  state.isSearching = false;
  state.selected = displayItems()[0] || state.items[0] || null;
  scrollToTop();
  render();
  enrichSelected(state.selected);
  enrichRatings(displayItems());
}

async function enrichSelected(item) {
  if (!item) return;

  const detailToken = ++state.detailToken;
  let selectedId = item.id;
  state.detailLoadingId = selectedId;
  if (state.selected?.id === selectedId) render();

  if (!providerId(item) && (item.imdbId || item.title)) {
    const resolved = await resolveProviderItem(item);
    if (detailToken !== state.detailToken) return;
    if (resolved) {
      const oldId = item.id;
      const shouldRenderResolved = resolved.id !== item.id || providerId(resolved) || resolved.providerChecked !== item.providerChecked;
      item = upsertResolvedItem(item, resolved);
      selectedId = item.id;
      state.detailLoadingId = selectedId;
      if (oldId !== item.id && (location.hash === `#/title/${encodeURIComponent(oldId)}` || /^\/(title|movie|tv)\//.test(location.pathname))) {
        history.replaceState(history.state || { page: "detail" }, "", titlePath(item));
      }
      if (shouldRenderResolved) render();
    }
  }

  const updates = {};
  if (state.profile.tmdbKey && providerId(item)) {
    try {
      const path = item.type === "tv" ? `/tv/${providerId(item)}` : `/movie/${providerId(item)}`;
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
  const activeView = isCategoryView() ? "movie" : state.view;
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === activeView);
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

function openTitle(item, push = true) {
  if (!item) return;
  const returnPath = currentReturnPath();
  state.page = "detail";
  state.selected = item;
  state.currentSeason = 1;
  state.currentEpisode = 1;
  scrollToTop("auto");
  render();
  enrichSelected(item);
  if (push) history.pushState({ page: "detail", id: item.id, returnPath }, "", titlePath(item));
}

function closeTitle(push = true) {
  state.page = "home";
  scrollToTop("auto");
  render();
  if (push && (location.hash.startsWith("#/title/") || /^\/(title|movie|tv)\//.test(location.pathname))) {
    const returnPath = history.state?.returnPath;
    if (returnPath && returnPath !== "/") {
      history.pushState({ page: "category" }, "", returnPath);
      restoreRouteFromLocation();
    } else {
      history.pushState({ page: "home" }, "", "/");
    }
  }
}

function routePlaceholder(id) {
  const value = String(id || "");
  const numericMatch = value.match(/^(movie|tv)-(\d+)$/);
  const imdbMatch = value.match(/^(movie|tv)-(tt\d+)$/i);
  const type = numericMatch?.[1] || imdbMatch?.[1] || "movie";
  const tmdbId = numericMatch?.[2] || "";
  const imdbId = imdbMatch?.[2] || "";
  return {
    id: value,
    type,
    tmdbId,
    imdbId,
    title: "Loading title...",
    originalTitle: "Loading title...",
    aliases: [],
    year: "",
    genres: [],
    rating: null,
    runtime: "",
    posterUrl: "",
    backdropUrl: "",
    overview: "Checking this title against the provider catalog.",
    source: APP_NAME,
    providerChecked: false,
  };
}

function slugPlaceholder(type, slug) {
  const title = titleCaseFromSlug(String(slug || "").replace(/-\d{4}$/, ""));
  return {
    id: `${type}-${slug}`,
    type,
    title: title || "Loading title...",
    originalTitle: title || "Loading title...",
    aliases: [title].filter(Boolean),
    year: String(slug || "").match(/-(\d{4})$/)?.[1] || "",
    genres: [],
    rating: null,
    runtime: "",
    posterUrl: "",
    backdropUrl: "",
    overview: "Loading this page from the live catalog.",
    source: APP_NAME,
    providerChecked: false,
  };
}

function queryFromTitleSlug(slug) {
  return String(slug || "")
    .replace(/-\d{4}$/, "")
    .replace(/-/g, " ")
    .trim();
}

async function resolveSlugItem(type, slug) {
  const query = queryFromTitleSlug(slug);
  if (!query) return null;
  const year = String(slug || "").match(/-(\d{4})$/)?.[1] || "";
  const probe = { type, title: query, originalTitle: query, aliases: [query], year };
  try {
    const url = new URL(`${TMDB_PROXY}/search/${type}`);
    url.searchParams.set("query", query);
    const response = await fetch(url.toString());
    if (!response.ok) return null;
    const data = await response.json();
    const match = pickTitleSearchMatch(probe, data.results || []);
    if (!match) return null;
    const normalized = normalizeProxyMatch(probe, match);
    return (await fetchProxyDetail(normalized.type, providerId(normalized))) || normalized;
  } catch (error) {
    console.warn("Slug title lookup failed", error);
    return null;
  }
}

async function resolveRouteItem(id, ignoreExisting = false) {
  if (!ignoreExisting) {
    const existing = findItem(id);
    if (existing) return existing;
  }

  const value = String(id || "");
  const numericMatch = value.match(/^(movie|tv)-(\d+)$/);
  if (numericMatch) return fetchProxyDetail(numericMatch[1], numericMatch[2]);

  const imdbMatch = value.match(/^(movie|tv)-(tt\d+)$/i);
  if (imdbMatch) {
    const resolved = await resolveImdbToTmdb({
      id: value,
      type: imdbMatch[1],
      imdbId: imdbMatch[2],
      title: "",
      originalTitle: "",
      aliases: [],
    });
    if (!providerId(resolved)) return resolved.title ? resolved : null;
    return (await fetchProxyDetail(resolved.type, providerId(resolved))) || resolved;
  }

  return null;
}

async function openRouteTitle(id) {
  const token = ++state.routeToken;
  const placeholder = routePlaceholder(id);
  state.page = "detail";
  state.selected = placeholder;
  state.detailLoadingId = placeholder.id;
  scrollToTop("auto");
  render();

  const resolved = await resolveRouteItem(id, true);
  if (token !== state.routeToken) return;
  state.detailLoadingId = "";

  if (!resolved) {
    state.selected = {
      ...placeholder,
      title: "Title not found",
      overview: "This title could not be matched with the provider catalog.",
      providerChecked: true,
    };
    render();
    return;
  }

  state.items = mergeItems(state.items, [resolved]);
  state.selected = findItem(resolved.id) || resolved;
  remapStoredItemId(id, resolved.id);
  if (location.hash === `#/title/${encodeURIComponent(id)}` || cleanRoutePath(location.pathname) === titlePath(id)) {
    history.replaceState(history.state || { page: "detail" }, "", titlePath(resolved));
  }
  render();
  enrichSelected(state.selected);
}

async function openSlugTitle(type, slug) {
  const token = ++state.routeToken;
  const placeholder = slugPlaceholder(type, slug);
  state.page = "detail";
  state.selected = placeholder;
  state.detailLoadingId = placeholder.id;
  scrollToTop("auto");
  render();

  const resolved = await resolveSlugItem(type, slug);
  if (token !== state.routeToken) return;
  state.detailLoadingId = "";

  if (!resolved) {
    state.selected = {
      ...placeholder,
      title: "Title not found",
      overview: "This page could not be matched with the live catalog.",
      providerChecked: true,
    };
    render();
    return;
  }

  state.items = mergeItems(state.items, [resolved]);
  state.selected = findItem(resolved.id) || resolved;
  if (cleanRoutePath(location.pathname) !== titlePath(resolved)) {
    history.replaceState(history.state || { page: "detail" }, "", titlePath(resolved));
  }
  render();
  enrichSelected(state.selected);
}

function routeFromLocation() {
  const categoryMatch = location.hash.match(/^#\/category\/(bollywood|hollywood)$/);
  if (categoryMatch) return { type: "category", category: categoryMatch[1] };
  const titleHashMatch = location.hash.match(/^#\/title\/(.+)$/);
  if (titleHashMatch) return { type: "title", id: decodeURIComponent(titleHashMatch[1]) };

  const path = cleanRoutePath(location.pathname);
  const categoryPathMatch = path.match(/^\/category\/(bollywood|hollywood)\/$/);
  if (categoryPathMatch) return { type: "category", category: categoryPathMatch[1] };
  const genrePathMatch = path.match(/^\/genre\/([^/]+)\/$/);
  if (genrePathMatch) return { type: "category", category: `genre-${decodeURIComponent(genrePathMatch[1])}` };
  const actorPathMatch = path.match(/^\/actor\/([^/]+)\/$/);
  if (actorPathMatch) return { type: "category", category: `actor-${decodeURIComponent(actorPathMatch[1])}` };
  const titlePathMatch = path.match(/^\/title\/([^/]+)\/$/);
  if (titlePathMatch) return { type: "title", id: decodeURIComponent(titlePathMatch[1]) };
  const slugTitleMatch = path.match(/^\/(movie|tv)\/([^/]+)\/$/);
  if (slugTitleMatch) return { type: "title-slug", mediaType: slugTitleMatch[1], slug: decodeURIComponent(slugTitleMatch[2]) };
  if (path === "/movies/") return { type: "section", view: "movie", filter: "movie" };
  if (path === "/tv-shows/") return { type: "section", view: "tv", filter: "tv" };
  if (path === "/watchlist/") return { type: "section", view: "watchlist", filter: "all" };
  return null;
}

function restoreRouteFromLocation() {
  const route = routeFromLocation();
  if (!route) return false;
  if (route.type === "category") {
    openCategoryPage(route.category, false);
    return true;
  }
  if (route.type === "section") {
    state.page = "home";
    state.view = route.view;
    state.filter = route.filter;
    resetCategoryState();
    state.selected = displayItems()[0] || state.items[0] || null;
    render();
    enrichSelected(state.selected);
    return true;
  }

  if (route.type === "title-slug") {
    const item = findItemBySlug(route.mediaType, route.slug);
    if (item) openTitle(item, false);
    else openSlugTitle(route.mediaType, route.slug);
    return true;
  }

  const id = route.id;
  const item = findItem(id);
  if (item) openTitle(item, false);
  else openRouteTitle(id);
  return true;
}

function restoreRouteFromHash() {
  return restoreRouteFromLocation();
}

function restoreSearchFromQueryParam() {
  const query = new URLSearchParams(location.search).get("q")?.trim();
  if (!query) return false;
  state.query = query;
  els.searchInput.value = query;
  state.page = "home";
  state.view = "home";
  state.filter = "all";
  resetCategoryState();
  showInstantSearchResults(query);
  state.selected = displayItems()[0] || state.items[0] || null;
  render();
  if (query.length >= 2) searchRemote(query);
  return true;
}

function applySection(view, filter = view === "home" ? "all" : view) {
  const wasSearching = Boolean(state.query) || state.isSearching;
  cancelActiveSearch();
  clearQueryValue();
  if (wasSearching) state.items = SEED_TITLES.map(normalizeSeed);
  state.page = "home";
  state.view = view;
  state.filter = filter;
  if (!isCategoryView(view)) resetCategoryState();
  setActiveNav();
  setActiveFilter();
  state.selected = displayItems()[0] || state.items[0] || null;
  scrollToTop();
  render();
  enrichSelected(state.selected);
  if (wasSearching) hydrateHome();
  const sectionPath = view === "movie" ? "/movies/" : view === "tv" ? "/tv-shows/" : view === "watchlist" ? "/watchlist/" : "/";
  if (location.hash || location.pathname !== sectionPath) history.pushState({ page: "home", view }, "", sectionPath);
}

function openCategoryPage(category, push = true) {
  const collection = collectionDefinition(category);
  if (!collection) return;
  cancelActiveSearch();
  state.page = "home";
  state.view = category;
  state.filter = collection.type || "all";
  clearQueryValue();
  resetCategoryState();
  state.selected = displayItems()[0] || state.items[0] || null;
  setActiveNav();
  setActiveFilter();
  scrollToTop();
  render();
  ensureCollectionLoaded(category);
  enrichSelected(state.selected);
  if (push) history.pushState({ page: "category", category }, "", categoryPath(category));
}

function resetCategoryState() {
  state.categoryQuery = "";
  state.categoryGenre = "all";
  state.categorySort = "featured";
  state.categoryTab = "trending";
  state.categoryLimit = CATEGORY_PAGE_SIZE;
}

function cancelActiveSearch() {
  state.searchToken += 1;
  state.isSearching = false;
}

function clearQueryValue() {
  state.query = "";
  els.searchInput.value = "";
}

function clearSearchState() {
  cancelActiveSearch();
  clearQueryValue();
  state.page = "home";
  scrollToTop();
  hydrateHome();
}

function selectedIndex() {
  return displayItems().findIndex((item) => item.id === state.selected?.id);
}

function selectRelativeItem(direction) {
  const visible = displayItems();
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
  if (els.shortcutsModal.open) {
    els.shortcutsModal.close();
    return;
  }
  if (els.settingsModal.open) {
    els.settingsModal.close();
    return;
  }
  if (state.page === "detail") {
    closeTitle();
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

function openShortcuts() {
  if (!els.shortcutsModal.open) els.shortcutsModal.showModal();
}

function closeShortcuts() {
  if (els.shortcutsModal.open) els.shortcutsModal.close();
}

function scrollRail(button) {
  const track = document.getElementById(button.dataset.target || "");
  if (!track) return;
  const direction = Number(button.dataset.direction || 1);
  const distance = Math.max(260, Math.floor(track.clientWidth * 0.82));
  track.scrollBy({ left: direction * distance, behavior: "smooth" });
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

function installPopupGuard() {
  const nativeOpen = window.open.bind(window);
  window.open = (url, target, features) => {
    if (!els.playerOverlay.hidden) {
      console.warn("Blocked third-party popup while player is open", url);
      return null;
    }
    return nativeOpen(url, target, features);
  };
  document.addEventListener(
    "click",
    (event) => {
      if (els.playerOverlay.hidden) return;
      const link = event.target.closest?.("a[target='_blank'], a[rel~='external']");
      if (!link) return;
      event.preventDefault();
      event.stopPropagation();
    },
    true,
  );
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  if (button instanceof HTMLAnchorElement) event.preventDefault();

  const item = findItem(button.dataset.id);
  switch (button.dataset.action) {
    case "home-link":
      applySection("home", "all");
      break;
    case "back":
      goBackOneStep();
      break;
    case "open-title":
      openTitle(item);
      break;
    case "select":
      state.selected = item;
      state.currentSeason = 1;
      state.currentEpisode = 1;
      openTitle(item);
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
    case "category-page":
      openCategoryPage(button.dataset.category);
      break;
    case "category-tab":
      state.categoryTab = button.dataset.tab || "trending";
      state.categoryLimit = CATEGORY_PAGE_SIZE;
      render();
      break;
    case "category-more":
      state.categoryLimit += CATEGORY_PAGE_SIZE;
      render();
      break;
    case "rail-scroll":
      scrollRail(button);
      break;
    case "open-shortcuts":
      openShortcuts();
      break;
    case "close-shortcuts":
      closeShortcuts();
      break;
    case "choose-episode":
      if (item) {
        state.currentSeason = Number(button.dataset.season || 1);
        state.currentEpisode = Number(button.dataset.episode || 1);
        renderDetail(item);
      }
      break;
    case "play-episode":
      if (item) {
        const season = Number(button.dataset.season || 1);
        const episode = Number(button.dataset.episode || 1);
        state.currentSeason = season;
        state.currentEpisode = episode;
        playItem(item, { season, episode });
      }
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

els.searchInput.addEventListener(
  "input",
  debounce(() => {
    cancelActiveSearch();
    state.query = els.searchInput.value.trim();
    state.page = "home";
    state.view = "home";
    state.filter = "all";
    resetCategoryState();
    if (state.query) {
      showInstantSearchResults(state.query);
      state.selected = displayItems()[0] || state.items[0] || null;
      scrollToTop();
      render();
      if (state.query.length >= 2) searchRemote(state.query);
    } else {
      state.items = SEED_TITLES.map(normalizeSeed);
      state.selected = displayItems()[0] || state.items[0] || null;
      scrollToTop();
      render();
      hydrateHome();
    }
  }, SEARCH_DEBOUNCE_MS),
);

els.clearSearch.addEventListener("click", () => {
  clearSearchState();
});

const updateCategorySearch = debounce((value) => {
  state.categoryQuery = value.trim();
  state.categoryLimit = CATEGORY_PAGE_SIZE;
  render();
  window.requestAnimationFrame(() => {
    const input = document.getElementById("categorySearch");
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
  });
}, 220);

els.categoryTools.addEventListener("input", (event) => {
  if (event.target?.id !== "categorySearch") return;
  updateCategorySearch(event.target.value);
});

els.categoryTools.addEventListener("change", (event) => {
  if (event.target?.id === "categoryGenreSelect") {
    state.categoryGenre = event.target.value;
    state.categoryLimit = CATEGORY_PAGE_SIZE;
    render();
  }
  if (event.target?.id === "categorySortSelect") {
    state.categorySort = event.target.value;
    state.categoryLimit = CATEGORY_PAGE_SIZE;
    render();
  }
});

els.settingsButton.addEventListener("click", openSettings);
els.profileButton.addEventListener("click", openSettings);
els.shortcutsButton.addEventListener("click", openShortcuts);
els.closeShortcuts.addEventListener("click", closeShortcuts);

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

let dragScroll = null;

document.addEventListener("pointerdown", (event) => {
  const track = event.target.closest("[data-drag-scroll]");
  if (!track || event.button > 0) return;
  dragScroll = {
    track,
    pointerId: event.pointerId,
    startX: event.clientX,
    scrollLeft: track.scrollLeft,
    distance: 0,
    captured: false,
    moved: false,
  };
  track.classList.add("is-pressed");
});

document.addEventListener("pointermove", (event) => {
  if (!dragScroll) return;
  const delta = event.clientX - dragScroll.startX;
  const distance = Math.abs(delta);
  dragScroll.distance = Math.max(dragScroll.distance, distance);
  if (distance > DRAG_START_THRESHOLD) {
    dragScroll.moved = true;
    dragScroll.track.classList.add("is-dragging");
    if (!dragScroll.captured) {
      dragScroll.track.setPointerCapture?.(event.pointerId);
      dragScroll.captured = true;
    }
    event.preventDefault();
  }
  if (dragScroll.moved) dragScroll.track.scrollLeft = dragScroll.scrollLeft - delta;
});

function finishDragScroll(event) {
  if (!dragScroll) return;
  const { track, pointerId, moved, distance, captured } = dragScroll;
  if (!event || event.pointerId === pointerId) {
    if (captured) {
      try {
        track.releasePointerCapture?.(pointerId);
      } catch {
        // Pointer capture can already be released if the browser scrolls natively.
      }
    }
    track.classList.remove("is-pressed");
    track.classList.remove("is-dragging");
    if (moved && distance > DRAG_CLICK_CANCEL_THRESHOLD) {
      track.dataset.dragged = "true";
      window.setTimeout(() => {
        delete track.dataset.dragged;
      }, 80);
    }
    dragScroll = null;
  }
}

document.addEventListener("pointerup", finishDragScroll);
document.addEventListener("pointercancel", finishDragScroll);
document.addEventListener(
  "click",
  (event) => {
    const track = event.target.closest("[data-drag-scroll]");
    if (!track?.dataset.dragged) return;
    event.preventDefault();
    event.stopPropagation();
  },
  true,
);

els.closePlayer.addEventListener("click", closePlayer);
els.playerFrame.addEventListener("load", notePlayerSignal);
els.playerFrame.addEventListener("error", () => attemptPlayerRecovery("frame error"));
window.addEventListener("message", handlePlayerMessage);
window.addEventListener("online", () => attemptPlayerRecovery("network restored"));
window.addEventListener("pageshow", (event) => {
  if (event.persisted) attemptPlayerRecovery("page restored");
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && Date.now() - state.lastPlayerSignalAt > 8000) {
    attemptPlayerRecovery("tab resumed");
  }
});
window.addEventListener("popstate", () => {
  if (!restoreRouteFromLocation()) {
    state.page = "home";
    if (!location.hash && location.pathname === "/") {
      state.view = "home";
      state.filter = "all";
      resetCategoryState();
    }
    render();
  }
});
window.addEventListener("hashchange", () => {
  if (restoreRouteFromLocation()) return;
  if (!location.hash && state.page === "detail") closeTitle(false);
});

function startHeroRotation() {
  window.setInterval(() => {
    if (state.page !== "home" || state.view !== "home" || state.query || !els.playerOverlay.hidden || els.settingsModal.open || els.shortcutsModal.open) return;
    const candidates = sortedByScore(getVisibleItems()).filter((item) => item.backdropUrl && !usesPosterArtwork(item));
    if (candidates.length < 2) return;
    state.heroIndex = (state.heroIndex + 1) % candidates.length;
    transitionHeroTo(candidates[state.heroIndex % candidates.length]);
  }, 9000);
}
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const typing = isTypingTarget(event.target);

  if (event.key === "Escape") {
    event.preventDefault();
    goBackOneStep();
    return;
  }

  if (event.key === "?" && !typing && els.playerOverlay.hidden && !els.settingsModal.open) {
    event.preventDefault();
    openShortcuts();
    return;
  }

  if (typing || els.settingsModal.open || els.shortcutsModal.open || !els.playerOverlay.hidden) return;

  if (event.key === "/") {
    event.preventDefault();
    els.searchInput.focus();
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    if (state.page === "detail") playItem(state.selected);
    else openTitle(state.selected);
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
installPopupGuard();
state.selected = state.items[0];
scrollToTop("auto");
if (!restoreRouteFromLocation() && !restoreSearchFromQueryParam()) render();
hydrateHome();
startHeroRotation();
