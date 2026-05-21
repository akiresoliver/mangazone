import { useState, useEffect } from 'react';
import type { Manga } from '../api/mangadex';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

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
  const { user } = useAuth();

  useEffect(() => {
    // 1. Load from LocalStorage first for instant UX
    const stored = localStorage.getItem('mangastop_favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {}
    }

    // 2. If logged in, fetch from Firestore and merge/sync
    if (user) {
      const fetchCloud = async () => {
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().favorites) {
          const cloudFavs = snap.data().favorites as Manga[];
          setFavorites(cloudFavs);
          localStorage.setItem('mangastop_favorites', JSON.stringify(cloudFavs));
        }
      };
      fetchCloud();
    }
  }, [user]);

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

    if (user) {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { favorites: updated }, { merge: true });
    }
  };

  const isFavorite = (mangaId: string) => {
    return favorites.some((f) => f.id === mangaId);
  };

  return { favorites, toggleFavorite, isFavorite };
}

// Custom hook to manage history
export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // 1. Load from LocalStorage
    const stored = localStorage.getItem('mangastop_history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {}
    }

    // 2. Fetch from Firestore
    if (user) {
      const fetchCloud = async () => {
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().history) {
          const cloudHistory = snap.data().history as HistoryEntry[];
          setHistory(cloudHistory);
          localStorage.setItem('mangastop_history', JSON.stringify(cloudHistory));
        }
      };
      fetchCloud();
    }
  }, [user]);

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

    if (user) {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { history: updated }, { merge: true });
    }
  };

  const getMangaProgress = (mangaId: string) => {
    return history.find((h) => h.mangaId === mangaId) || null;
  };

  const clearHistory = async () => {
    setHistory([]);
    localStorage.removeItem('mangastop_history');
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { history: [] }, { merge: true });
    }
  };

  return { history, saveHistory, getMangaProgress, clearHistory };
}
