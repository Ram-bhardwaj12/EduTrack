// Accepts watch?v=, youtu.be/, shorts/, and already-embed URLs; returns an
// embeddable URL, or null if the string isn't a recognizable YouTube link
// (so callers can fall back to a plain "watch" link for other video hosts).
export function getYoutubeEmbedUrl(url) {
  if (!url) return null;

  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
      if (u.pathname.startsWith("/embed/")) {
        return `https://www.youtube-nocookie.com${u.pathname}`;
      }
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/")[2];
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
    }

    return null;
  } catch {
    return null;
  }
}
