'use client';

import { Song, UserScore } from '@/hooks/useBpiData';

interface StatsOverviewProps {
  songs: Song[];
  userScores: Record<number, UserScore>;
}

export function StatsOverview({ songs, userScores }: StatsOverviewProps) {
  console.log('StatsOverview userScores count:', Object.keys(userScores).length);

  // Calculate statistics
  const totalSongs = songs.length;
  const playedSongs = songs.filter(song => userScores[song.id]).length;
  const playRate = totalSongs > 0 ? (playedSongs / totalSongs) * 100 : 0;

  // Grade distribution
  const gradeDistribution = songs.reduce((acc, song) => {
    const userScore = userScores[song.id];
    if (userScore?.grade) {
      acc[userScore.grade] = (acc[userScore.grade] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);


  const averageBpi = playedSongs > 0 ? 
    songs.reduce((acc, song) => {
      const userScore = userScores[song.id];
      return acc + (userScore?.bpi || 0);
    }, 0) / playedSongs : 0;

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
    <div className="mb-6">
      {/* Grade Distribution */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex flex-wrap gap-3">
          {['AAA', 'AA', 'A', 'B', 'C', 'D', 'E', 'F'].map(grade => {
            const count = gradeDistribution[grade] || 0;
            const percentage = playedSongs > 0 ? ((count / playedSongs) * 100).toFixed(1) : '0.0';
            return (
              <div key={grade} className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2 hover:bg-gray-600 transition-colors">
                <span className={`px-2 py-1 rounded text-xs font-bold ${gradeColors[grade] || 'bg-gray-600 text-white'}`}>
                  {grade}
                </span>
                <div className="text-white text-sm">
                  <span className="font-medium">{count}</span>
                  <span className="text-gray-400 ml-1">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}