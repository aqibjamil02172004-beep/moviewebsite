# FlixDok

FlixDok is a static movie and TV search app with a premium streaming-library interface, local profiles, watchlists, continue-watching state, rating enrichment, expanded metadata search, and Vidking iframe playback.

## Run

Open `public/index.html` directly, or serve the folder with any static server.

```powershell
npx serve public
```

Then visit `http://localhost:5173`.

## Deploy on Vercel

Import this GitHub repository in Vercel. No build command is needed; Vercel serves the `public` folder and deploys `api/imdb-suggest.js` as the IMDb suggestion function.

## APIs

- Vidking playback uses `https://www.vidking.net/embed/movie/{tmdbId}` and `https://www.vidking.net/embed/tv/{tmdbId}/{season}/{episode}`.
- TMDB is optional but recommended for the widest live movie and TV search. Add a free API key in the in-app settings.
- Wikidata is used without a key to map many search results to TMDB movie/show IDs that Vidking can play.
- TVmaze is used for no-key TV show and episode metadata.
- IMDb suggestions are proxied by the included local server to improve poster/title discovery.
- OMDb is optional for extra ratings/details when you add a key.
- Agregarr is used as a no-key IMDb rating helper where an IMDb ID is available.

All profile settings, keys, watchlist items, and continue-watching entries stay in browser local storage.
