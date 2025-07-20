import { useState, useEffect, useCallback } from 'react';

export interface Song {
  id: number;
  title: string;
  difficulty: string;
  level: number;
  notes: number;
  bpm: string;
  wr?: number;
  score89?: number;
}

export interface UserScore {
  grade: string;
  score: number | null;
  bpi: number | null;
  date: string;
}

export function useBpiDataDB() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [userScores, setUserScores] = useState<Record<number, UserScore>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 楽曲データの取得
  const fetchSongs = useCallback(async (level?: string) => {
    try {
      setLoading(true);
      const url = level ? `/api/songs?level=${level}` : '/api/songs';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }
      
      const data = await response.json();
      
      // データ形式を既存のフォーマットに変換
      const formattedSongs: Song[] = data.map((song: any) => ({
        id: song.id,
        title: song.title,
        difficulty: song.difficulty,
        level: song.level,
        notes: song.notes,
        bpm: song.bpm,
        wr: song.worldRecord,
        score89: song.score89,
      }));
      
      setSongs(formattedSongs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // ユーザースコアの取得
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
      // ユーザースコアの取得エラーは致命的ではないため、エラー状態にしない
    }
  }, []);

  // BPI計算関数
  const calculateBPI = (score: number | null, song: Song): number | null => {
    if (!score || !song.score89) return null;
    
    const targetScore = song.score89;
    const maxScore = song.wr || 0;
    
    if (maxScore === 0) return null;
    
    // BPI = (自分のスコア - 89%スコア) / (MAX - 89%スコア) * 100
    const bpi = ((score - targetScore) / (maxScore - targetScore)) * 100;
    return Math.round(bpi * 100) / 100; // 小数点以下2桁
  };

  // ユーザースコアの更新
  const updateUserScore = useCallback(async (songId: number, userScore: UserScore) => {
    try {
      // 対象楽曲を取得してBPIを計算
      const song = songs.find(s => s.id === songId);
      const calculatedBpi = song && userScore.score ? calculateBPI(userScore.score, song) : null;
      
      const response = await fetch('/api/user-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId,
          grade: userScore.grade,
          score: userScore.score,
          bpi: calculatedBpi,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user score');
      }

      // ローカル状態を更新（計算されたBPIを含む）
      setUserScores(prev => ({
        ...prev,
        [songId]: {
          ...userScore,
          bpi: calculatedBpi,
        },
      }));
    } catch (err) {
      console.error('Failed to update user score:', err);
      setError(err instanceof Error ? err.message : 'Failed to update score');
    }
  }, [songs]);

  // ユーザースコアの削除
  const removeUserScore = useCallback(async (songId: number) => {
    try {
      const response = await fetch(`/api/user-scores?songId=${songId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user score');
      }

      // ローカル状態を更新
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

  // マスターデータの更新（従来のBPI取得APIを使用）
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 従来のBPI-DATA APIから取得
      const response = await fetch('/api/bpi-data');
      if (!response.ok) {
        throw new Error('Failed to fetch BPI data');
      }
      
      const bpiData = await response.json();
      
      // データベースに保存
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
      
      // 楽曲データを再取得
      await fetchSongs();
      await fetchUserScores();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchSongs, fetchUserScores]);

  // 初期データ取得
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
    fetchSongs, // フィルタリング用
  };
}