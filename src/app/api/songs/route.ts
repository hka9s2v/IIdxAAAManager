import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateAaaBpi } from '@/utils/bpiCalculations';

// 楽曲一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');

    // クエリ条件の構築
    const where = level ? { level: parseInt(level) } : {};

    const songs = await prisma.song.findMany({
      where,
      include: {
        userScores: true,
      },
      orderBy: [
        { level: 'asc' },
        { title: 'asc' }
      ]
    });

    // レスポンス形式を調整
    const formattedSongs = songs.map(song => ({
      id: song.id,
      title: song.title,
      difficulty: song.difficulty,
      level: song.level,
      notes: song.notes,
      bpm: song.bpm,
      wr: song.wr,
      avg: song.avg,
      aaaBpi: null, // AaaBpiテーブルは使用していないためnull
      coef: song.coef ? Number(song.coef) : null, // 譜面係数p
    }));

    return NextResponse.json(formattedSongs);

  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    );
  }
}

// 楽曲データ一括インポート
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();

    // データの形式を確認
    let songs: any[];
    if (Array.isArray(requestData)) {
      songs = requestData;
    } else if (requestData.success && Array.isArray(requestData.data)) {
      songs = requestData.data;
    } else if (requestData.songs && Array.isArray(requestData.songs)) {
      songs = requestData.songs;
    } else {
      console.error('Invalid data format:', requestData);
      return NextResponse.json(
        { error: 'Invalid data format. Expected array of songs.' },
        { status: 400 }
      );
    }

    console.log(`Received ${songs.length} songs for import`);

    // バッチサイズを設定
    const BATCH_SIZE = 100; // 一度に処理する楽曲数
    const batches = [];
    
    // 楽曲データをバッチに分割
    for (let i = 0; i < songs.length; i += BATCH_SIZE) {
      batches.push(songs.slice(i, i + BATCH_SIZE));
    }

    console.log(`Processing ${batches.length} batches of ${BATCH_SIZE} songs each`);

    const allImportedSongs = [];
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // バッチごとに処理
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      try {
        console.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} songs)`);
        
        const batchResult = await prisma.$transaction(async (tx) => {
          const importedSongs = [];

          for (const songData of batch) {
            try {
              // データの検証
              if (!songData.title || !songData.difficulty) {
                console.warn('Skipping invalid song data:', songData);
                continue;
              }

              // 既存データをチェック
              const existing = await tx.song.findUnique({
                where: {
                  title_difficulty: {
                    title: songData.title,
                    difficulty: songData.difficulty,
                  },
                },
              });

              // 既存データがあり、同じ内容の場合はスキップ
              if (existing && 
                  existing.level === (songData.level || 0) &&
                  existing.notes === (songData.notes || null) &&
                  existing.bpm === (songData.bpm || null) &&
                  existing.wr === (songData.wr || null) &&
                  existing.avg === (songData.avg || null)) {
                console.log(`Skipping unchanged song: ${songData.title} [${songData.difficulty}]`);
                skippedCount++;
                continue;
              }

              // 楽曲データをupsert（現在のスキーマに合わせる）
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
              console.error(`Error importing song ${songData.title}:`, error);
              errorCount++;
            }
          }

          return importedSongs;
        }, {
          timeout: 60000, // バッチサイズ縮小により60秒で十分
          maxWait: 10000, // 接続待機時間10秒
        });

        allImportedSongs.push(...batchResult);
        
        // バッチ間で短い待機（DB負荷軽減）
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
      } catch (error) {
        console.error(`Error processing batch ${batchIndex + 1}:`, error);
        errorCount += batch.length;
        continue;
      }
    }

    const result = allImportedSongs;

    return NextResponse.json({
      message: `Batch processing completed. Created/Updated: ${successCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`,
      count: result.length,
      details: {
        successCount,
        skippedCount,
        errorCount,
        totalProcessed: successCount + skippedCount + errorCount,
        batchesProcessed: batches.length,
        batchSize: BATCH_SIZE
      }
    });

  } catch (error) {
    console.error('Error importing songs:', error);
    return NextResponse.json(
      { error: 'Failed to import songs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}