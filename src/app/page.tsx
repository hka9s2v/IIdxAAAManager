'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useBpiDataDB } from '@/hooks/useBpiDataDB';
import { FilterBar } from '@/components/FilterBar';
import { SongGrid } from '@/components/SongGrid';
import { calculateAaaBpi } from '@/utils/bpiCalculations';
import { Header } from '@/components/Header';
import { ScrollToTop } from '@/components/ScrollToTop';

interface Filters {
  level: string;
  search: string;
  grade: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { songs, userScores, loading, error, updateUserScore, removeUserScore } = useBpiDataDB();
  const [filteredSongs, setFilteredSongs] = useState(songs);
  const [currentFilters, setCurrentFilters] = useState({ level: '', search: '', grade: '' });
  
  useEffect(() => {
    const sorted = [...songs].sort((a, b) => {
      const aValue = (a.notes && a.avg && a.wr) ? 
        calculateAaaBpi({ notes: a.notes, avg: a.avg, wr: a.wr, coef: a.coef }) : -999;
      const bValue = (b.notes && b.avg && b.wr) ? 
        calculateAaaBpi({ notes: b.notes, avg: b.avg, wr: b.wr, coef: b.coef }) : -999;
      
      // -999（データ不足）の楽曲は常に最後に配置
      if (aValue === -999 && bValue === -999) return 0;
      if (aValue === -999) return 1;
      if (bValue === -999) return -1;
      
      // デフォルトは降順（高BPI → 低BPI）
      return bValue - aValue;
    });
    setFilteredSongs(sorted);
  }, [songs]);

  useEffect(() => {
    if (songs.length > 0) {
      applyFilters(currentFilters);
    }
  }, [userScores, songs]);

  const applyFilters = useCallback((filters: Filters) => {
    const filtered = songs.filter(song => {
      const matchesLevel = !filters.level || song.level.toString() === filters.level;
      const matchesSearch = !filters.search || song.title.toLowerCase().includes(filters.search.toLowerCase());
      
      // グレードフィルター：ユーザーのスコアがある楽曲のみ対象
      const userScore = userScores[song.id];
      const matchesGrade = !filters.grade || (userScore && userScore.grade === filters.grade);
      
      return matchesLevel && matchesSearch && matchesGrade;
    });

    filtered.sort((a, b) => {
      const aBpi = (a.notes && a.avg && a.wr) ? 
        calculateAaaBpi({ notes: a.notes, avg: a.avg, wr: a.wr, coef: a.coef }) : -999;
      const bBpi = (b.notes && b.avg && b.wr) ? 
        calculateAaaBpi({ notes: b.notes, avg: b.avg, wr: b.wr, coef: b.coef }) : -999;
      
      // -999（データ不足）の楽曲は常に最後に配置
      if (aBpi === -999 && bBpi === -999) return 0;
      if (aBpi === -999) return 1; // aを後に
      if (bBpi === -999) return -1; // bを後に
      
      // 降順固定（高BPI → 低BPI）
      return bBpi - aBpi;
    });

    setFilteredSongs(filtered);
  }, [songs, userScores]);

  const handleFilterChange = (filters: Filters) => {
    setCurrentFilters(filters);
    applyFilters(filters);
  };

  useEffect(() => {
    if (songs.length > 0) {
      applyFilters(currentFilters);
    }
  }, [applyFilters, currentFilters]);

  // 認証チェック
  useEffect(() => {
    if (status === 'loading') return; // ローディング中は何もしない
    if (!session) {
      router.push('/auth/login');
      return;
    }
  }, [session, status, router]);

  // ローディング中または未認証の場合
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return null; // リダイレクト中は何も表示しない
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-96">
          <div className="text-red-600 text-center">
            <h2 className="text-2xl font-bold mb-2">エラーが発生しました</h2>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-4">
                <FilterBar
          onFilterChange={handleFilterChange} 
          songs={filteredSongs}
          userScores={userScores}
        />
        <SongGrid 
          songs={filteredSongs} 
          userScores={userScores} 
          loading={loading}
          updateUserScore={updateUserScore}
          removeUserScore={removeUserScore}
        />
      </main>
      <ScrollToTop />
    </div>
  );
}