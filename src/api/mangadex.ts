// MangaDex API Client Module
const BASE_URL = 'https://api.mangadex.org';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

interface CacheEntry {
  data: any;
  timestamp: number;
}

const apiCache = new Map<string, CacheEntry>();

async function fetchWithCache<T>(url: string): Promise<T> {
  const cached = apiCache.get(url);
  const now = Date.now();

  if (cached && (now - cached.timestamp < CACHE_DURATION)) {
    return cached.data as T;
  }

  // MangaDex requests a rate limit of 5 requests/sec. We add a tiny delay to be safe if requests are fired in parallel.
  await new Promise(resolve => setTimeout(resolve, 50));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} for ${url}`);
  }

  const data = await response.json();
  apiCache.set(url, { data, timestamp: now });
  return data as T;
}

// Interfaces
export interface Manga {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  status: string;
  year?: number;
  tags: string[];
  author: string;
  artist: string;
}

export interface Chapter {
  id: string;
  chapterNum: string;
  volumeNum: string | null;
  title: string;
  publishAt: string;
  language: string;
  scanGroup: string;
  mangaId: string;
}

export interface ChapterPages {
  pages: string[];
  saverPages: string[];
  baseUrl: string;
  hash: string;
}

// Helpers to parse API response structures
function getCoverFilename(mangaRel: any): string | null {
  if (!mangaRel.relationships) return null;
  const coverRel = mangaRel.relationships.find((r: any) => r.type === 'cover_art');
  return coverRel?.attributes?.fileName || null;
}

function getAuthorName(mangaRel: any): string {
  if (!mangaRel.relationships) return 'Desconhecido';
  const authorRel = mangaRel.relationships.find((r: any) => r.type === 'author');
  return authorRel?.attributes?.name || 'Desconhecido';
}

function getArtistName(mangaRel: any): string {
  if (!mangaRel.relationships) return 'Desconhecido';
  const artistRel = mangaRel.relationships.find((r: any) => r.type === 'artist');
  return artistRel?.attributes?.name || 'Desconhecido';
}

function parseMangaData(item: any): Manga {
  const titleMap = item.attributes.title || {};
  const title = titleMap.pt_br || titleMap.pt || titleMap.en || Object.values(titleMap)[0] || 'Sem Título';
  
  const descMap = item.attributes.description || {};
  const description = descMap.pt_br || descMap.pt || descMap.en || Object.values(descMap)[0] || 'Sem descrição disponível.';

  const coverFileName = getCoverFilename(item);
  const coverUrl = coverFileName 
    ? `https://uploads.mangadex.org/covers/${item.id}/${coverFileName}.512.jpg`
    : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=512&q=80'; // fallback beautiful anime placeholder

  const tags = item.attributes.tags
    .map((t: any) => {
      const nameMap = t.attributes.name || {};
      return nameMap.pt_br || nameMap.en;
    })
    .filter(Boolean);

  return {
    id: item.id,
    title,
    description,
    coverUrl,
    status: item.attributes.status,
    year: item.attributes.year,
    tags,
    author: getAuthorName(item),
    artist: getArtistName(item)
  };
}

// Exported API Functions

/**
 * Fetch latest updated mangas
 */
export async function getLatestManga(page: number = 0, limit: number = 20): Promise<Manga[]> {
  const offset = page * limit;
  const url = `${BASE_URL}/manga?limit=${limit}&offset=${offset}&order[latestUploadedChapter]=desc&includes[]=cover_art&includes[]=author&includes[]=artist&contentRating[]=safe&contentRating[]=suggestive`;
  
  const res = await fetchWithCache<any>(url);
  if (!res.data) return [];
  return res.data.map(parseMangaData);
}

/**
 * Fetch popular mangas for the Hero banner or sliders
 */
export async function getPopularManga(limit: number = 10): Promise<Manga[]> {
  const url = `${BASE_URL}/manga?limit=${limit}&order[followedCount]=desc&includes[]=cover_art&includes[]=author&includes[]=artist&contentRating[]=safe&contentRating[]=suggestive`;
  
  const res = await fetchWithCache<any>(url);
  if (!res.data) return [];
  return res.data.map(parseMangaData);
}


