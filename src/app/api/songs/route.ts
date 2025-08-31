import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // 一括クエリで既存楽曲を取得（効率化のため）
    console.log('Fetching existing songs for comparison...');
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

    // 既存楽曲をMapに変換（高速検索用）
    const existingMap = new Map();
    existingSongs.forEach(song => {
      const key = `${song.title}|${song.difficulty}`;
      existingMap.set(key, song);
    });

    console.log(`Found ${existingSongs.length} existing songs in database`);

    // 事前フィルタリング：スキップ対象と更新対象を分離
    const songsToProcess = [];
    let skippedCount = 0;

    for (const songData of songs) {
      if (!songData.title || !songData.difficulty) {
        continue; // 無効なデータはスキップ
      }

      const key = `${songData.title}|${songData.difficulty}`;
      const existing = existingMap.get(key);

      // 既存データと完全一致の場合はスキップ
      if (existing && 
          existing.level === (songData.level || 0) &&
          existing.notes === (songData.notes || null) &&
          existing.bpm === (songData.bpm || null) &&
          existing.wr === (songData.wr || null) &&
          existing.avg === (songData.avg || null)) {
        skippedCount++;
        continue;
      }

      songsToProcess.push(songData);
    }

    console.log(`Pre-filtering complete: ${songsToProcess.length} songs to process, ${skippedCount} skipped`);

    // 処理対象がない場合は早期リターン
    if (songsToProcess.length === 0) {
      return NextResponse.json({
        message: `All ${songs.length} songs were already up-to-date (skipped)`,
        count: 0,
        details: {
          successCount: 0,
          skippedCount,
          errorCount: 0,
          totalProcessed: skippedCount,
          batchesProcessed: 0,
          batchSize: 0
        }
      });
    }

    // バッチサイズを設定（処理対象のみ）
    const BATCH_SIZE = 50; // 504エラー対策でサイズ縮小
    const batches = [];
    
    // 処理対象楽曲をバッチに分割
    for (let i = 0; i < songsToProcess.length; i += BATCH_SIZE) {
      batches.push(songsToProcess.slice(i, i + BATCH_SIZE));
    }

    console.log(`Processing ${batches.length} batches of ${BATCH_SIZE} songs each (filtered data)`);

    const allImportedSongs = [];
    let successCount = 0;
    let errorCount = 0;

    // バッチごとに処理
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      try {
        console.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} songs)`);
        
        const batchResult = await prisma.$transaction(async (tx) => {
          const importedSongs = [];

          for (const songData of batch) {
            try {
              // 楽曲データをupsert（事前フィルタリング済みなので直接処理）
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
        
        // バッチ間で待機（504エラー対策 + DB負荷軽減）
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // 進行状況ログ
        console.log(`Batch ${batchIndex + 1}/${batches.length} completed. Success: ${batchResult.length}, Total processed: ${successCount}`);
        
      } catch (error) {
        console.error(`Error processing batch ${batchIndex + 1}:`, error);
        errorCount += batch.length;
        continue;
      }
    }

    const result = allImportedSongs;

    return NextResponse.json({
      message: `Optimized batch processing completed. Created/Updated: ${successCount}, Skipped (pre-filtered): ${skippedCount}, Errors: ${errorCount}`,
      count: result.length,
      details: {
        successCount,
        skippedCount,
        errorCount,
        totalProcessed: successCount + skippedCount + errorCount,
        batchesProcessed: batches.length,
        batchSize: BATCH_SIZE,
        optimizationApplied: "Pre-filtering with bulk query lookup"
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