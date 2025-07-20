/**
 * APIログ用ミドルウェア
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

export interface RequestLog {
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  startTime: number;
  userId?: number;
  sessionId?: string;
}

/**
 * APIリクエストのログを記録するミドルウェア
 */
export function withLogging<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    const request = args[0] as NextRequest;
    const startTime = Date.now();
    
    const requestLog: RequestLog = {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      startTime,
    };

    // リクエスト開始ログ
    logger.debug(
      `${request.method} ${request.url} started`,
      context || 'API',
      requestLog
    );

    try {
      // ハンドラー実行
      const response = await handler(...args);
      const duration = Date.now() - startTime;
      
      // レスポンス成功ログ
      logger.api(
        request.method,
        new URL(request.url).pathname,
        response.status,
        duration,
        {
          ...requestLog,
          responseHeaders: Object.fromEntries(response.headers.entries()),
        }
      );

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // エラーログ
      logger.error(
        `${request.method} ${request.url} failed`,
        context || 'API_ERROR',
        {
          ...requestLog,
          duration,
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          } : error,
        }
      );

      throw error;
    }
  }) as T;
}

/**
 * リクエストボディのログを記録（開発環境のみ）
 */
export async function logRequestBody(request: NextRequest, context?: string): Promise<unknown> {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  try {
    const body = await request.clone().json();
    logger.debug(
      `Request body for ${request.method} ${request.url}`,
      context || 'REQUEST_BODY',
      body
    );
    return body;
  } catch {
    // JSON以外の場合は無視
    return null;
  }
}

/**
 * レスポンスボディのログを記録（開発環境のみ）
 */
export function logResponseBody(data: unknown, context?: string): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  logger.debug(
    'Response body',
    context || 'RESPONSE_BODY',
    data
  );
}
