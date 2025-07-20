/**
 * React コンポーネント用ログフック
 */

import { useEffect, useRef, useCallback } from 'react';
import { devLog, logger } from '@/utils/logger';

/**
 * コンポーネントのレンダリングとライフサイクルをログ出力するフック
 */
export function useComponentLogger(componentName: string, props?: Record<string, unknown>) {
  const renderCount = useRef(0);
  const mountTime = useRef<number>();

  useEffect(() => {
    renderCount.current += 1;
    mountTime.current = Date.now();
    
    devLog.render(componentName, { ...props, renderCount: renderCount.current });

    return () => {
      if (mountTime.current) {
        const lifetime = Date.now() - mountTime.current;
        devLog.performance(`${componentName} lifetime`, mountTime.current);
        logger.debug(`${componentName} unmounted`, 'REACT', { lifetime });
      }
    };
  }, [componentName, props]);

  return {
    renderCount: renderCount.current,
    logAction: useCallback((action: string, data?: unknown) => {
      logger.debug(`${componentName}: ${action}`, 'REACT', data);
    }, [componentName]),
  };
}

/**
 * パフォーマンス測定用フック
 */
export function usePerformanceLogger(label: string) {
  const startTime = useRef<number>();

  const start = useCallback(() => {
    startTime.current = Date.now();
    logger.debug(`Performance measurement started: ${label}`, 'PERF');
  }, [label]);

  const end = useCallback((additionalData?: unknown) => {
    if (startTime.current) {
      devLog.performance(label, startTime.current);
      if (additionalData) {
        logger.debug(`Performance data for ${label}`, 'PERF', additionalData);
      }
    }
  }, [label]);

  const measure = useCallback((fn: () => void, additionalData?: unknown) => {
    start();
    fn();
    end(additionalData);
  }, [start, end]);

  return { start, end, measure };
}

/**
 * API呼び出し用ログフック
 */
export function useApiLogger() {
  const logApiCall = useCallback((
    endpoint: string, 
    method: string, 
    payload?: unknown,
    response?: unknown,
    error?: Error
  ) => {
    devLog.apiCall(endpoint, method, payload);
    
    if (error) {
      logger.error(`API call failed: ${method} ${endpoint}`, 'API_CLIENT', {
        payload,
        error: {
          message: error.message,
          stack: error.stack,
        },
      });
    } else {
      logger.debug(`API call successful: ${method} ${endpoint}`, 'API_CLIENT', {
        payload,
        response,
      });
    }
  }, []);

  return { logApiCall };
}

/**
 * State変更ログ用フック
 */
export function useStateLogger<T>(stateName: string) {
  const previousValue = useRef<T>();

  const logStateChange = useCallback((newValue: T) => {
    devLog.state(stateName, previousValue.current, newValue);
    previousValue.current = newValue;
  }, [stateName]);

  return { logStateChange };
}

/**
 * エラーログ用フック
 */
export function useErrorLogger(componentName: string) {
  const logError = useCallback((error: Error, context?: string, additionalData?: unknown) => {
    logger.error(
      `Error in ${componentName}${context ? ` (${context})` : ''}`,
      'REACT_ERROR',
      {
        component: componentName,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        ...additionalData,
      }
    );
  }, [componentName]);

  const logWarning = useCallback((message: string, context?: string, data?: unknown) => {
    logger.warn(
      `Warning in ${componentName}${context ? ` (${context})` : ''}: ${message}`,
      'REACT_WARNING',
      {
        component: componentName,
        ...data,
      }
    );
  }, [componentName]);

  return { logError, logWarning };
}
