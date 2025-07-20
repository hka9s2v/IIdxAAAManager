import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ユーザー情報を取得
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
      select: { 
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    return NextResponse.json(
      { error: 'ユーザー情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// ユーザー情報を更新
export async function PUT(request: NextRequest) {
  try {
    const { userId, username, email, displayName } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (displayName !== undefined) updateData.displayName = displayName;

    const updatedUser = await prisma.user.upsert({
      where: { id: parseInt(userId) },
      update: updateData,
      create: {
        id: parseInt(userId),
        username: username || `user${userId}`,
        email: email || `user${userId}@example.com`,
        passwordHash: 'temp',
        displayName: displayName || `User ${userId}`,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        avatarUrl: updatedUser.avatarUrl,
      },
    });

  } catch (error) {
    console.error('ユーザー情報更新エラー:', error);
    
    // 重複エラーの場合
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'ユーザー名またはメールアドレスが既に使用されています' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'ユーザー情報の更新に失敗しました' },
      { status: 500 }
    );
  }
} 