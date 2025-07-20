import { useState, useEffect } from 'react';

export interface Song {
  id: number;
  title: string;
  level: number;
  difficulty: 'HYPER' | 'ANOTHER' | 'LEGGENDARIA';
  difficultyCode: string;
  bpi: number;
  wr: number;
  avg: number;
  notes: number;
  bpm: string;
  bpiData?: {
    excellent: number;
    score17_18: number;
    score8_9: number;
    score15_18: number;
    average: number;
  };
}

export interface UserScore {
  grade: string;
  score: number | null;
  bpi: number | null;
  date: string;
}

export function useBpiData() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [userScores, setUserScores] = useState<Record<number, UserScore>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserScores = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iidxScores');
      console.log('Raw localStorage data:', saved);
      const scores = saved ? JSON.parse(saved) : {};
      console.log('Parsed userScores from localStorage:', scores);
      console.log('Number of songs with scores:', Object.keys(scores).length);
      return scores;
    }
    return {};
  };

  const saveUserScores = (scores: Record<number, UserScore>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('iidxScores', JSON.stringify(scores));
    }
  };

  const fetchBpiData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const url = forceRefresh 
        ? '/api/bpi-data?refresh=true'
        : '/api/bpi-data';

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setSongs(result.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Failed to fetch BPI data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to sample data
      setSongs([
        {
          id: 1,
          title: "Abraxas",
          level: 11,
          difficulty: "ANOTHER",
          difficultyCode: "4",
          bpi: 0,
          wr: 2472,
          avg: 2178,
          notes: 1241,
          bpm: "165",
          bpiData: {
            excellent: 100,
            score17_18: 57,
            score8_9: 10,
            score15_18: -37,
            average: 0
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateUserScore = (songId: number, userScore: UserScore) => {
    console.log('updateUserScore called with:', { songId, userScore });
    console.log('Current userScores state:', userScores);
    
    const newScores = { ...userScores, [songId]: userScore };
    console.log('New userScores to set:', newScores);
    
    setUserScores(newScores);
    saveUserScores(newScores);
  };

  const removeUserScore = (songId: number) => {
    console.log('removeUserScore called for:', songId);
    const newScores = { ...userScores };
    delete newScores[songId];
    
    setUserScores(newScores);
    saveUserScores(newScores);
  };

  const calculateBPI = (songId: number, userScore: number): number | null => {
    const song = songs.find(s => s.id === songId);
    if (!song || !song.wr || !song.avg) {
      return null;
    }
    
    const bpi = ((userScore - song.avg) / (song.wr - song.avg)) * 100;
    return Math.round(bpi * 100) / 100;
  };

  const refreshData = () => {
    fetchBpiData(true);
  };

  useEffect(() => {
    const initialScores = loadUserScores();
    console.log('Initial scores loaded in useEffect:', initialScores);
    setUserScores(initialScores);
    fetchBpiData();
  }, []);

  // userScores が変更されたときにログを出力
  useEffect(() => {
    console.log('userScores state changed:', userScores);
  }, [userScores]);

  return {
    songs,
    userScores,
    loading,
    error,
    updateUserScore,
    removeUserScore,
    calculateBPI,
    refreshData
  };
}