'use client';

import { useState, useEffect } from 'react';

import { Song, UserScore } from '@/hooks/useBpiDataDB';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
  sortAscending: boolean;
  onToggleSort: () => void;
  songs: Song[];
  userScores: Record<number, UserScore>;
}

export function FilterBar({ onFilterChange, sortAscending, onToggleSort, songs, userScores }: FilterBarProps) {
  const [filters, setFilters] = useState({
    level: '11',
    search: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // 初期フィルターを適用
  useEffect(() => {
    onFilterChange(filters);
  }, []);


  // グレード分布の計算（同レベルの全曲に対する比率）
  const totalSongs = songs.length;
  const playedSongs = songs.filter(song => userScores[song.id]).length;

  const gradeDistribution = songs.reduce((acc, song) => {
    const userScore = userScores[song.id];
    if (userScore?.grade) {
      acc[userScore.grade] = (acc[userScore.grade] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const gradeColors: Record<string, string> = {
    'AAA': 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg',
    'AA': 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg',
    'A': 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg',
    'B': 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg',
    'C': 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg',
    'D': 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg',
    'E': 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg',
    'F': 'bg-gradient-to-r from-gray-500 to-gray-700 text-white shadow-lg',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
      {/* Grade Distribution */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-2">
          {['AAA', 'AA', 'A', 'B', 'C', 'D', 'E', 'F'].map(grade => {
            const count = gradeDistribution[grade] || 0;
            const percentage = totalSongs > 0 ? ((count / totalSongs) * 100).toFixed(1) : '0.0';
            return (
              <div key={grade} className="flex items-center gap-1 bg-white rounded px-2 py-1 hover:bg-gray-100 transition-colors border border-gray-200">
                <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${gradeColors[grade] || 'bg-gray-600 text-white'}`}>
                  {grade}
                </span>
                <div className="text-gray-900 text-xs">
                  <span className="font-medium">{count}</span>
                  <span className="text-gray-600 ml-1">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex gap-3 items-end">
        {/* Search */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            楽曲検索
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="楽曲名で検索..."
            className="w-full bg-white border border-gray-300 rounded-md px-2 py-1.5 text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Level */}
        <div className="w-36">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            レベル
          </label>
          <div className="flex gap-1 bg-white border border-gray-300 p-0.5 rounded-lg">
            <button
              onClick={() => handleFilterChange('level', '')}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                filters.level === ''
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              全て
            </button>
            <button
              onClick={() => handleFilterChange('level', '11')}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                filters.level === '11'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              ★11
            </button>
            <button
              onClick={() => handleFilterChange('level', '12')}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                filters.level === '12'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              ★12
            </button>
          </div>
        </div>

        {/* Sort Order Toggle */}
        <div className="w-28">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            並び順
          </label>
          <button
            onClick={onToggleSort}
            className="w-full bg-white hover:bg-gray-100 border border-gray-300 rounded-md px-2 py-1.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors flex items-center justify-center gap-1"
          >
            <span>{sortAscending ? '昇順' : '降順'}</span>
            <span className="text-xs">
              {sortAscending ? '↑' : '↓'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}