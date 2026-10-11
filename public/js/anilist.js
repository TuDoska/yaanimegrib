// Дані про аніме з AniList GraphQL API (https://docs.anilist.co)
const ANILIST_URL = 'https://graphql.anilist.co';
const CACHE_TTL = 5 * 60 * 1000;
const memoryCache = new Map();
let nextSlot = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function cacheGet(key) {
  const hit = memoryCache.get(key);
  if (hit && Date.now() - hit.time < CACHE_TTL) return hit.data;
  try {
    const raw = sessionStorage.getItem('al:' + key);
    if (raw) {
      const { time, data } = JSON.parse(raw);
      if (Date.now() - time < CACHE_TTL) return data;
    }
  } catch { /* ignore */ }
  return null;
}

function cacheSet(key, data) {
  memoryCache.set(key, { time: Date.now(), data });
  try { sessionStorage.setItem('al:' + key, JSON.stringify({ time: Date.now(), data })); } catch { /* повне сховище */ }
}

async function gql(query, variables = {}, { fresh = false, tries = 3 } = {}) {
  const key = (query + JSON.stringify(variables)).replace(/\s+/g, ' ');
  if (!fresh) {
    const cached = cacheGet(key);
    if (cached) return cached;
  }
  // Невелика черга, щоб не впертися в ліміт запитів
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = now + wait + 300;
  await sleep(wait);

  let res;
  try {
    res = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    if (tries > 1) { await sleep(1200); return gql(query, variables, { fresh, tries: tries - 1 }); }
    throw new Error(t('common.network'));
  }
  if (res.status === 429 && tries > 1) {
    await sleep((Number(res.headers.get('Retry-After')) || 3) * 1000);
    return gql(query, variables, { fresh, tries: tries - 1 });
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.errors) {
    const err = new Error(t('common.error'));
    err.status = json.errors?.[0]?.status || res.status;
    throw err;
  }
  cacheSet(key, json.data);
  return json.data;
}

const MEDIA = `
  id
  title { romaji english native }
  coverImage { large extraLarge color }
  bannerImage
  format episodes status averageScore popularity season seasonYear isAdult
  genres
  nextAiringEpisode { episode airingAt }
`;

function cleanDescription(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.innerHTML = text.replace(/<br\s*\/?>/gi, '\n');
  return div.textContent.replace(/\n{3,}/g, '\n\n').trim();
}

