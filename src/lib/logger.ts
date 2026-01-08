/**
 * Logger utility that prevents verbose error logging in production.
 * In development: logs to console for debugging
 * In production: suppresses console output to prevent exposing sensitive details
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LoggerOptions {
  prefix?: string;
}

const isDev = import.meta.env.DEV;

const formatMessage = (level: LogLevel, message: string, prefix?: string): string => {
  const timestamp = new Date().toISOString();
  const prefixStr = prefix ? `[${prefix}] ` : '';
  return `${timestamp} ${level.toUpperCase()} ${prefixStr}${message}`;
};

export const logger = {
  /**
   * Log informational messages (development only)
   */
  info: (message: string, data?: unknown, options?: LoggerOptions) => {
    if (isDev) {
      console.info(formatMessage('info', message, options?.prefix), data ?? '');
    }
  },

  /**
   * Log warning messages (development only)
   */
  warn: (message: string, data?: unknown, options?: LoggerOptions) => {
    if (isDev) {
      console.warn(formatMessage('warn', message, options?.prefix), data ?? '');
    }
  },

  /**
   * Log error messages (development only)
   * In production, errors are silently suppressed to prevent data exposure
   */
  error: (message: string, error?: unknown, options?: LoggerOptions) => {
    if (isDev) {
      console.error(formatMessage('error', message, options?.prefix), error ?? '');
    }
    // In production, you could send to a monitoring service here:
    // if (!isDev) { sendToMonitoring(message, error); }
  },

  /**
   * Log debug messages (development only)
   */
  debug: (message: string, data?: unknown, options?: LoggerOptions) => {
    if (isDev) {
      console.debug(formatMessage('info', message, options?.prefix), data ?? '');
    }
  },
};

export default logger;
