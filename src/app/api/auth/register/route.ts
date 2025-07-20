import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logger, errorLog } from "@/utils/logger";
import { withLogging, logRequestBody } from "@/middleware/logging";

async function registerHandler(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // リクエストボディのログ（開発環境のみ）
    await logRequestBody(request, 'USER_REGISTER');
    
    const { username, email, password }: { username: string; email?: string; password: string } = await request.json();
    
    logger.info(`User registration attempt`, 'AUTH', { username, email });

    // バリデーション
    if (!username || !password) {
      logger.warn(`Registration validation failed: missing fields`, 'AUTH', { username: !!username, password: !!password });
      return NextResponse.json(
        { error: "ユーザー名、パスワードは必須です" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      logger.warn(`Registration validation failed: password too short`, 'AUTH', { username, passwordLength: password.length });
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

    logger.debug(`Checking existing user`, 'DB', { whereConditions });
    const dbStartTime = Date.now();
    
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: whereConditions,
      },
    });
    
    logger.db('findFirst', 'users', Date.now() - dbStartTime, { found: !!existingUser });

    if (existingUser) {
      if (email && existingUser.email === email) {
        logger.warn(`Registration failed: email already exists`, 'AUTH', { email });
        return NextResponse.json(
          { error: "このメールアドレスは既に使用されています" },
          { status: 400 }
        );
      }
      if (existingUser.username === username) {
        logger.warn(`Registration failed: username already exists`, 'AUTH', { username });
        return NextResponse.json(
          { error: "このユーザー名は既に使用されています" },
          { status: 400 }
        );
      }
    }

    // パスワードハッシュ化
    logger.debug(`Hashing password`, 'AUTH');
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザー作成
    logger.debug(`Creating new user`, 'DB', { username, email });
    const createStartTime = Date.now();
    
    const user = await prisma.user.create({
      data: {
        username,
        email: email || `${username}@temp.local`, // emailが必須なのでデフォルト値を設定
        passwordHash: hashedPassword,
        displayName: username,
      },
    });
    
    logger.db('create', 'users', Date.now() - createStartTime, { userId: user.id });
    logger.user(user.id, 'registered', { username, email: user.email });

    // レスポンス用にパスワードハッシュを除外
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;

    logger.info(`User registration successful`, 'AUTH', { 
      userId: user.id, 
      username, 
      duration: Date.now() - startTime 
    });

    return NextResponse.json(
      { 
        message: "ユーザー登録が完了しました",
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    errorLog.caught(error as Error, 'USER_REGISTER');
    return NextResponse.json(
      { error: "ユーザー登録に失敗しました" },
      { status: 500 }
    );
  }
}

export const POST = withLogging(registerHandler, 'USER_REGISTER');