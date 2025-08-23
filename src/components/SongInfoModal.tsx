'use client';

import { Song, UserScore } from '@/hooks/useBpiDataDB';
import { calculateAaaBpi } from '@/utils/bpiCalculations';

interface SongInfoModalProps {
  song: Song;
  userScore?: UserScore;
  onClose: () => void;
}

export function SongInfoModal({ song, userScore, onClose }: SongInfoModalProps) {
  const getAaaBpi = (): number | null => {
    if (!song.notes || !song.avg || !song.wr) return null;
    return calculateAaaBpi({
      notes: song.notes,
      avg: song.avg,
      wr: song.wr,
      coef: song.coef
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

  const aaaBpi = getAaaBpi();

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 楽曲基本情報 */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{song.title}</h3>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(song.difficulty)}`}>
                {song.difficulty}
              </span>
              <span className="text-lg font-bold text-blue-600">★{song.level}</span>
            </div>
          </div>

          {/* 楽曲データ */}
          <div className="space-y-3 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">ノート数</span>
              <span className="font-semibold">{song.notes ? `${song.notes}` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">BPM</span>
              <span className="font-semibold">{song.bpm || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">AAA BPI</span>
              <span className="font-semibold">
                {aaaBpi !== null && aaaBpi !== -999 ? aaaBpi.toFixed(1) : 'データ不足'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">皆伝平均</span>
              <span className="font-semibold">{song.avg || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">歴代TOP</span>
              <span className="font-semibold">{song.wr || 'N/A'}</span>
            </div>
            {song.coef && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">譜面係数</span>
                <span className="font-semibold">{song.coef}</span>
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  );
}
