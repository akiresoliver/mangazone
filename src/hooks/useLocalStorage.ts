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
      } catch (e) {}
    }
  }, []);

  const toggleFavorite = async (manga: Manga) => {
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
      } catch (e) {}
    }
  }, []);

  const saveHistory = async (
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

    const filtered = history.filter((h) => h.mangaId !== mangaId);
    const updated = [newEntry, ...filtered].slice(0, 20); // Keep last 20

    setHistory(updated);
    localStorage.setItem('mangastop_history', JSON.stringify(updated));
  };

  const getMangaProgress = (mangaId: string) => {
    return history.find((h) => h.mangaId === mangaId) || null;
  };

  const clearHistory = async () => {
    setHistory([]);
    localStorage.removeItem('mangastop_history');
  };

  return { history, saveHistory, getMangaProgress, clearHistory };
}

// Custom hook to manage ratings
export function useRatings() {
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    const stored = localStorage.getItem('mangastop_ratings');
    if (stored) {
      try {
        setRatings(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const saveRating = (mangaId: string, rating: number) => {
    const newRatings = { ...ratings, [mangaId]: rating };
    setRatings(newRatings);
    localStorage.setItem('mangastop_ratings', JSON.stringify(newRatings));
  };

  const getRating = (mangaId: string) => {
    return ratings[mangaId] || 0;
  };

  return { ratings, saveRating, getRating };
}
