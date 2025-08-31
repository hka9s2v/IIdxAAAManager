import { NextResponse } from 'next/server';
import axios from 'axios';
import { prisma } from '@/lib/prisma';
import { logger } from '@/utils/logger';

interface Song {
  title: string;
  difficulty: string;
  level: number;
  notes?: number;
  bpm?: string;
  wr?: number;
  avg?: number;
}

interface ApiResponse {
  body?: unknown[];
  songs?: unknown[];
  data?: unknown[];
}

async function fetchWithRetry(url: string, retries = 3): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 30000,
        responseType: 'text'
      });
      
      return response.data;
    } catch (error) {
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('All retry attempts failed');
}

function formatBpiApiData(apiData: unknown): Song[] {
  const songs: Song[] = [];
  
  try {
    let songsArray: unknown[] = [];
    
    // プロキシAPIの場合は直接配列が渡される
    if (Array.isArray(apiData)) {
      songsArray = apiData;
    } else {
      const data = apiData as ApiResponse;
      if (data.body && Array.isArray(data.body)) {
        songsArray = data.body;
      } else if (data.songs && Array.isArray(data.songs)) {
        songsArray = data.songs;
      } else if (data.data && Array.isArray(data.data)) {
        songsArray = data.data;
      }
    }
    
    logger.info(`Found ${songsArray.length} items in API response`);
    
    songsArray.forEach((item: unknown) => {
      const songItem = item as Record<string, unknown>;
      const title = songItem.title as string;
      const levelText = songItem.difficultyLevel as string;
      const difficultyCode = songItem.difficulty as string;
      const dpLevel = songItem.dpLevel as string;
      
      // dpLevel が "0" のデータのみを対象とする
      if (dpLevel !== "0") {
        return;
      }
      
      // 数値変換を確実に行う
      const wr = typeof songItem.wr === 'string' ? parseInt(songItem.wr) : (songItem.wr as number) || 0;
      const avg = typeof songItem.avg === 'string' ? parseInt(songItem.avg) : (songItem.avg as number) || 0;
      const notes = typeof songItem.notes === 'string' ? parseInt(songItem.notes) : (songItem.notes as number) || 0;
      
      if (title && levelText) {
        const level = parseInt(levelText);
        const difficultyMap: Record<string, string> = {
          "3": "HYPER",
          "4": "ANOTHER", 
          "9": "ANOTHER", // lv12のANOTHER
          "10": "LEGGENDARIA",
          "11": "LEGGENDARIA" // lv12☆のLEGGENDARIA
        };
        const difficulty = difficultyMap[difficultyCode];
        
        if (level >= 11 && level <= 12 && difficultyCode && difficulty) {
          songs.push({
            title: title.trim(),
            level: level,
            difficulty: difficulty,
            wr: wr,
            avg: avg,
            notes: notes,
            bpm: (songItem.bpm as string) || '',
          });
        }
      }
    });
    
    return songs;
  } catch (error) {
    logger.error('Error formatting API data');
    return [];
  }
}

async function importSongsToDatabase(songs: Song[]) {
  logger.info(`Starting import of ${songs.length} songs`);

  // 一括クエリで既存楽曲を取得
  const existingSongs = await prisma.song.findMany({
    select: {
      title: true,
      difficulty: true,
      level: true,
      notes: true,
      bpm: true,
      wr: true,
      avg: true,
    }
  });

  // 既存楽曲をMapに変換
  const existingMap = new Map();
  existingSongs.forEach(song => {
    const key = `${song.title}|${song.difficulty}`;
    existingMap.set(key, song);
  });

  // 事前フィルタリング
  const songsToProcess = [];
  let skippedCount = 0;

  for (const songData of songs) {
    if (!songData.title || !songData.difficulty) {
      skippedCount++;
      continue;
    }

    const key = `${songData.title}|${songData.difficulty}`;
    const existing = existingMap.get(key);
    
    if (existing) {
      // データに変更があるかチェック
      const hasChanges = 
        existing.level !== songData.level ||
        existing.notes !== songData.notes ||
        existing.bpm !== songData.bpm ||
        existing.wr !== songData.wr ||
        existing.avg !== songData.avg;
      
      if (!hasChanges) {
        skippedCount++;
        continue;
      }
    }
    
    songsToProcess.push(songData);
  }

  logger.info(`Processing ${songsToProcess.length} songs, skipping ${skippedCount} unchanged`);

  // バッチ処理
  const BATCH_SIZE = 50;
  const batches = [];
  for (let i = 0; i < songsToProcess.length; i += BATCH_SIZE) {
    batches.push(songsToProcess.slice(i, i + BATCH_SIZE));
  }

  let successCount = 0;
  let errorCount = 0;
  const allImportedSongs = [];

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    
    try {
      logger.debug(`Processing batch ${batchIndex + 1}/${batches.length}`);
      
      const batchResult = await prisma.$transaction(async (tx) => {
        const importedSongs = [];

        for (const songData of batch) {
          try {
            const song = await tx.song.upsert({
              where: {
                title_difficulty: {
                  title: songData.title,
                  difficulty: songData.difficulty,
                },
              },
              update: {
                level: songData.level || 0,
                notes: songData.notes || null,
                bpm: songData.bpm || null,
                wr: songData.wr || null,
                avg: songData.avg || null,
                updatedAt: new Date(),
              },
              create: {
                title: songData.title,
                difficulty: songData.difficulty,
                level: songData.level || 0,
                notes: songData.notes || null,
                bpm: songData.bpm || null,
                wr: songData.wr || null,
                avg: songData.avg || null,
              },
            });

            importedSongs.push(song);
            successCount++;
          } catch (error) {
            logger.error(`Error importing song ${songData.title}`);
            errorCount++;
          }
        }

        return importedSongs;
      }, {
        timeout: 60000,
        maxWait: 10000,
      });

      allImportedSongs.push(...batchResult);
      
      // バッチ間で少し待機
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      logger.error(`Batch ${batchIndex + 1} failed`);
      errorCount += batch.length;
    }
  }

  return {
    successCount,
    errorCount,
    skippedCount,
    totalSongs: allImportedSongs.length,
  };
}

export async function POST() {
  try {
    logger.info('Starting songs import from external API');
    
    // 1. 外部APIからデータ取得
    const apiUrl = 'https://proxy.poyashi.me/?type=bpi';
    const response = await fetchWithRetry(apiUrl);
    
    if (!response) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch data from external API',
      }, { status: 500 });
    }

    const data = JSON.parse(response);
    
    // 2. データ整形
    const songs = formatBpiApiData(data.body || data);
    
    if (songs.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid songs found in API response',
      }, { status: 400 });
    }

    // 3. データベースにインポート
    const result = await importSongsToDatabase(songs);
    
    logger.info(`Import completed: ${result.successCount} success, ${result.errorCount} errors, ${result.skippedCount} skipped`);
    
    return NextResponse.json({
      success: true,
      message: `楽曲データを更新しました`,
      details: {
        imported: result.successCount,
        errors: result.errorCount,
        skipped: result.skippedCount,
        total: songs.length,
      },
      version: data.version || 'unknown',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Songs import failed');
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

