import { useState, useEffect } from 'react';
import type { Manga } from '../api/mangadex';

export interface HistoryEntry {
  mangaId: string;
  mangaTitle: string;
  mangaCover: string;
  chapterId: string;
  chapterNum: string;
  chapterTitle?: string;
  pageNumber?: number;
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

// Custom hook to manage reading history
export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const stored = localStorage.getItem('mangastop_history');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [];
  });

  const saveHistory = (
    mangaId: string,
    mangaTitle: string,
    mangaCover: string,
    chapterId: string,
    chapterNum: string,
    chapterTitle: string,
    pageNumber: number = 0
  ) => {
    const newEntry: HistoryEntry = {
      mangaId,
      mangaTitle,
      mangaCover,
      chapterId,
      chapterNum,
      chapterTitle,
      pageNumber,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      // Also read from localStorage to guarantee no stale closures if called from multiple tabs/fast renders
      const stored = localStorage.getItem('mangastop_history');
      let currentHistory = prev;
      if (stored) {
        try { currentHistory = JSON.parse(stored); } catch (e) {}
      }
      
      const filtered = currentHistory.filter((h) => h.mangaId !== mangaId);
      const updated = [newEntry, ...filtered].slice(0, 20); // Keep last 20
      
      localStorage.setItem('mangastop_history', JSON.stringify(updated));
      return updated;
    });
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
