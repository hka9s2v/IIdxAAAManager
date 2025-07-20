'use client';

import { useState } from 'react';
import { Song, UserScore } from '@/hooks/useBpiDataDB';
import { SongCard } from './SongCard';

interface SongGridProps {
  songs: Song[];
  userScores: Record<number, UserScore>;
  loading: boolean;
  updateUserScore: (songId: number, userScore: UserScore) => void;
  removeUserScore: (songId: number) => void;
}

export function SongGrid({ songs, userScores, loading, updateUserScore, removeUserScore }: SongGridProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  
  const toggleSection = (range: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(range)) {
      newCollapsed.delete(range);
    } else {
      newCollapsed.add(range);
    }
    setCollapsedSections(newCollapsed);
  };


  if (loading) {
    return (
      <div className="grid grid-cols-5 gap-0 mt-6">
        {Array.from({ length: 15 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-100 border border-gray-200 p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-6 bg-gray-300 rounded mb-3"></div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">楽曲が見つかりませんでした</p>
        <p className="text-gray-500 mt-2">フィルターを調整してみてください</p>
      </div>
    );
  }

  // BPI範囲でグループ化
  const groupSongsByBpiRange = (songs: Song[]) => {
    const groups: { [key: string]: Song[] } = {};
    
    songs.forEach(song => {
      const bpi = song.score89 || 0;
      let rangeKey: string;
      
      if (bpi <= -100) {
        rangeKey = '-100以下';
      } else {
        const rangeStart = Math.floor(bpi / 10) * 10;
        const rangeEnd = rangeStart + 9;
        rangeKey = `${rangeStart}-${rangeEnd}`;
      }
      
      if (!groups[rangeKey]) {
        groups[rangeKey] = [];
      }
      groups[rangeKey].push(song);
    });
    
    return groups;
  };

  const groupedSongs = groupSongsByBpiRange(songs);
  
  // ソート順: -100以下を最後に、その他は数値順（降順）
  const sortedRanges = Object.keys(groupedSongs).sort((a, b) => {
    if (a === '-100以下') return 1;
    if (b === '-100以下') return -1;
    
    const aStart = parseInt(a.split('-')[0]);
    const bStart = parseInt(b.split('-')[0]);
    return bStart - aStart; // 降順
  });

  const expandAll = () => {
    setCollapsedSections(new Set());
  };

  const collapseAll = () => {
    setCollapsedSections(new Set(sortedRanges));
  };

  return (
    <div className="mt-6">
      {/* Bulk Controls */}
      <div className="flex gap-2">
        <button
          onClick={expandAll}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          全て展開
        </button>
        <button
          onClick={collapseAll}
          className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
        >
          全て折りたたみ
        </button>
      </div>
      {sortedRanges.map(range => {
        const isCollapsed = collapsedSections.has(range);
        const songCount = groupedSongs[range].length;
        
        return (
          <div key={range} className="mb-6">
            {/* BPI Range Header */}
            <div className="mb-2">
              <button
                onClick={() => toggleSection(range)}
                className="w-full text-left hover:bg-gray-100 rounded p-1 transition-colors"
              >
                <h2 className="text-sm font-medium text-blue-600 border-b border-blue-200 pb-1 flex items-center justify-between">
                  <span>BPI {range}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">({songCount}曲)</span>
                    <span className="text-blue-600 text-sm">
                      {isCollapsed ? '+' : '−'}
                    </span>
                  </div>
                </h2>
              </button>
            </div>
            
            {/* Songs Grid */}
            {!isCollapsed && (
              <div className="grid grid-cols-5 gap-0">
                {groupedSongs[range].map((song) => (
                  <div key={`${song.id}-${userScores[song.id]?.date || 'no-score'}`} className="h-full">
                    <SongCard 
                      song={song} 
                      userScores={userScores}
                      updateUserScore={updateUserScore}
                      removeUserScore={removeUserScore}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}