import { useState, useEffect, useCallback } from 'react';

export interface Song {
  id: number;
  title: string;
  difficulty: string;
  level: number;
  notes: number;
  bpm: string;
  wr?: number;
  avg?: number;
  bpiData?: Record<string, unknown>;
}

export interface UserScore {
  grade: string;
  score: number | null;
  bpi: number | null;
  date: string;
}

// 89%スコアを動的計算する関数
export function calculate89Score(song: Song): number {
  if (!song.notes) return 0;
  return Math.round(song.notes * 2 * 0.889);
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
      const formattedSongs: Song[] = data.map((song: Record<string, unknown>) => ({
        id: song.id as number,
        title: song.title as string,
        difficulty: song.difficulty as string,
        level: song.level as number,
        notes: song.notes as number,
        bpm: song.bpm as string,
        wr: song.wr as number,
        avg: song.avg as number,
        bpiData: song.bpiData as Record<string, unknown>,
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
  const calculateBPI = (score: number, song: Song): number => {
    if (!score || !song.wr || !song.avg) return 0;
    
    const targetScore89 = calculate89Score(song); // 89%スコア
    const maxScore = song.wr;
    
    if (maxScore === 0 || maxScore <= targetScore89) return 0;
    
    // BPI = (自分のスコア - 89%スコア) / (MAX - 89%スコア) * 100
    const bpi = ((score - targetScore89) / (maxScore - targetScore89)) * 100;
    return Math.round(bpi * 100) / 100; // 小数点以下2桁
  };

  // ユーザースコアの更新
  const updateUserScore = useCallback(async (songId: number, scoreData: Record<string, unknown>) => {
    try {
      // 対象楽曲を取得してBPIを計算
      const song = songs.find(s => s.id === songId);
      const calculatedBpi = song && scoreData.score ? calculateBPI(scoreData.score as number, song) : 0; // Changed from null to 0
      
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

      // ローカル状態を更新（計算されたBPIを含む）
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