function normalize(m) {
  if (!m) return null;
  return {
    id: m.id,
    title: m.title?.english && currentLang === 'en' ? m.title.english : (m.title?.romaji || m.title?.english || '—'),
    titleRomaji: m.title?.romaji,
    titleEnglish: m.title?.english,
    titleNative: m.title?.native,
    cover: m.coverImage?.large || '',
    coverXL: m.coverImage?.extraLarge || m.coverImage?.large || '',
    color: m.coverImage?.color || null,
    banner: m.bannerImage || '',
    format: m.format,
    episodes: m.episodes,
    status: m.status,
    score: m.averageScore ? m.averageScore / 10 : null,
    popularity: m.popularity || 0,
    season: m.season,
    year: m.seasonYear || m.startDate?.year || null,
    isAdult: !!m.isAdult,
    genres: m.genres || [],
    nextEp: m.nextAiringEpisode || null,
    description: cleanDescription(m.description),
    studios: (m.studios?.nodes || []).map((s) => s.name),
    duration: m.duration || null,
    startDate: m.startDate, endDate: m.endDate,
    rank: m.rankings?.find((r) => r.type === 'RATED' && r.allTime)?.rank || null,
    trailerId: m.trailer?.site === 'youtube' ? m.trailer.id : null,
    links: (m.externalLinks || []).filter((l) => l.type === 'STREAMING' && /^https:\/\//.test(l.url)),
    recommendations: (m.recommendations?.nodes || [])
      .map((n) => n.mediaRecommendation).filter((r) => r && !r.isAdult).map(normalize),
  };
}

const LIST_QUERY = `
  query ($page: Int, $perPage: Int, $sort: [MediaSort], $search: String, $genre: String,
         $format: MediaFormat, $status: MediaStatus, $season: MediaSeason, $seasonYear: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total }
      media(type: ANIME, isAdult: false, sort: $sort, search: $search, genre: $genre,
            format: $format, status: $status, season: $season, seasonYear: $seasonYear) { ${MEDIA} }
    }
  }`;

async function alList(variables, opts) {
  const data = await gql(LIST_QUERY, variables, opts);
  return {
    items: data.Page.media.map(normalize),
    hasNext: data.Page.pageInfo.hasNextPage,
    total: data.Page.pageInfo.total,
  };
}

function currentSeason() {
  const d = new Date();
  const m = d.getMonth();
  const season = ['WINTER', 'WINTER', 'SPRING', 'SPRING', 'SPRING', 'SUMMER', 'SUMMER', 'SUMMER', 'FALL', 'FALL', 'FALL', 'WINTER'][m];
  return { season, seasonYear: m === 11 ? d.getFullYear() + 1 : d.getFullYear() };
}

const AniList = {
  trending: (perPage = 6) => alList({ page: 1, perPage, sort: ['TRENDING_DESC'], status: 'RELEASING' }),
  season: (perPage = 12) => alList({ page: 1, perPage, sort: ['POPULARITY_DESC'], ...currentSeason() }),

  search({ q = '', genre = '', format = '', status = '', sort = 'POPULARITY_DESC', page = 1, perPage = 24 } = {}) {
    const v = { page, perPage, sort: [sort] };
    if (q) { v.search = q; if (sort === 'POPULARITY_DESC') v.sort = ['SEARCH_MATCH', 'POPULARITY_DESC']; }
    if (genre) v.genre = genre;
    if (format) v.format = format;
    if (status) v.status = status;
    return alList(v);
  },

  // Серії, що виходять у проміжку [from, to] (Unix-секунди)
  async airing(from, to, { fresh = false, maxPages = 3 } = {}) {
    const query = `
      query ($from: Int, $to: Int, $page: Int) {
        Page(page: $page, perPage: 50) {
          pageInfo { hasNextPage }
          airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME) {
            id airingAt episode media { ${MEDIA} countryOfOrigin }
          }
        }
      }`;
    let all = [];
    for (let page = 1; page <= maxPages; page++) {
      const data = await gql(query, { from, to, page }, { fresh });
      all = all.concat(data.Page.airingSchedules);
      if (!data.Page.pageInfo.hasNextPage) break;
    }
    return all
      .filter((s) => s.media && !s.media.isAdult)
      .map((s) => ({ id: s.id, airingAt: s.airingAt, episode: s.episode, anime: normalize(s.media) }));
  },

  async anime(id, { fresh = false } = {}) {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          ${MEDIA}
          description(asHtml: false)
          duration
          startDate { year month day }
          endDate { year month day }
          studios(isMain: true) { nodes { name } }
          rankings { rank type allTime }
          trailer { id site }
          externalLinks { site url type icon color language }
          recommendations(perPage: 12, sort: RATING_DESC) { nodes { mediaRecommendation { ${MEDIA} } } }
        }
      }`;
    const data = await gql(query, { id }, { fresh });
    return normalize(data.Media);
  },

  // Вже показані серії (найновіші спочатку) з датами
  async episodes(id, page = 1, { fresh = false } = {}) {
    const query = `
      query ($id: Int, $page: Int) {
        Page(page: $page, perPage: 24) {
          pageInfo { hasNextPage total }
          airingSchedules(mediaId: $id, notYetAired: false, sort: EPISODE_DESC) { episode airingAt }
        }
      }`;
    const data = await gql(query, { id, page }, { fresh });
    return { items: data.Page.airingSchedules, hasNext: data.Page.pageInfo.hasNextPage };
  },

  async genres() {
    const data = await gql('query { GenreCollection }');
    return data.GenreCollection.filter((g) => g !== 'Hentai' && g !== 'Ecchi');
  },
};
