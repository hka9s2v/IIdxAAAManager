'use client';

import { useState, useEffect } from 'react';
import { SongGrid } from '@/components/SongGrid';
import { FilterBar } from '@/components/FilterBar';
import { AuthButton } from '@/components/AuthButton';
import { useBpiDataDB } from '@/hooks/useBpiDataDB';

export default function Home() {
  const { songs, userScores, loading, error, refreshData, updateUserScore, removeUserScore } = useBpiDataDB();
  const [filteredSongs, setFilteredSongs] = useState(songs);
  const [currentFilters, setCurrentFilters] = useState({ level: '', search: '' });
  const [sortAscending, setSortAscending] = useState(false); // false = 降順, true = 昇順
  
  console.log('Home component userScores count:', Object.keys(userScores).length);

  useEffect(() => {
    // 初期読み込み時も89%BPI高い順でソート
    const sorted = [...songs].sort((a, b) => {
      return (b.score89 || 0) - (a.score89 || 0);
    });
    setFilteredSongs(sorted);
  }, [songs]);

  // userScores が変更されたときも現在のフィルターを維持して再フィルタリング
  useEffect(() => {
    console.log('userScores changed in Home component, triggering re-filter with current filters');
    if (songs.length > 0) {
      applyFilters(currentFilters);
    }
  }, [userScores, songs]);

  const applyFilters = (filters: any) => {
    let filtered = songs.filter(song => {
      const matchesLevel = !filters.level || song.level.toString() === filters.level;
      const matchesSearch = !filters.search || song.title.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesLevel && matchesSearch;
    });

    // ソート順に応じて89%BPIでソート
    filtered.sort((a, b) => {
      const aBpi = a.score89 || 0;
      const bBpi = b.score89 || 0;
      return sortAscending ? aBpi - bBpi : bBpi - aBpi;
    });

    setFilteredSongs(filtered);
  };

  const handleFilterChange = (filters: any) => {
    setCurrentFilters(filters);
    applyFilters(filters);
  };

  const toggleSortOrder = () => {
    setSortAscending(!sortAscending);
  };

  // ソート順が変更されたときに再適用
  useEffect(() => {
    if (songs.length > 0) {
      applyFilters(currentFilters);
    }
  }, [sortAscending]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600 text-center">
          <h2 className="text-2xl font-bold mb-2">エラーが発生しました</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={refreshData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">
              IIDX11/12鳥難易度表
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
              >
                {loading ? '読み込み中...' : 'マスタDB更新'}
              </button>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

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
    </div>
  );
}