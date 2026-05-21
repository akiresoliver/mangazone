import { useState, useEffect } from 'react';
import type { Manga } from '../api/mangadex';

export interface HistoryEntry {
  mangaId: string;
  mangaTitle: string;
  mangaCover: string;
  chapterId: string;
  chapterNum: string;
  chapterTitle: string;
  timestamp: number;
}

// Custom hook to manage favorites
export function useFavorites() {
  const [favorites, setFavorites] = useState<Manga[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('mangastop_favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleFavorite = (manga: Manga) => {
    const isFav = favorites.some((f) => f.id === manga.id);
    let updated: Manga[];
    
    if (isFav) {
      updated = favorites.filter((f) => f.id !== manga.id);
    } else {
      updated = [...favorites, manga];
    }
    
    setFavorites(updated);
    localStorage.setItem('mangastop_favorites', JSON.stringify(updated));
  };

  const isFavorite = (mangaId: string) => {
    return favorites.some((f) => f.id === mangaId);
  };

  return { favorites, toggleFavorite, isFavorite };
}

// Custom hook to manage history
export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('mangastop_history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveHistory = (
    mangaId: string,
    mangaTitle: string,
    mangaCover: string,
    chapterId: string,
    chapterNum: string,
    chapterTitle: string
  ) => {
    const newEntry: HistoryEntry = {
      mangaId,
      mangaTitle,
      mangaCover,
      chapterId,
      chapterNum,
      chapterTitle,
      timestamp: Date.now(),
    };

    // Remove existing entry for the same manga to avoid duplicates, then prepend the new one
    const filtered = history.filter((h) => h.mangaId !== mangaId);
    const updated = [newEntry, ...filtered].slice(0, 20); // Keep last 20 read mangas

    setHistory(updated);
    localStorage.setItem('mangastop_history', JSON.stringify(updated));
  };

  const getMangaProgress = (mangaId: string) => {
    return history.find((h) => h.mangaId === mangaId) || null;
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('mangastop_history');
  };

  return { history, saveHistory, getMangaProgress, clearHistory };
}
