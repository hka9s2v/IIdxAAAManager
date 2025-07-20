'use client';

import React from 'react';
import { Song, UserScore } from '@/hooks/useBpiDataDB';

interface BpiGridProps {
  song: Song;
  userScores: Record<number, UserScore>;
}

interface BpiRange {
  min: number;
  max: number;
  grade: string;
  color: string;
  textColor: string;
  bgClass: string;
  icon: string;
}

export function BpiGrid({ song, userScores }: BpiGridProps) {
  const userScore = userScores[song.id];

  // BPI ranges with corresponding grades and enhanced styling
  const bpiRanges: BpiRange[] = [
    { 
      min: 100, max: Infinity, grade: 'MAX', 
      color: 'grade-max', textColor: 'text-white',
      bgClass: 'bg-gradient-to-br from-pink-500 to-orange-500',
      icon: '👑'
    },
    { 
      min: 90, max: 99, grade: 'AAA', 
      color: 'grade-aaa', textColor: 'text-black',
      bgClass: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      icon: '⭐'
    },
    { 
      min: 80, max: 89, grade: 'AA', 
      color: 'bg-gradient-to-br from-orange-500 to-red-500', textColor: 'text-white',
      bgClass: 'bg-gradient-to-br from-orange-500 to-red-500',
      icon: '🔥'
    },
    { 
      min: 70, max: 79, grade: 'A', 
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600', textColor: 'text-white',
      bgClass: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      icon: '💎'
    },
    { 
      min: 60, max: 69, grade: 'B', 
      color: 'bg-gradient-to-br from-green-500 to-emerald-600', textColor: 'text-white',
      bgClass: 'bg-gradient-to-br from-green-500 to-emerald-600',
      icon: '✨'
    },
    { 
      min: 50, max: 59, grade: 'C', 
      color: 'bg-gradient-to-br from-cyan-500 to-teal-600', textColor: 'text-white',
      bgClass: 'bg-gradient-to-br from-cyan-500 to-teal-600',
      icon: '💧'
    },
    { 
      min: 40, max: 49, grade: 'D', 
      color: 'bg-gradient-to-br from-purple-500 to-violet-600', textColor: 'text-white',
      bgClass: 'bg-gradient-to-br from-purple-500 to-violet-600',
      icon: '🌟'
    },
    { 
      min: 30, max: 39, grade: 'E', 
      color: 'bg-gradient-to-br from-red-500 to-pink-600', textColor: 'text-white',
      bgClass: 'bg-gradient-to-br from-red-500 to-pink-600',
      icon: '⚡'
    },
    { 
      min: 0, max: 29, grade: 'F', 
      color: 'bg-gradient-to-br from-gray-500 to-gray-700', textColor: 'text-white',
      bgClass: 'bg-gradient-to-br from-gray-500 to-gray-700',
      icon: '📊'
    },
  ];

  // Calculate user's current BPI for this song
  const currentUserBpi = userScore?.bpi || null;
  
  // Get reference BPI values from song data
  const referenceBpis = [
    { value: song.wr || 0, label: 'WR' },
    { value: song.bpiData?.score17_18 || 0, label: '17/18' },
    { value: song.bpiData?.score8_9 || 0, label: '89%' },
    { value: song.bpiData?.score15_18 || 0, label: '15/18' },
    { value: song.avg || 0, label: 'AVG' },
  ];

  const getBpiCellState = (range: BpiRange) => {
    if (currentUserBpi === null) return 'empty';
    if (currentUserBpi >= range.min && currentUserBpi <= range.max) return 'achieved';
    if (currentUserBpi > range.max) return 'exceeded';
    return 'not-achieved';
  };

  const getCellStyle = (range: BpiRange) => {
    const state = getBpiCellState(range);
    
    switch (state) {
      case 'achieved':
        return `${range.color} ${range.textColor} grade-achieved shadow-lg`;
      case 'exceeded':
        return `${range.bgClass} ${range.textColor} grade-exceeded opacity-90 shadow-md`;
      case 'not-achieved':
        return 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-400 border border-gray-600 opacity-60';
      default:
        return 'bg-gradient-to-br from-gray-800 to-gray-900 text-gray-500 border border-gray-700 opacity-40';
    }
  };

  const getGridStyle = () => {
    if (currentUserBpi === null) return '';
    if (currentUserBpi >= 100) return 'ring-2 ring-pink-500 ring-opacity-50';
    if (currentUserBpi >= 90) return 'ring-2 ring-yellow-400 ring-opacity-50';
    if (currentUserBpi >= 80) return 'ring-2 ring-orange-500 ring-opacity-50';
    if (currentUserBpi >= 70) return 'ring-2 ring-blue-500 ring-opacity-50';
    return '';
  };

  return (
    <div className="space-y-3">
      {/* Current BPI Display */}
      <div className="text-center">
        <div className="text-xs text-gray-400 mb-1">現在のBPI</div>
        <div className="text-lg font-bold">
          {currentUserBpi !== null ? (
            <div className="inline-flex items-center gap-2">
              <span className={`text-lg ${
                currentUserBpi >= 100 ? 'text-pink-400' :
                currentUserBpi >= 90 ? 'text-yellow-400' :
                currentUserBpi >= 80 ? 'text-orange-400' :
                currentUserBpi >= 70 ? 'text-blue-400' :
                currentUserBpi >= 60 ? 'text-green-400' :
                'text-cyan-400'
              }`}>
                {currentUserBpi.toFixed(1)}
              </span>
              {currentUserBpi >= 100 && <span className="text-pink-400">👑</span>}
              {currentUserBpi >= 90 && currentUserBpi < 100 && <span className="text-yellow-400">⭐</span>}
            </div>
          ) : (
            <span className="text-gray-500">未記録</span>
          )}
        </div>
      </div>

      {/* BPI Grid */}
      <div className={`grid grid-cols-3 gap-1 p-1 rounded-lg transition-all duration-300 ${getGridStyle()}`}>
        {bpiRanges.map((range, index) => {
          const state = getBpiCellState(range);
          return (
            <div
              key={index}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium
                grade-cell relative
                ${getCellStyle(range)}
              `}
              title={`${range.grade}: ${range.min}${range.max === Infinity ? '+' : `-${range.max}`} BPI`}
            >
              {state === 'achieved' && (
                <div className="absolute -top-1 -right-1 text-lg">{range.icon}</div>
              )}
              <div className="font-bold text-sm">{range.grade}</div>
              <div className="text-xs opacity-75 leading-tight">
                {range.min}{range.max === Infinity ? '+' : `-${range.max}`}
              </div>
              {state === 'achieved' && (
                <div className="absolute inset-0 bg-white opacity-10 rounded-lg animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reference BPI Values */}
      <div className="grid grid-cols-5 gap-1 text-xs">
        {referenceBpis.map((ref, index) => (
          <div key={index} className="text-center">
            <div className="text-gray-400">{ref.label}</div>
            <div className="text-white font-medium">{ref.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}