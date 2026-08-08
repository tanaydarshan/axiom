interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

async function googleNewsRSS(query: string, count = 8): Promise<SearchResult[]> {
  const encoded = encodeURIComponent(query);
  const response = await fetch(
    `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`,
    { headers: { 'User-Agent': 'Mozilla/5.0' } },
  );

  if (!response.ok) return [];
  const xml = await response.text();
  const results: SearchResult[] = [];

  const regex =
    /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<description>([\s\S]*?)<\/description>/g;
  let m;
  while ((m = regex.exec(xml)) && results.length < count) {
    const title = m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    const url = m[2].trim();
    const snippet = m[3]
      .replace(/<!\[CDATA\[|\]\]>/g, '')
      .replace(/<[^>]+>/g, '')
      .trim()
      .substring(0, 300);
    if (title) results.push({ title, url, snippet });
  }

  return results;
}

export async function webSearch(query: string, numResults = 8): Promise<SearchResult[]> {
  return googleNewsRSS(query, numResults);
}

export function formatSearchResults(results: SearchResult[]): string {
  if (!results.length) return 'No search results found.';
  return results
    .map(
      (r, i) =>
        `[${i + 1}] ${r.title}\n    URL: ${r.url}\n    ${r.snippet}`,
    )
    .join('\n\n');
}
