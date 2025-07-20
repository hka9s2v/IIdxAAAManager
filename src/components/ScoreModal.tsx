'use client';

import { useState } from 'react';
import { Song, UserScore } from '@/hooks/useBpiDataDB';
import { calculateAaaScore } from '@/utils/bpiCalculations';

interface ScoreModalProps {
  song: Song;
  onClose: () => void;
  updateUserScore: (songId: number, userScore: UserScore) => void;
  calculateBPI: (songId: number, score: number) => number | null;
  currentUserScore?: UserScore;
}

export function ScoreModal({ song, onClose, updateUserScore, calculateBPI, currentUserScore }: ScoreModalProps) {
  const currentScore = currentUserScore;
  
  const [formData, setFormData] = useState({
    grade: currentScore?.grade || '',
    score: currentScore?.score?.toString() || '',
  });

  const grades = ['AAA', 'AA', 'A', 'B', 'C', 'D', 'E', 'F'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.grade) {
      alert('グレードを選択してください');
      return;
    }

    const scoreValue = formData.score ? parseInt(formData.score) : null;
    const bpi = scoreValue ? calculateBPI(song.id, scoreValue) : null;

    updateUserScore(song.id, {
      grade: formData.grade,
      score: scoreValue,
      bpi: bpi,
      date: new Date().toISOString(),
    });
    onClose();
  };

  const estimatedBpi = formData.score ? calculateBPI(song.id, parseInt(formData.score)) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">スコア登録</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium text-white mb-2">{song.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="bg-gray-700 px-2 py-1 rounded">★{song.level}</span>
              <span className="bg-gray-700 px-2 py-1 rounded">{song.difficulty}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                グレード <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              >
                <option value="">グレードを選択</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                スコア (任意)
              </label>
              <input
                type="number"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                placeholder={`0 - ${song.notes * 2}`}
                min="0"
                max={song.notes * 2}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                MAX: {song.notes * 2} (Notes: {song.notes})
              </p>
            </div>

            {estimatedBpi !== null && (
              <div className="bg-gray-700 p-3 rounded-md">
                <p className="text-sm text-gray-300">推定BPI</p>
                <p className="text-lg font-bold text-cyan-400">
                  {estimatedBpi.toFixed(1)}
                </p>
              </div>
            )}

            <div className="bg-gray-700 p-3 rounded-md">
              <p className="text-sm text-gray-300 mb-2">参考値</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>WR: {song.wr} (BPI: 100)</div>
                <div>AVG: {song.avg} (BPI: 0)</div>
                <div>89%: {calculateAaaScore(song)} (BPI: N/A)</div>
                <div>83%: {Math.round(song.notes * 2 * 0.833)} (BPI: N/A)</div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}