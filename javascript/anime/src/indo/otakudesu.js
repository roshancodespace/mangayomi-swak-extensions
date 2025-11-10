const mangayomiSources = [{
  "name": "Otakudesu",
  "id": 3037498600,
  "baseUrl": "https://otakudesu.best",
  "lang": "indo",
  "typeSource": "single",
  "iconUrl": "https://www.google.com/s2/favicons?sz=256&domain=https://otakudesu.best",
  "dateFormat": "",
  "dateFormatLocale": "",
  "isNsfw": false,
  "hasCloudflare": false,
  "sourceCodeUrl": "",
  "apiUrl": "https://www.sankavollerei.com/anime",
  "version": "0.0.1",
  "isManga": false,
  "itemType": 1,
  "isFullData": false,
  "appMinVerReq": "0.5.0",
  "additionalParams": "",
  "sourceCodeLanguage": 1,
  "notes": "",
  "pkgPath": "anime/src/indo/otakudesu.js"
}];

class DefaultExtension extends MProvider {
  constructor() {
    super();
    this.client = new Client();
  }

  getPreference(key) {
    return new SharedPreferences().get(key);
  }

  /** Headers for requests */
  getHeaders(url) {
    return {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "referer": url,
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
    };
  }

  /** Get popular anime list */
  async getPopular(page) {
    const url = `${this.source.apiUrl}/popular/${page}`;
    const headers = this.getHeaders(url);

    const res = await this.client.get(url, headers);
    const data = JSON.parse(res.body)?.data ?? [];

    const list = data.map((d) => ({
      name: d.title,
      link: d.slug,
      imageUrl: d.poster,
    }));

    const hasNextPage = data.length > 0; // API likely paginated
    return { list, hasNextPage };
  }

  /** Get latest updates */
  async getLatestUpdates(page) {
    const url = `${this.source.apiUrl}/latest/${page}`;
    const headers = this.getHeaders(url);

    const res = await this.client.get(url, headers);
    const data = JSON.parse(res.body)?.data ?? [];

    const list = data.map((d) => ({
      name: d.title,
      link: d.slug,
      imageUrl: d.poster,
    }));

    const hasNextPage = data.length > 0;
    return { list, hasNextPage };
  }

  /** Search for anime */
  async search(query, page, filters) {
    const url = `${this.source.apiUrl}/search/${encodeURIComponent(query)}`;
    const headers = this.getHeaders(url);

    const res = await this.client.get(url, headers);
    const data = JSON.parse(res.body)?.data ?? [];

    const list = data.map((d) => ({
      name: d.title,
      link: d.slug,
      imageUrl: d.poster,
    }));

    return { list, hasNextPage: false };
  }

  /** Anime detail + episode list */
  async getDetail(slug) {
    const url = `${this.source.apiUrl}/anime/${slug}`;
    const headers = this.getHeaders(url);

    const res = await this.client.get(url, headers);
    const data = JSON.parse(res.body)?.data ?? {};

    return {
      name: data.title,
      imageUrl: data.poster,
      link: data.slug,
      description: data.synopsis,
      status: data.status ?? "Unknown",
      chapters: (data.episode_lists ?? []).map((ep) => ({
        name: `EP${ep.episode_number}: ${ep.episode}`,
        url: ep.slug,
      })),
    };
  }

  /** Video list for episode */
  async getVideoList(slug) {
    const url = `${this.source.apiUrl}/episode/${slug}`;
    const headers = this.getHeaders(url);

    const res = await this.client.get(url, headers);
    const data = JSON.parse(res.body)?.data ?? {};

    const streams = [];

    // Main streaming URL (HLS)
    if (data.stream_url) {
      streams.push({
        url: data.stream_url,
        originalUrl: data.stream_url,
        quality: "Auto",
        headers,
      });
    }

    // Download URLs (playable + downloadable)
    for (const [format, resolutions] of Object.entries(data.download_urls ?? {})) {
      for (const resObj of resolutions) {
        const resolution = resObj.resolution;
        for (const item of resObj.urls ?? []) {
          streams.push({
            url: item.url,
            originalUrl: item.url,
            quality: `${resolution} - ${item.provider} (${format.toUpperCase()})`,
            headers,
          });
        }
      }
    }

    return streams;
  }

  /** Filter & Preferences (placeholders for future expansion) */
  getFilterList() {
    return [];
  }

  getSourcePreferences() {
    return [];
  }
}
