'use client';

import { useState, useEffect, useCallback } from 'react';
import { calculateAaaBpi, calculateAaaScore, calculateUserBpi } from '@/utils/bpiCalculations';

export interface Song {
  id: number;
  title: string;
  difficulty: string;
  level: number;
  notes: number;
  bpm: string;
  wr?: number;
  avg?: number;
  aaaBpi?: number;
  coef?: number; // 譜面係数p
}

export interface UserScore {
  grade: string;
  score: number | null;
  bpi: number | null;
  date: string;
}

export { calculateAaaBpi, calculateAaaScore, calculateUserBpi } from '@/utils/bpiCalculations';

export function useBpiDataDB() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [userScores, setUserScores] = useState<Record<number, UserScore>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSongs = useCallback(async (level?: string) => {
    try {
      setLoading(true);
      const url = level ? `/api/songs?level=${level}` : '/api/songs';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }
      
      const data = await response.json();
      
      const formattedSongs: Song[] = data.map((song: Record<string, unknown>) => ({
        id: song.id as number,
        title: song.title as string,
        difficulty: song.difficulty as string,
        level: song.level as number,
        notes: song.notes as number,
        bpm: song.bpm as string,
        wr: song.wr as number,
        avg: song.avg as number,
        aaaBpi: song.aaaBpi as number,
        coef: song.coef as number, // 譜面係数p
      }));
      
      setSongs(formattedSongs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserScores = useCallback(async () => {
    try {
      const response = await fetch('/api/user-scores');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user scores');
      }
      
      const data = await response.json();
      setUserScores(data);
    } catch (err) {
      console.error('Failed to fetch user scores:', err);
    }
  }, []);

  const calculateBPI = (score: number, song: Song): number => {
    if (!score || !song.wr || !song.avg || !song.notes) return 0;
    
    return calculateUserBpi(score, {
      notes: song.notes,
      avg: song.avg,
      wr: song.wr,
      coef: song.coef // 譜面係数pを使用
    });
  };

  const updateUserScore = useCallback(async (songId: number, scoreData: Record<string, unknown>) => {
    try {
      const song = songs.find(s => s.id === songId);
      const calculatedBpi = song && scoreData.score ? calculateBPI(scoreData.score as number, song) : 0;
      
      const response = await fetch('/api/user-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId,
          grade: scoreData.grade,
          score: scoreData.score,
          bpi: calculatedBpi,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user score');
      }

      setUserScores(prev => ({
        ...prev,
        [songId]: {
          grade: scoreData.grade as string,
          score: scoreData.score as number,
          bpi: calculatedBpi,
          date: new Date().toISOString(),
        },
      }));
    } catch (err) {
      console.error('Failed to update user score:', err);
      setError(err instanceof Error ? err.message : 'Failed to update score');
    }
  }, [songs]);

  const removeUserScore = useCallback(async (songId: number) => {
    try {
      const response = await fetch(`/api/user-scores?songId=${songId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user score');
      }

      setUserScores(prev => {
        const updated = { ...prev };
        delete updated[songId];
        return updated;
      });
    } catch (err) {
      console.error('Failed to delete user score:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete score');
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/bpi-data');
      if (!response.ok) {
        throw new Error('Failed to fetch BPI data');
      }
      
      const bpiData = await response.json();
      
      const importResponse = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bpiData),
      });
      
      if (!importResponse.ok) {
        throw new Error('Failed to import songs to database');
      }
      
      await fetchSongs();
      await fetchUserScores();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchSongs, fetchUserScores]);

  useEffect(() => {
    fetchSongs();
    fetchUserScores();
  }, [fetchSongs, fetchUserScores]);

  return {
    songs,
    userScores,
    loading,
    error,
    refreshData,
    updateUserScore,
    removeUserScore,
    fetchSongs,
  };
}