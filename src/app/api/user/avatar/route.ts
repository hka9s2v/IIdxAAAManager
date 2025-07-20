import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// アバターURLを更新
export async function PUT(request: NextRequest) {
  try {
    const { userId, avatarUrl } = await request.json();

    if (!userId || !avatarUrl) {
      return NextResponse.json(
        { error: 'ユーザーIDとアバターURLが必要です' },
        { status: 400 }
      );
    }

    // ユーザーのアバターURLを更新
    const updatedUser = await prisma.user.upsert({
      where: { id: parseInt(userId) },
      update: { avatarUrl },
      create: {
        id: parseInt(userId),
        username: `user${userId}`,
        email: `user${userId}@example.com`,
        passwordHash: 'temp',
        displayName: `User ${userId}`,
        avatarUrl,
      },
    });

    return NextResponse.json({
      success: true,
      avatarUrl: updatedUser.avatarUrl,
    });

  } catch (error) {
    console.error('アバターURL更新エラー:', error);
    return NextResponse.json(
      { error: 'アバターURLの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// アバターURLを取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { avatarUrl: true },
    });

    return NextResponse.json({
      success: true,
      avatarUrl: user?.avatarUrl || null,
    });

  } catch (error) {
    console.error('アバターURL取得エラー:', error);
    return NextResponse.json(
      { error: 'アバターURLの取得に失敗しました' },
      { status: 500 }
    );
  }
} 