/**
 * Search manga by title
 */
export async function searchManga(query: string, limit: number = 24): Promise<Manga[]> {
  if (!query.trim()) return [];
  const encodedQuery = encodeURIComponent(query);
  const url = `${BASE_URL}/manga?title=${encodedQuery}&limit=${limit}&includes[]=cover_art&includes[]=author&includes[]=artist&contentRating[]=safe&contentRating[]=suggestive`;
  
  const res = await fetchWithCache<any>(url);
  if (!res.data) return [];
  return res.data.map(parseMangaData);
}

/**
 * Fetch single manga details
 */
export async function getMangaDetails(mangaId: string): Promise<Manga> {
  const url = `${BASE_URL}/manga/${mangaId}?includes[]=cover_art&includes[]=author&includes[]=artist`;
  const res = await fetchWithCache<any>(url);
  if (!res.data) throw new Error('Mangá não encontrado');
  return parseMangaData(res.data);
}

/**
 * Fetch manga chapters
 */
export async function getMangaChapters(mangaId: string): Promise<Chapter[]> {
  // Fetch chapters in Portuguese and English
  const url = `${BASE_URL}/manga/${mangaId}/feed?limit=500&translatedLanguage[]=pt-br&translatedLanguage[]=en&order[chapter]=desc&order[volume]=desc&includes[]=scanlation_group&includeEmptyPages=0`;
  
  const res = await fetchWithCache<any>(url);
  if (!res.data) return [];

  return res.data.map((item: any) => {
    const scanGroupRel = item.relationships?.find((r: any) => r.type === 'scanlation_group');
    const scanGroup = scanGroupRel?.attributes?.name || 'Scan Independente';
    const mangaRel = item.relationships?.find((r: any) => r.type === 'manga');

    return {
      id: item.id,
      chapterNum: item.attributes.chapter || '0',
      volumeNum: item.attributes.volume || null,
      title: item.attributes.title || '',
      publishAt: item.attributes.publishAt,
      language: item.attributes.translatedLanguage,
      scanGroup,
      mangaId: mangaRel?.id || mangaId
    };
  });
}

/**
 * Fetch details of a specific chapter (to get the manga ID and title info)
 */
export async function getChapterDetails(chapterId: string): Promise<Chapter> {
  const url = `${BASE_URL}/chapter/${chapterId}?includes[]=manga&includes[]=scanlation_group`;
  const res = await fetchWithCache<any>(url);
  if (!res.data) throw new Error('Capítulo não encontrado');
  
  const item = res.data;
  const scanGroupRel = item.relationships?.find((r: any) => r.type === 'scanlation_group');
  const scanGroup = scanGroupRel?.attributes?.name || 'Scan Independente';
  const mangaRel = item.relationships?.find((r: any) => r.type === 'manga');

  return {
    id: item.id,
    chapterNum: item.attributes.chapter || '0',
    volumeNum: item.attributes.volume || null,
    title: item.attributes.title || '',
    publishAt: item.attributes.publishAt,
    language: item.attributes.translatedLanguage,
    scanGroup,
    mangaId: mangaRel?.id || ''
  };
}

/**
 * Fetch page images for a chapter
 */
export async function getChapterPages(chapterId: string): Promise<ChapterPages> {
  const url = `${BASE_URL}/at-home/server/${chapterId}`;
  const res = await fetchWithCache<any>(url);
  
  if (res.result !== 'ok') {
    throw new Error('Erro ao obter as páginas do capítulo');
  }

  const host = res.baseUrl;
  const hash = res.chapter.hash;
  
  // Pages are loaded as {host}/data/{hash}/{filename} for original
  // and {host}/data-saver/{hash}/{filename} for saver
  const pages = res.chapter.data.map((file: string) => `${host}/data/${hash}/${file}`);
  const saverPages = res.chapter.dataSaver.map((file: string) => `${host}/data-saver/${hash}/${file}`);

  return {
    pages,
    saverPages,
    baseUrl: host,
    hash
  };
}
