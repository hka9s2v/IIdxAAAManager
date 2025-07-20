import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 現在は仮のユーザーID（認証なしの場合）
const TEMP_USER_ID = 1;

// ユーザースコア一覧取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id) : TEMP_USER_ID;

    const userScores = await prisma.userScore.findMany({
      where: { userId },
      include: {
        song: true,
      },
    });

    // フロントエンド用の形式に変換
    const formattedScores: Record<number, any> = {};
    userScores.forEach(score => {
      formattedScores[score.songId] = {
        grade: score.grade,
        score: score.score,
        bpi: score.bpi ? parseFloat(score.bpi.toString()) : null,
        date: score.achievedAt.toISOString(),
      };
    });

    return NextResponse.json(formattedScores);
  } catch (error) {
    console.error('Failed to fetch user scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user scores' },
      { status: 500 }
    );
  }
}

// ユーザースコア登録・更新
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id) : TEMP_USER_ID;

    const { songId, grade, score, bpi } = await request.json();

    const userScore = await prisma.userScore.upsert({
      where: {
        userId_songId: {
          userId,
          songId: parseInt(songId),
        },
      },
      update: {
        grade,
        score: score ? parseInt(score) : null,
        bpi: bpi ? parseFloat(bpi) : null,
        achievedAt: new Date(),
      },
      create: {
        userId,
        songId: parseInt(songId),
        grade,
        score: score ? parseInt(score) : null,
        bpi: bpi ? parseFloat(bpi) : null,
      },
    });

    return NextResponse.json(userScore);
  } catch (error) {
    console.error('Failed to save user score:', error);
    return NextResponse.json(
      { error: 'Failed to save user score' },
      { status: 500 }
    );
  }
}

// ユーザースコア削除
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id) : TEMP_USER_ID;

    const { searchParams } = new URL(request.url);
    const songId = searchParams.get('songId');

    if (!songId) {
      return NextResponse.json(
        { error: 'Song ID is required' },
        { status: 400 }
      );
    }

    await prisma.userScore.delete({
      where: {
        userId_songId: {
          userId,
          songId: parseInt(songId),
        },
      },
    });

    return NextResponse.json({ message: 'User score deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user score:', error);
    return NextResponse.json(
      { error: 'Failed to delete user score' },
      { status: 500 }
    );
  }
}