import { DESTINATIONS } from "../data/mockCatalog";

/**
 * Destination image service.
 * Prefers Unsplash when an API key is configured, then falls back to Wikimedia.
 */

const UNSPLASH_API_BASE = "https://api.unsplash.com";
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || ""; // Optional, for higher limits

interface UnsplashPhoto {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
}

interface UnsplashResponse {
  results: UnsplashPhoto[];
}

type WikiQueryResponse = {
  query?: {
    pages?: Record<string, { thumbnail?: { source?: string } }>;
  };
};

function resolveDestinationQuery(destination: string): {
  label: string;
  unsplashQuery: string;
  wikiTitle: string;
  wikiSearch: string;
} {
  const match = DESTINATIONS.find(
    (item) => item.destination.toLowerCase() === destination.toLowerCase()
  );

  const label = match ? `${match.destination}, ${match.country}` : destination;
  return {
    label,
    unsplashQuery: `${label} travel destination photography`,
    wikiTitle: label,
    wikiSearch: `${label} travel landmark`
  };
}

async function fetchUnsplashDestinationImage(destination: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    return null;
  }

  const { unsplashQuery } = resolveDestinationQuery(destination);
  const params = new URLSearchParams({
    query: unsplashQuery,
    per_page: "1",
    order_by: "relevant",
    orientation: "landscape"
  });

  const response = await fetch(`${UNSPLASH_API_BASE}/search/photos?${params.toString()}`, {
    headers: {
      "Accept-Version": "v1",
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
    }
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as UnsplashResponse;
  const photo = data.results?.[0];
  if (!photo?.urls?.regular) {
    return null;
  }

  // Safely append attribution params to the returned URL.
  const url = new URL(photo.urls.regular);
  url.searchParams.set("utm_source", "group_trip_planner");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("w", "1200");
  return url.toString();
}

async function fetchWikimediaDestinationImage(destination: string): Promise<string | null> {
  const { wikiTitle, wikiSearch } = resolveDestinationQuery(destination);

  const exactParams = new URLSearchParams({
    action: "query",
    prop: "pageimages",
    titles: wikiTitle,
    pithumbsize: "1200",
    format: "json",
    origin: "*"
  });

  const exactResponse = await fetch(`https://en.wikipedia.org/w/api.php?${exactParams.toString()}`);
  if (exactResponse.ok) {
    const exactData = (await exactResponse.json()) as WikiQueryResponse;
    const exactPages = exactData.query?.pages ?? {};
    const exactPage = Object.values(exactPages)[0];
    if (exactPage?.thumbnail?.source) {
      return exactPage.thumbnail.source;
    }
  }

  const searchParams = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: wikiSearch,
    gsrlimit: "1",
    prop: "pageimages",
    pithumbsize: "1200",
    format: "json",
    origin: "*"
  });

  const response = await fetch(`https://en.wikipedia.org/w/api.php?${searchParams.toString()}`);
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as WikiQueryResponse;
  const pages = data.query?.pages ?? {};
  const firstPage = Object.values(pages)[0];
  return firstPage?.thumbnail?.source ?? null;
}

function hashSeed(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function buildRandomAccommodationImageUrl(accommodationName: string, destination: string) {
  const seed = hashSeed(`${accommodationName}:${destination}`);
  // Picsum is used as a royalty-free random placeholder source.
  return `https://picsum.photos/seed/${seed}/1200/800`;
}

/**
 * Fetch a travel image for a destination from Unsplash
 * Returns a high-quality image URL suitable for the destination
 */
export async function fetchDestinationImage(destination: string): Promise<string | null> {
  try {
    const unsplashImage = await fetchUnsplashDestinationImage(destination);
    if (unsplashImage) {
      return unsplashImage;
    }

    return await fetchWikimediaDestinationImage(destination);
  } catch (error) {
    console.error("Failed to fetch destination image:", error);
    return null;
  }
}

export async function fetchAccommodationImage(accommodationName: string, destination: string): Promise<string | null> {
  try {
    return buildRandomAccommodationImageUrl(accommodationName, destination);
  } catch (error) {
    console.error("Failed to fetch accommodation image:", error);
    return null;
  }
}

/**
 * Batch fetch images for multiple destinations
 * Returns a map of destination to image URL
 */
export async function fetchDestinationImages(destinations: string[]): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};

  // Fetch in parallel but with a small delay to avoid rate limiting
  const promises = destinations.map((dest, index) =>
    new Promise<void>((resolve) => {
      setTimeout(async () => {
        results[dest] = await fetchDestinationImage(dest);
        resolve();
      }, index * 200); // 200ms delay between requests
    })
  );

  await Promise.all(promises);
  return results;
}
