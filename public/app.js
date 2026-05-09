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

const CATEGORY_VIEWS = new Set(["bollywood", "hollywood"]);
const CATEGORY_PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 180;
const SEARCH_CACHE_LIMIT = 260;
const PLAYER_RECOVERY_COOLDOWN_MS = 12000;
const DRAG_START_THRESHOLD = 10;
const DRAG_CLICK_CANCEL_THRESHOLD = 18;

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

function providerId(item) {
  return String(item?.tmdbId || item?.imdbId || "").trim();
}

function hasPlayableId(item) {
  return Boolean(providerId(item));
}

function providerStatus(item) {
  return hasPlayableId(item) ? "Vidking ready" : "Needs provider ID";
}

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[char];
  });
}

const SEARCH_CHARACTER_MAP = {
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
    .replace(/[ıİşŞğĞüÜöÖçÇæÆøØåÅñÑß]/g, (char) => SEARCH_CHARACTER_MAP[char] || char)
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

function searchForms(value) {
  const normalized = normalizeSearch(value);
  const compact = normalizeCompact(value);
  return uniqueValues([normalized, compact]);
}

function searchableFields(item) {
  const aliases = Array.isArray(item.aliases) ? item.aliases : [];
  const titleFields = uniqueValues([item.title, item.originalTitle, item.englishTitle, ...aliases]);
  const metadata = uniqueValues([item.year, mediaLabel(item.type), item.type, item.source, item.region, item.imdbId, item.tmdbId, item.wikidataId, item.tvmazeId]);
  return [
    ...titleFields.map((value) => ({ value, weight: 1 })),
    ...(item.genres || []).map((value) => ({ value, weight: 0.78 })),
    ...(item.cast || []).map((value) => ({ value, weight: 0.66 })),
    ...metadata.map((value) => ({ value, weight: 0.5 })),
    ...(item.overview ? [{ value: item.overview, weight: 0.34 }] : []),
  ];
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
  if (!normalized || !queryContext.normalized) return 0;

  let score = 0;
  if (normalized === queryContext.normalized || compact === queryContext.compact) score = Math.max(score, 180);
  if (normalized.startsWith(queryContext.normalized)) score = Math.max(score, 130);
  if (compact.startsWith(queryContext.compact)) score = Math.max(score, 124);
  if (normalized.includes(queryContext.normalized)) score = Math.max(score, 94);
  if (compact.includes(queryContext.compact)) score = Math.max(score, 88);

  if (queryContext.tokens.length > 1) {
    const tokenHits = queryContext.tokens.filter((token) => normalized.includes(token) || compact.includes(token));
    if (tokenHits.length === queryContext.tokens.length) score = Math.max(score, 76);
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

  if (queryContext.sound && phoneticKey(compact).startsWith(queryContext.sound)) score = Math.max(score, 36);
  return score;
}

function searchTextScore(item, query) {
  const normalized = normalizeSearch(query);
  const compact = normalizeCompact(query);
  if (!normalized) return 1;
  const queryContext = {
    normalized,
    compact,
    tokens: tokenizeSearch(query),
    grams: ngrams(compact, compact.length <= 4 ? 2 : 3),
    sound: phoneticKey(query),
  };
  const best = searchableFields(item).reduce((maxScore, field) => {
    const score = fieldMatchScore(field.value, queryContext) * field.weight;
    return Math.max(maxScore, score);
  }, 0);

  const aliasParts = uniqueValues([item.title, item.originalTitle, ...(item.aliases || [])]).flatMap(tokenizeSearch);
  const tokenPrefixBonus = aliasParts.some((part) => compact && part.startsWith(compact)) ? 20 : 0;
  return best + tokenPrefixBonus;
}

function queryMatchesItem(item, query) {
  const compact = normalizeCompact(query);
  if (!compact) return true;
  const score = searchTextScore(item, query);
  const threshold = compact.length <= 2 ? 32 : compact.length <= 4 ? 38 : compact.length <= 7 ? 42 : 36;
  return score >= threshold;
}

function searchQueryVariants(query) {
  const normalized = normalizeSearch(query);
  const compact = normalizeCompact(query);
  const variants = [query.trim(), normalized, compact];
  if (/^[a-z0-9]{2,10}$/i.test(compact)) variants.push(compact.split("").join("."));
  if (compact.length >= 5) variants.push(compact.slice(0, -1));
  if (compact.endsWith("l")) variants.push(`${compact}i`);
  if (compact.includes("kgf")) variants.push(compact.replace(/kgf/g, "k.g.f"));
  return uniqueValues(variants);
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
  const aliases = Array.isArray(item.aliases) ? item.aliases : [];
  return [
    item.tmdbId ? `${item.type}:tmdb:${item.tmdbId}` : "",
    item.imdbId ? `${item.type}:imdb:${item.imdbId}` : "",
    item.wikidataId ? `${item.type}:wikidata:${item.wikidataId}` : "",
    item.tvmazeId ? `${item.type}:tvmaze:${item.tvmazeId}` : "",
    item.title ? `${item.type}:title:${normalizeSearch(item.title)}:${item.year || ""}` : "",
    item.originalTitle ? `${item.type}:original:${normalizeSearch(item.originalTitle)}:${item.year || ""}` : "",
    ...aliases.map((alias) => `${item.type}:alias:${normalizeSearch(alias)}:${item.year || ""}`),
  ].filter(Boolean);
}

function mergeItemData(existing, incoming) {
  if (!existing) return { ...incoming, id: itemDisplayId(incoming) };
  const merged = { ...existing, ...incoming };
  ["tmdbId", "posterUrl", "backdropUrl", "overview", "runtime", "imdbId", "wikidataId", "tvmazeId", "source", "originalTitle", "englishTitle"].forEach((key) => {
    merged[key] = incoming[key] || existing[key] || "";
  });
  ["genres", "cast", "seasons", "episodes"].forEach((key) => {
    merged[key] = incoming[key]?.length ? incoming[key] : existing[key] || [];
  });
  merged.aliases = uniqueValues([
    ...(existing.aliases || []),
    ...(incoming.aliases || []),
    existing.title,
    incoming.title,
    existing.originalTitle,
    incoming.originalTitle,
  ]);
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
  const categoryRegion = categoryRegionForView();
  let items = state.items;

  if (categoryRegion) {
    items = items.filter((item) => item.type === "movie" && item.region === categoryRegion);
  } else if (state.view === "watchlist") {
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

  if (categoryRegion) {
    const categorySearch = state.categoryQuery.trim();
    if (categorySearch) items = items.filter((item) => queryMatchesItem(item, categorySearch));
    if (state.categoryGenre !== "all") {
      items = items.filter((item) => (item.genres || []).some((genre) => normalizeSearch(genre) === state.categoryGenre));
    }
  }

  return items;
}

function isCategoryView(view = state.view) {
  return CATEGORY_VIEWS.has(view);
}

function categoryRegionForView(view = state.view) {
  if (view === "bollywood") return "Bollywood";
  if (view === "hollywood") return "Hollywood";
  return "";
}

function categoryTitle(view = state.view) {
  const region = categoryRegionForView(view);
  return region ? `${region} Movies` : "";
}

function categoryBaseItems(region = categoryRegionForView()) {
  if (!region) return [];
  return state.items.filter((item) => item.type === "movie" && item.region === region);
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
    renderDetail(state.selected);
    return;
  }

  els.homeScreen.hidden = false;
  els.quickHelp.hidden = true;
  els.detailPanel.hidden = true;
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
  els.emptyState.hidden = visible.length > 0 || state.isSearching;
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
  els.sectionTitle.textContent = titleMap[state.view] || `Featured on ${APP_NAME}`;
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
        <button class="primary-button" type="button" data-action="play" data-id="${safeText(item.id)}" ${canPlay ? "" : "disabled"}>
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          ${canPlay ? "Play" : "Not Available"}
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

function renderRails(items) {
  if (!items.length) {
    els.railArea.innerHTML = "";
    return;
  }

  const allItems = sortedByScore(state.items);
  const movieItems = state.items.filter((item) => item.type === "movie");
  const hollywoodItems = sortedByScore(movieItems.filter((item) => item.region === "Hollywood"));
  const bollywoodItems = sortedByScore(movieItems.filter((item) => item.region === "Bollywood"));
  const sciFiItems = sortedByScore(state.items.filter((item) => (item.genres || []).some((genre) => /sci-fi|mystery|thriller/i.test(genre))));
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
      key: "bollywood",
      title: "Bollywood Movies",
      subtitle: "High-energy Indian cinema ready to open",
      items: bollywoodItems.slice(0, 16),
      card: "poster",
      category: "bollywood",
    },
    {
      key: "hollywood",
      title: "Hollywood Movies",
      subtitle: "Big-screen favorites and modern blockbusters",
      items: hollywoodItems.slice(0, 16),
      card: "wide",
      category: "hollywood",
    },
    {
      key: "trending",
      title: "Trending Movies",
      subtitle: "Recent films ready to open",
      items: sortedByYear(state.items.filter((item) => item.type === "movie")).slice(0, 12),
      card: "wide",
    },
    {
      key: "binge-tv",
      title: "Binge-Worthy TV",
      subtitle: "Shows with seasons and episode selection",
      items: sortedByScore(state.items.filter((item) => item.type === "tv")).slice(0, 12),
      card: "wide",
    },
    {
      key: "mind-bending",
      title: "Mind-Bending Picks",
      subtitle: "Sci-fi, mystery, and late-night rabbit holes",
      items: sciFiItems.slice(0, 12),
      card: "poster",
    },
    {
      key: "top-rated",
      title: "Top Rated",
      subtitle: "The strongest picks across the whole catalog",
      items: allItems.slice(0, 12),
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
  return `
    <button class="media-card ${opts.wide ? "is-wide" : ""} ${opts.compact ? "is-compact" : ""} ${posterSourceClass}" type="button" data-action="open-title" data-id="${safeText(item.id)}">
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
    </button>
  `;
}

function renderGrid(items) {
  const isSearch = Boolean(state.query);
  els.posterGrid.classList.toggle("search-results", isSearch);
  if (state.isSearching && !items.length) {
    els.posterGrid.innerHTML = renderSkeletonCards(isSearch ? 4 : 8);
    return;
  }
  els.posterGrid.innerHTML = items
    .map(
      (item) => {
        const status = providerStatus(item);
        const source = item.source || APP_NAME;
        const progress = playbackProgress(item);
        return `
      <button class="poster-card ${isSearch ? "search-card" : ""} ${state.selected?.id === item.id ? "is-selected" : ""}" type="button" data-action="open-title" data-id="${safeText(item.id)}">
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
          ${isSearch ? `<span class="result-status ${hasPlayableId(item) ? "is-ready" : ""}">${safeText(status)}</span>` : ""}
          ${isSearch && item.overview ? `<span class="card-overview">${safeText(item.overview)}</span>` : ""}
          ${progress ? progressMarkup(progress, "card-progress") : ""}
        </span>
      </button>
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

  const genreMap = new Map();
  categoryBaseItems()
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
        <input id="categorySearch" value="${safeText(state.categoryQuery)}" placeholder="Search ${safeText(categoryRegionForView())} movies" />
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

function renderDetail(item) {
  if (!item) {
    els.detailPanel.innerHTML = `<div class="panel-empty">Select a title</div>`;
    return;
  }

  const watchText = isWatchlisted(item) ? "Saved" : "Add to Watchlist";
  const canPlay = hasPlayableId(item);
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
  const heroImage = usesPosterArtwork(item) ? item.posterUrl : item.backdropUrl || item.posterUrl;
  const similar = sortedByScore(state.items)
    .filter((candidate) => candidate.id !== item.id && (candidate.type === item.type || (candidate.genres || []).some((genre) => (item.genres || []).includes(genre))))
    .slice(0, 10);

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
        <p class="overview">${safeText(item.overview || "No overview is available yet.")}</p>
        <div class="hero-actions">
          <button class="primary-button" type="button" data-action="play" data-id="${safeText(item.id)}" ${canPlay ? "" : "disabled"}>
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            ${canPlay ? "Play" : "Not Available"}
          </button>
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
            ${safeText(isLoadingEpisodes ? "Checking latest season list..." : `Choose a season and episode, then press Play.`)}
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
          <div class="episode-list">
            ${episodeOptions
              .slice(0, 16)
              .map(
                (ep) => `
                <button class="episode-card ${ep.number === selectedEpisode ? "is-active" : ""}" type="button" data-action="choose-episode" data-id="${safeText(item.id)}" data-season="${selectedSeason}" data-episode="${ep.number}">
                  <span>Episode ${ep.number}</span>
                  <strong>${safeText(ep.name || `Season ${selectedSeason}, Episode ${ep.number}`)}</strong>
                  <small>${canPlay ? "Available" : "Not available"}</small>
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
        <div class="cast-list">${people.map((person) => `<span>${safeText(person)}</span>`).join("")}</div>
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
  if (!id) return null;
  return (
    state.items.find((item) => item.id === id) ||
    state.searchCache.get(id) ||
    SEED_TITLES.map(normalizeSeed).find((item) => item.id === id) ||
    null
  );
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
  const id = providerId(item);
  const base =
    item.type === "tv"
      ? `${VIDKING_BASE}/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`
      : `${VIDKING_BASE}/movie/${encodeURIComponent(id)}`;

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

function playItem(item, opts = {}) {
  if (!item) return;
  if (!hasPlayableId(item)) {
    openTitle(item);
    return;
  }

  const season = item.type === "tv" ? opts.season || state.currentSeason || 1 : 1;
  const episode = item.type === "tv" ? opts.episode || state.currentEpisode || 1 : 1;
  state.currentSeason = season;
  state.currentEpisode = episode;
  state.activePlayerId = item.id;

  const url = buildVidkingUrl(item, season, episode);
  syncPlayerLabels(item, season, episode);
  setPlayerSource(url);
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

function normalizeTmdbItem(item, explicitType) {
  const type = explicitType || item.media_type;
  const isTv = type === "tv";
  const date = isTv ? item.first_air_date : item.release_date;
  return {
    id: `${isTv ? "tv" : "movie"}-${item.id}`,
    type: isTv ? "tv" : "movie",
    tmdbId: item.id,
    title: isTv ? item.name : item.title,
    originalTitle: isTv ? item.original_name || item.name : item.original_title || item.title,
    aliases: uniqueValues([isTv ? item.name : item.title, isTv ? item.original_name : item.original_title]),
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
    .map((item, index) => {
      const normalized = normalizeTmdbItem(item);
      return { ...normalized, aliases: uniqueValues([...(normalized.aliases || []), query]), searchRank: index };
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
    aliases: uniqueValues([show.name, show.language, show.network?.name, show.webChannel?.name]),
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
    .map((item) => ({ ...item, aliases: uniqueValues([...(item.aliases || []), query]) }));
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
  const title = item.l || "";
  const aliases = uniqueValues([title, item.s, item.q, item.rank ? String(item.rank) : ""]);
  return {
    id: `${type}-${item.id}`,
    type,
    imdbId: item.id,
    title,
    originalTitle: title,
    aliases,
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
      .map((item, index) => {
        const normalized = normalizeImdbSuggestion(item, index);
        return { ...normalized, aliases: uniqueValues([...(normalized.aliases || []), query]) };
      });
  } catch {
    return [];
  }
}

function searchResultScore(item, query) {
  let score = searchTextScore(item, query) * 2;

  if (hasPlayableId(item)) score += 26;
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

  const requests = [
    state.profile.tmdbKey ? Promise.all(variants.map((variant) => tmdbSearchPages(variant))).then((lists) => lists.flat()) : Promise.resolve([]),
    Promise.all(variants.map((variant) => searchWikidataMedia(variant))).then((lists) => lists.flat()),
    Promise.all(variants.map((variant) => searchImdbSuggestions(variant))).then((lists) => lists.flat()),
    Promise.all(
      variants.map((variant) =>
        fetch(`${TVMAZE_API}/search/shows?q=${encodeURIComponent(variant)}`)
          .then((response) => (response.ok ? response.json() : []))
          .then((data) =>
            data.map((result, index) => {
              const normalized = normalizeTvMazeResult(result);
              return { ...normalized, aliases: uniqueValues([...(normalized.aliases || []), variant]), searchRank: index };
            }),
          )
          .catch(() => []),
      ),
    ).then((lists) => lists.flat()),
  ];

  const results = await Promise.all(requests.map(settleList));
  if (token !== state.searchToken) return;

  state.items = sortSearchResults(mergeItems(SEED_TITLES.map(normalizeSeed), state.items, ...results, localMatches), query);
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
  const returnHash = location.hash.startsWith("#/category/") ? location.hash : "";
  state.page = "detail";
  state.selected = item;
  state.currentSeason = 1;
  state.currentEpisode = 1;
  scrollToTop("auto");
  render();
  enrichSelected(item);
  if (push) history.pushState({ page: "detail", id: item.id, returnHash }, "", `#/title/${encodeURIComponent(item.id)}`);
}

function closeTitle(push = true) {
  state.page = "home";
  scrollToTop("auto");
  render();
  if (push && location.hash.startsWith("#/title/")) {
    const returnHash = history.state?.returnHash;
    if (returnHash) {
      history.pushState({ page: "category" }, "", returnHash);
      restoreRouteFromHash();
    } else {
      history.pushState({ page: "home" }, "", location.pathname);
    }
  }
}

function restoreRouteFromHash() {
  const categoryMatch = location.hash.match(/^#\/category\/(bollywood|hollywood)$/);
  if (categoryMatch) {
    openCategoryPage(categoryMatch[1], false);
    return true;
  }

  const match = location.hash.match(/^#\/title\/(.+)$/);
  if (!match) return false;
  const item = findItem(decodeURIComponent(match[1]));
  if (!item) return false;
  openTitle(item, false);
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
  if (location.hash) history.pushState({ page: "home" }, "", location.pathname);
}

function openCategoryPage(category, push = true) {
  if (!CATEGORY_VIEWS.has(category)) return;
  cancelActiveSearch();
  state.page = "home";
  state.view = category;
  state.filter = "movie";
  clearQueryValue();
  resetCategoryState();
  state.selected = displayItems()[0] || state.items[0] || null;
  setActiveNav();
  setActiveFilter();
  scrollToTop();
  render();
  enrichSelected(state.selected);
  if (push) history.pushState({ page: "category", category }, "", `#/category/${category}`);
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
    if (isCategoryView() && state.filter !== "movie") {
      state.view = "home";
      resetCategoryState();
    }
    setActiveNav();
    setActiveFilter();
    state.selected = displayItems()[0] || state.items[0] || null;
    scrollToTop();
    render();
    enrichSelected(state.selected);
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
    moved: false,
  };
  track.classList.add("is-pressed");
  track.setPointerCapture?.(event.pointerId);
});

document.addEventListener("pointermove", (event) => {
  if (!dragScroll) return;
  const delta = event.clientX - dragScroll.startX;
  const distance = Math.abs(delta);
  dragScroll.distance = Math.max(dragScroll.distance, distance);
  if (distance > DRAG_START_THRESHOLD) {
    dragScroll.moved = true;
    dragScroll.track.classList.add("is-dragging");
    event.preventDefault();
  }
  if (dragScroll.moved) dragScroll.track.scrollLeft = dragScroll.scrollLeft - delta;
});

function finishDragScroll(event) {
  if (!dragScroll) return;
  const { track, pointerId, moved, distance } = dragScroll;
  if (!event || event.pointerId === pointerId) {
    try {
      track.releasePointerCapture?.(pointerId);
    } catch {
      // Pointer capture can already be released if the browser scrolls natively.
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
  if (!restoreRouteFromHash()) {
    state.page = "home";
    if (!location.hash) {
      state.view = "home";
      state.filter = "all";
      resetCategoryState();
    }
    render();
  }
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
if (!restoreRouteFromHash()) render();
hydrateHome();
startHeroRotation();
