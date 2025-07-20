/**
 * 開発用ログ・デバッグログユーティリティ
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  userId?: number;
  sessionId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = this.formatTimestamp();
    const levelName = LogLevel[level];
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} ${levelName}${contextStr}: ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);
    const logEntry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      context,
      data,
    };

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, data ? data : '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data ? data : '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data ? data : '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, data ? data : '');
        break;
    }

    // 開発環境では詳細なログをファイルに保存（オプション）
    if (this.isDevelopment && typeof window === 'undefined') {
      this.writeToFile(logEntry);
    }
  }

  private writeToFile(logEntry: LogEntry): void {
    // Node.js環境でのファイル書き込み（サーバーサイドのみ）
    try {
      const fs = require('fs');
      const path = require('path');
      
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
      const logLine = JSON.stringify(logEntry) + '\n';
      
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }

  /**
   * デバッグレベルのログ
   */
  debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  /**
   * 情報レベルのログ
   */
  info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  /**
   * 警告レベルのログ
   */
  warn(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  /**
   * エラーレベルのログ
   */
  error(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  /**
   * API関連のログ
   */
  api(method: string, path: string, status: number, duration?: number, data?: unknown): void {
    const message = `${method} ${path} - ${status}${duration ? ` (${duration}ms)` : ''}`;
    const level = status >= 400 ? LogLevel.ERROR : status >= 300 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, message, 'API', data);
  }

  /**
   * データベース関連のログ
   */
  db(operation: string, table: string, duration?: number, data?: unknown): void {
    const message = `${operation} ${table}${duration ? ` (${duration}ms)` : ''}`;
    this.log(LogLevel.DEBUG, message, 'DB', data);
  }

  /**
   * ユーザー操作のログ
   */
  user(userId: number, action: string, data?: unknown): void {
    const message = `User ${userId}: ${action}`;
    this.log(LogLevel.INFO, message, 'USER', data);
  }

  /**
   * 認証関連のログ
   */
  auth(event: string, userId?: number, data?: unknown): void {
    const message = userId ? `Auth ${event} for user ${userId}` : `Auth ${event}`;
    this.log(LogLevel.INFO, message, 'AUTH', data);
  }

  /**
   * セキュリティ関連のログ
   */
  security(event: string, severity: 'low' | 'medium' | 'high', data?: unknown): void {
    const level = severity === 'high' ? LogLevel.ERROR : severity === 'medium' ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, `Security: ${event} (${severity})`, 'SECURITY', data);
  }
}

// シングルトンインスタンス
export const logger = new Logger();

// 開発環境専用のデバッグヘルパー
export const devLog = {
  /**
   * React コンポーネントのレンダリングログ
   */
  render(componentName: string, props?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Rendering ${componentName}`, 'REACT', props);
    }
  },

  /**
   * React Hook の実行ログ
   */
  hook(hookName: string, dependencies?: unknown[]): void {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Hook ${hookName} executed`, 'REACT', { dependencies });
    }
  },

  /**
   * State変更のログ
   */
  state(stateName: string, oldValue: unknown, newValue: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`State ${stateName} changed`, 'STATE', { from: oldValue, to: newValue });
    }
  },

  /**
   * API呼び出しのログ
   */
  apiCall(endpoint: string, method: string, payload?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`API call ${method} ${endpoint}`, 'API_CALL', payload);
    }
  },

  /**
   * パフォーマンス測定
   */
  performance(label: string, startTime: number): void {
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - startTime;
      logger.debug(`Performance: ${label} took ${duration}ms`, 'PERF');
    }
  },
};

// エラーログのヘルパー
export const errorLog = {
  /**
   * キャッチされたエラーのログ
   */
  caught(error: Error, context?: string, additionalData?: unknown): void {
    logger.error(
      `Caught error: ${error.message}`,
      context || 'ERROR',
      {
        stack: error.stack,
        name: error.name,
        ...additionalData,
      }
    );
  },

  /**
   * API エラーのログ
   */
  api(error: Error, method: string, path: string, statusCode?: number): void {
    logger.error(
      `API Error: ${method} ${path}`,
      'API_ERROR',
      {
        message: error.message,
        statusCode,
        stack: error.stack,
      }
    );
  },

  /**
   * データベースエラーのログ
   */
  database(error: Error, operation: string, table?: string): void {
    logger.error(
      `Database Error: ${operation}${table ? ` on ${table}` : ''}`,
      'DB_ERROR',
      {
        message: error.message,
        stack: error.stack,
      }
    );
  },
};
