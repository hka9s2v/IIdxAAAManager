'use client';

import { Song, UserScore } from '@/hooks/useBpiDataDB';
import { calculateAaaBpi } from '@/utils/bpiCalculations';

interface SongCardProps {
  song: Song;
  userScores: Record<number, UserScore>;
  updateUserScore: (songId: number, scoreData: Record<string, unknown>) => void;
  removeUserScore: (songId: number) => void;
}

export function SongCard({ song, userScores, updateUserScore, removeUserScore }: SongCardProps) {
  const userScore = userScores[song.id];
  
  const getAaaBpi = (): number | null => {
    if (!song.notes || !song.avg || !song.wr) return null;
    return calculateAaaBpi({
      notes: song.notes,
      avg: song.avg,
      wr: song.wr,
      coef: song.coef // 譜面係数pを追加
    });
  };
  
  const currentUserBpi = userScore?.bpi || null;
  const aaaBpiValue = getAaaBpi();

  const handleGradeChange = (newGrade: string) => {
    if (newGrade === '') {
      removeUserScore(song.id);
      return;
    }
    
    updateUserScore(song.id, {
      grade: newGrade,
      score: null,
      bpi: null,
      date: new Date().toISOString(),
    });
  };


  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'HYPER':
        return 'bg-green-600 text-white';
      case 'ANOTHER':
        return 'bg-red-600 text-white';
      case 'LEGGENDARIA':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getDifficultyAbbreviation = (difficulty: string) => {
    switch (difficulty) {
      case 'HYPER':
        return 'H';
      case 'ANOTHER':
        return 'A';
      case 'LEGGENDARIA':
        return 'L';
      default:
        return difficulty;
    }
  };

  const getCardStyle = () => {
    return 'bg-white border-gray-100';
  };

  const getGradeBackgroundStyle = () => {
    const grade = userScore?.grade;
    
    if (!grade) {
      return 'bg-white';
    }
    
    switch (grade) {
      case 'MAX':
        return 'bg-gradient-to-r from-pink-100 to-orange-100';
      case 'AAA':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100';
      case 'AA':
        return 'bg-gradient-to-r from-orange-100 to-red-100';
      case 'A':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100';
      case 'B':
      case 'C':
      case 'D':
      case 'E':
      case 'F':
        return 'bg-gradient-to-r from-gray-100 to-slate-100';
      default:
        return 'bg-white';
    }
  };

  return (
    <>
      <div className={`border hover:bg-gray-50 transition-all duration-200 ${getCardStyle()} flex flex-col h-full relative`}>
        <div className={`p-1.5 md:p-2 ${getGradeBackgroundStyle()} flex-1`}>
          <div className="hidden md:block">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-gray-900 font-medium text-sm leading-tight line-clamp-1 flex-1 mr-2">
                {song.title}
              </h3>
              <span className={`px-2 py-1 rounded text-xs font-bold flex-shrink-0 ${getDifficultyColor(song.difficulty)}`}>
                {getDifficultyAbbreviation(song.difficulty)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-600">
              <div>Notes: {song.notes} | BPM: {song.bpm}</div>
              <div className="bg-blue-100 px-1.5 py-0.5">
                <span className="text-blue-700">AAA BPI: </span>
                <span className="text-blue-800 font-bold">
                  {aaaBpiValue !== null && aaaBpiValue !== -999 ? aaaBpiValue.toFixed(1) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="md:hidden relative z-10">
            <h3 className="text-gray-900 font-medium text-xs leading-tight line-clamp-3">
              {song.title}
            </h3>
          </div>
        </div>
        
        <div className="md:hidden absolute bottom-8 right-0.5 bg-blue-100 bg-opacity-30 px-0.5 py-0.5 rounded text-xs z-20">
          <span className="text-blue-800 font-bold">
            {aaaBpiValue !== null && aaaBpiValue !== -999 ? aaaBpiValue.toFixed(1) : 'N/A'}
          </span>
        </div>

        <div className={`p-0.5 md:p-1 flex justify-center ${getGradeBackgroundStyle()}`}>
          <select
            value={userScore?.grade || ''}
            onChange={(e) => handleGradeChange(e.target.value)}
            className={`w-full md:w-20 ${getGradeBackgroundStyle()} border border-gray-300 px-0.5 md:px-1 py-0 md:py-0.5 text-gray-900 text-xs md:text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="">NOPLAY</option>
            <option value="AAA">AAA</option>
            <option value="AA">AA</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
            <option value="F">F</option>
          </select>
        </div>

      </div>
    </>
  );
}