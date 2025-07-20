'use client';

import { useState } from 'react';
import { SongCard } from './SongCard';
import { Song, UserScore } from '@/hooks/useBpiDataDB';
import { calculateAaaBpi } from '@/utils/bpiCalculations';

interface SongGridProps {
  songs: Song[];
  userScores: Record<number, UserScore>;
  loading: boolean;
  updateUserScore: (songId: number, scoreData: Record<string, unknown>) => void;
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

  // AAA BPIを計算するヘルパー関数
  const getAaaBpi = (song: Song): number => {
    if (!song.notes || !song.avg || !song.wr) return -999;
    return calculateAaaBpi({
      notes: song.notes,
      avg: song.avg,
      wr: song.wr,
      coef: song.coef
    });
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

  // レベル別、AAA BPI範囲でグループ化
  const groupSongsByLevelAndBpiRange = (songs: Song[]) => {
    const levelGroups: { [key: string]: { [key: string]: Song[] } } = {};
    
    songs.forEach(song => {
      const level = `★${song.level}`;
      const bpi = getAaaBpi(song);
      let rangeKey: string;
      
      if (bpi === -999) {
        rangeKey = 'データ不足';
      } else if (bpi <= -50) {
        rangeKey = '-50以下';
      } else if (bpi >= 100) {
        rangeKey = '100以上';
      } else {
        // 負の数も正しく処理するように修正
        let rangeStart: number;
        if (bpi >= 0) {
          rangeStart = Math.floor(bpi / 10) * 10;
        } else {
          // 負の数の場合は特別な処理
          rangeStart = Math.ceil((bpi - 9) / 10) * 10;
        }
        const rangeEnd = rangeStart + 9;
        rangeKey = `${rangeStart}~${rangeEnd}`;
      }
      
      if (!levelGroups[level]) {
        levelGroups[level] = {};
      }
      if (!levelGroups[level][rangeKey]) {
        levelGroups[level][rangeKey] = [];
      }
      levelGroups[level][rangeKey].push(song);
    });
    
    // 各グループ内でAAA BPI降順ソート
    Object.keys(levelGroups).forEach(level => {
      Object.keys(levelGroups[level]).forEach(range => {
        levelGroups[level][range].sort((a, b) => getAaaBpi(b) - getAaaBpi(a));
      });
    });
    
    return levelGroups;
  };

  const levelGroupedSongs = groupSongsByLevelAndBpiRange(songs);
  
  // レベル順（★12 -> ★11）、BPI範囲順（100以上 -> 90-99 -> ... -> -50以下）
  const sortedLevels = Object.keys(levelGroupedSongs).sort((a, b) => {
    const aLevel = parseInt(a.replace('★', ''));
    const bLevel = parseInt(b.replace('★', ''));
    return bLevel - aLevel; // 12 -> 11の順
  });

  const sortBpiRanges = (ranges: string[]): string[] => {
    return ranges.sort((a, b) => {
      // 特殊ケースの処理
      if (a === 'データ不足') return 1;
      if (b === 'データ不足') return -1;
      if (a === '100以上') return -1;
      if (b === '100以上') return 1;
      if (a === '-50以下') return 1;
      if (b === '-50以下') return -1;
      
      // 通常の範囲の処理（~で分割）
      const aStart = parseInt(a.split('~')[0]);
      const bStart = parseInt(b.split('~')[0]);
      
      // 負の数も含めて正しくソート（降順：高いBPIから低いBPIへ）
      return bStart - aStart;
    });
  };

  const expandAll = () => {
    setCollapsedSections(new Set());
  };

  const collapseAll = () => {
    const allSections: string[] = [];
    sortedLevels.forEach(level => {
      allSections.push(level);
      const ranges = Object.keys(levelGroupedSongs[level]);
      ranges.forEach(range => {
        allSections.push(`${level}-${range}`);
      });
    });
    setCollapsedSections(new Set(allSections));
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
      
      {sortedLevels.map(level => {
        const isLevelCollapsed = collapsedSections.has(level);
        const bpiRanges = Object.keys(levelGroupedSongs[level]);
        const sortedRanges = sortBpiRanges(bpiRanges);
        const totalSongsInLevel = sortedRanges.reduce((sum, range) => sum + levelGroupedSongs[level][range].length, 0);
        
        return (
          <div key={level} className="mb-8">
            {/* Level Header */}
            <div className="mb-4">
              <button
                onClick={() => toggleSection(level)}
                className="w-full text-left hover:bg-gray-100 rounded p-2 transition-colors"
              >
                <h1 className="text-lg font-bold text-purple-600 border-b-2 border-purple-200 pb-2 flex items-center justify-between">
                  <span>{level}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">({totalSongsInLevel}曲)</span>
                    <span className="text-purple-600 text-lg">
                      {isLevelCollapsed ? '+' : '−'}
                    </span>
                  </div>
                </h1>
              </button>
            </div>
            
            {/* BPI Range Groups within Level */}
            {!isLevelCollapsed && sortedRanges.map(range => {
              const sectionKey = `${level}-${range}`;
              const isRangeCollapsed = collapsedSections.has(sectionKey);
              const songCount = levelGroupedSongs[level][range].length;
              
              return (
                <div key={sectionKey} className="mb-6 ml-4">
                  {/* AAA BPI Range Header */}
                  <div className="mb-2">
                    <button
                      onClick={() => toggleSection(sectionKey)}
                      className="w-full text-left hover:bg-gray-100 rounded p-1 transition-colors"
                    >
                      <h2 className="text-sm font-medium text-blue-600 border-b border-blue-200 pb-1 flex items-center justify-between">
                        <span>AAA BPI {range}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">({songCount}曲)</span>
                          <span className="text-blue-600 text-sm">
                            {isRangeCollapsed ? '+' : '−'}
                          </span>
                        </div>
                      </h2>
                    </button>
                  </div>
                  
                  {/* Songs Grid */}
                  {!isRangeCollapsed && (
                    <div className="grid grid-cols-5 gap-0">
                      {levelGroupedSongs[level][range].map((song) => (
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
      })}
    </div>
  );
}