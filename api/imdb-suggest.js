export default async function handler(request, response) {
  const query = String(request.query?.q || "").trim().toLowerCase();

  response.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");

  if (!query || query.length < 2) {
    response.status(200).json({ d: [] });
    return;
  }

  const slug = encodeURIComponent(query.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""));
  const first = slug[0] || "a";
  const upstream = `https://v3.sg.media-imdb.com/suggestion/${first}/${slug}.json`;

  try {
    const upstreamResponse = await fetch(upstream, {
      headers: {
        accept: "application/json",
        "user-agent": "FlixDok Vercel search",
      },
    });

    if (!upstreamResponse.ok) {
      response.status(200).json({ d: [] });
      return;
    }

    response.status(200).json(await upstreamResponse.json());
  } catch {
    response.status(200).json({ d: [] });
  }
}
