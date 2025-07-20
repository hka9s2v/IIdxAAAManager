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
      aaaBpi: song.aaaBpi?.aaaBpi ? Number(song.aaaBpi.aaaBpi) : null,
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

    // トランザクションでデータを一括挿入/更新
    const result = await prisma.$transaction(async (tx) => {
      const importedSongs = [];

      for (const songData of songs) {
        try {
          // データの検証
          if (!songData.title || !songData.difficulty) {
            console.warn('Skipping invalid song data:', songData);
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
        } catch (error) {
          console.error(`Error importing song ${songData.title}:`, error);
        }
      }

      return importedSongs;
    }, {
      timeout: 30000, // 30秒のタイムアウト
    });

    return NextResponse.json({
      message: `Successfully imported ${result.length} songs`,
      count: result.length,
    });

  } catch (error) {
    console.error('Error importing songs:', error);
    return NextResponse.json(
      { error: 'Failed to import songs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}