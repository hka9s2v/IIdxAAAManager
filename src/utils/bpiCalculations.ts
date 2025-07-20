// BPI計算用ユーティリティ関数

export interface SongData {
  notes: number;
  avg?: number;
  wr?: number;
  coef?: number; // 譜面係数p
}

export function calculateAaaScore(song: SongData): number {
  if (!song.notes) return 0;
  return Math.round(song.notes * 2 * 0.889);
}

function pgf(scoreRate: number, notes?: number): number {
  if (scoreRate >= 1.0) {
    return notes ? notes * 2 : 100000;
  }
  return 1 + (scoreRate - 0.5) / (1 - scoreRate);
}

export function calculateAaaBpi(song: SongData): number {
  if (!song.notes || !song.avg || !song.wr) return -999;
  
  const aaaScore = calculateAaaScore(song);
  return calculateUserBpi(aaaScore, song);
}

export function calculateUserBpi(userScore: number, song: SongData): number {
  if (!song.notes || !song.avg || !song.wr || !userScore) return -999;
  
  const theoreticalMax = song.notes * 2;
  
  const userRate = userScore / theoreticalMax;
  const avgRate = song.avg / theoreticalMax;
  const wrRate = song.wr / theoreticalMax;
  
  if (userRate <= 0 || avgRate <= 0 || wrRate <= 0 || 
      userRate > 1 || avgRate > 1 || wrRate > 1) {
    return -999;
  }
  
  const S = pgf(userRate, song.notes);
  const K = pgf(avgRate, song.notes);
  const Z = pgf(wrRate, song.notes);
  
  const S_normalized = S / K;
  const Z_normalized = Z / K;
  
  const ln_S = Math.log(S_normalized);
  const ln_Z = Math.log(Z_normalized);
  
  if (ln_Z <= 0) {
    return -999;
  }
  
  // 譜面係数p（coef）を取得、デフォルトは1.5（従来のBPI）
  const p = song.coef || 1.5;
  
  let bpi: number;
  if (userScore >= song.avg) {
    // s >= k の場合: BPI = 100*(ln(S')/ln(Z'))^p
    bpi = 100 * Math.pow(ln_S / ln_Z, p);
  } else {
    // s < k の場合: BPI = -100*(-ln(S')/ln(Z'))^p
    bpi = -100 * Math.pow(-ln_S / ln_Z, p);
  }
  
  return Math.round(bpi * 1000) / 1000;
} 