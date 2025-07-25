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
        userScores: true, // 将来的にユーザーIDでフィルタリング
      },
      orderBy: [
        { level: 'asc' },
        { title: 'asc' },
      ],
    });

    return NextResponse.json(songs);
  } catch (error) {
    console.error('Failed to fetch songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    );
  }
}

// 楽曲データの一括インポート（マスターデータ更新用）
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    
    // 外部APIの形式 {success: true, data: [...]} に対応
    const songs = requestData.success ? requestData.data : requestData;

    console.log(`Starting import of ${songs.length} songs...`);
    
    // 個別処理で安全にインポート（バッチサイズを制限）
    const createdSongs = [];
    const batchSize = 10; // 一度に処理する件数を制限
    
    for (let i = 0; i < songs.length; i += batchSize) {
      const batch = songs.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(songs.length/batchSize)}`);
      
      for (const songData of batch) {
        try {
          // 楽曲の作成または更新
          const song = await prisma.song.upsert({
            where: {
              title_difficulty: {
                title: songData.title,
                difficulty: songData.difficulty,
              },
            },
            update: {
              level: songData.level,
              notes: songData.notes,
              bpm: songData.bpm || null,
              worldRecord: songData.wr || null,
            },
            create: {
              title: songData.title,
              difficulty: songData.difficulty,
              level: songData.level,
              notes: songData.notes,
              bpm: songData.bpm || null,
              worldRecord: songData.wr || null,
            },
          });

          createdSongs.push(song);
        } catch (songError) {
          console.error(`Failed to process song: ${songData.title}`, songError);
          // 個別の楽曲エラーは無視して続行
        }
      }
      
      // バッチ間で短い待機（DBへの負荷軽減）
      if (i + batchSize < songs.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Import completed: ${createdSongs.length}/${songs.length} songs processed`);

    return NextResponse.json({ 
      message: 'Songs imported successfully', 
      count: createdSongs.length,
      total: songs.length
    });
  } catch (error) {
    console.error('Failed to import songs:', error);
    return NextResponse.json(
      { error: 'Failed to import songs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}