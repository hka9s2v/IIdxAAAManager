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

    // トランザクションで一括処理
    const result = await prisma.$transaction(async (tx) => {
      const createdSongs = [];

      for (const songData of songs) {
        // 楽曲の作成または更新
        const song = await tx.song.upsert({
          where: {
            title_difficulty: {
              title: songData.title,
              difficulty: songData.difficulty,
            },
          },
          update: {
            level: songData.level,
            notes: songData.notes,
            bpm: songData.bpm,
            worldRecord: songData.wr,
            score89: songData.bpiData?.score8_9 || null,
          },
          create: {
            title: songData.title,
            difficulty: songData.difficulty,
            level: songData.level,
            notes: songData.notes,
            bpm: songData.bpm,
            worldRecord: songData.wr,
            score89: songData.bpiData?.score8_9 || null,
          },
        });


        createdSongs.push(song);
      }

      return createdSongs;
    });

    return NextResponse.json({ 
      message: 'Songs imported successfully', 
      count: result.length 
    });
  } catch (error) {
    console.error('Failed to import songs:', error);
    return NextResponse.json(
      { error: 'Failed to import songs' },
      { status: 500 }
    );
  }
}