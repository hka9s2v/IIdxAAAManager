import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { username, email, password }: { username: string; email?: string; password: string } = await request.json();

    // バリデーション
    if (!username || !password) {
      return NextResponse.json(
        { error: "ユーザー名、パスワードは必須です" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "パスワードは8文字以上で入力してください" },
        { status: 400 }
      );
    }

    // 既存ユーザーチェック
    const whereConditions: Array<{ username?: string; email?: string }> = [{ username }];
    if (email) {
      whereConditions.push({ email });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: whereConditions,
      },
    });

    if (existingUser) {
      if (email && existingUser.email === email) {
        return NextResponse.json(
          { error: "このメールアドレスは既に使用されています" },
          { status: 400 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: "このユーザー名は既に使用されています" },
          { status: 400 }
        );
      }
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        username,
        email: email || `${username}@temp.local`, // emailが必須なのでデフォルト値を設定
        passwordHash: hashedPassword,
        displayName: username,
      },
    });

    // レスポンス用にパスワードハッシュを除外
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: "ユーザー登録が完了しました",
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "ユーザー登録に失敗しました" },
      { status: 500 }
    );
  }
}