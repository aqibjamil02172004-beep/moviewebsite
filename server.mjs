import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 5173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(body));
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);
    if (url.pathname === "/api/imdb-suggest") {
      const query = (url.searchParams.get("q") || "").trim().toLowerCase();
      if (!query || query.length < 2) {
        sendJson(response, 200, { d: [] });
        return;
      }

      const slug = encodeURIComponent(query.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""));
      const first = slug[0] || "a";
      const upstream = `https://v3.sg.media-imdb.com/suggestion/${first}/${slug}.json`;
      const upstreamResponse = await fetch(upstream, {
        headers: {
          "user-agent": "FlixDok local search",
          accept: "application/json",
        },
      });

      if (!upstreamResponse.ok) {
        sendJson(response, 200, { d: [] });
        return;
      }

      sendJson(response, 200, await upstreamResponse.json());
      return;
    }

    const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    const filePath = normalize(join(root, requested));

    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type": types[extname(filePath).toLowerCase()] || "application/octet-stream",
      "cache-control": "no-store",
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, () => {
  console.log(`FlixDok running at http://localhost:${port}`);
});
