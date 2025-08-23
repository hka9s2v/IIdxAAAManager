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
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { songs, userScores, loading, error, updateUserScore, removeUserScore } = useBpiDataDB();
  const [filteredSongs, setFilteredSongs] = useState(songs);
  const [currentFilters, setCurrentFilters] = useState({ level: '', search: '' });
  const [sortAscending, setSortAscending] = useState(false); // false = 降順, true = 昇順
  
  useEffect(() => {
    const sorted = [...songs].sort((a, b) => {
      const aValue = (a.notes && a.avg && a.wr) ? 
        calculateAaaBpi({ notes: a.notes, avg: a.avg, wr: a.wr, coef: a.coef }) : 0;
      const bValue = (b.notes && b.avg && b.wr) ? 
        calculateAaaBpi({ notes: b.notes, avg: b.avg, wr: b.wr, coef: b.coef }) : 0;
      return bValue - aValue;
    });
    setFilteredSongs(sorted);
  }, [songs]);

  useEffect(() => {
    if (songs.length > 0) {
      applyFilters(currentFilters);
    }
  }, [userScores, songs]);

  const applyFilters = (filters: Filters) => {
    const filtered = songs.filter(song => {
      const matchesLevel = !filters.level || song.level.toString() === filters.level;
      const matchesSearch = !filters.search || song.title.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesLevel && matchesSearch;
    });

    filtered.sort((a, b) => {
      const aBpi = (a.notes && a.avg && a.wr) ? 
        calculateAaaBpi({ notes: a.notes, avg: a.avg, wr: a.wr, coef: a.coef }) : 0;
      const bBpi = (b.notes && b.avg && b.wr) ? 
        calculateAaaBpi({ notes: b.notes, avg: b.avg, wr: b.wr, coef: b.coef }) : 0;
      return sortAscending ? aBpi - bBpi : bBpi - aBpi;
    });

    setFilteredSongs(filtered);
  };

  const handleFilterChange = (filters: Filters) => {
    setCurrentFilters(filters);
    applyFilters(filters);
  };

  const toggleSortOrder = () => {
    setSortAscending(!sortAscending);
  };

  useEffect(() => {
    if (songs.length > 0) {
      applyFilters(currentFilters);
    }
  }, [sortAscending]);

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
          sortAscending={sortAscending} 
          onToggleSort={toggleSortOrder}
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