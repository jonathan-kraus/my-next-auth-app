// lib/logger.ts

import db from './db'; // 🎯 CRITICAL: Your Prisma Client instance

/**
 * Logger API Severity Levels
 */
export type LogSeverity = 'info' | 'warn' | 'error' | 'debug';

/**
 * Standard Log Entry Structure (Used internally)
 */
export interface LogEntry {
  userId: string; // Required for DB schema
  severity: LogSeverity;
  source: string;
  message: string;
  requestId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// --- Central Logger Implementation ---

/**
 * The core function that handles writing the log entry to both console and DB.
 */
const writeLog = async (entry: LogEntry): Promise<void> => {
  // 1. Console Output (Keep this for local development visibility)
  const formattedOutput = `[${entry.timestamp}] [${entry.severity.toUpperCase()}] [${entry.source}] (Req: ${entry.requestId || 'N/A'}) (User: ${entry.userId}) - ${entry.message}`;

  switch (entry.severity) {
    case 'error':
      console.error(formattedOutput, entry.metadata || '');
      break;
    case 'warn':
      console.warn(formattedOutput, entry.metadata || '');
      break;
    default:
      console.log(formattedOutput, entry.metadata || '');
  }

  // 2. Database Persistence
  try {
    await db.log.create({
      data: {
        userId: entry.userId,
        severity: entry.severity,
        source: entry.source,
        message: entry.message,
        requestId: entry.requestId,
        // Prisma expects JSON for the Json type, so we convert the metadata object.
        metadata: entry.metadata, 
        // timestamp defaults to now() in the schema
      },
    });
  } catch (dbError) {
    // 🚨 IMPORTANT: Log failures to save logs, but do NOT crash the main application process.
    console.error(`🚨 FATAL LOGGING ERROR: Failed to save log to DB for source ${entry.source}. This is a non-critical failure.`, dbError);
  }
};

// --- Logger Factory and Interface ---

/**
 * Defines the ASYNCHRONOUS interface for the log functions.
 * They now return a Promise because they write to the DB.
 */
export interface Logger {
  info: (message: string, userId: string, requestId?: string, metadata?: Record<string, any>) => Promise<void>;
  warn: (message: string, userId: string, requestId?: string, metadata?: Record<string, any>) => Promise<void>;
  error: (message: string, userId: string, requestId?: string, metadata?: Record<string, any>) => Promise<void>;
  debug: (message: string, userId: string, requestId?: string, metadata?: Record<string, any>) => Promise<void>;
}

/**
 * Creates a logger instance associated with a specific module.
 */
export const createLogger = (source: string): Logger => {
  const log = (
    severity: LogSeverity,
    message: string,
    userId: string, // Required
    requestId?: string,
    metadata?: Record<string, any>
  ) => {
    // 🎯 We run the async writeLog and return its promise
    return writeLog({
      userId,
      severity,
      source,
      message,
      requestId,
      timestamp: new Date().toISOString(),
      metadata,
    });
  };

  return {
    info: (message, userId, requestId, metadata) => log('info', message, userId, requestId, metadata),
    warn: (message, userId, requestId, metadata) => log('warn', message, userId, requestId, metadata),
    error: (message, userId, requestId, metadata) => log('error', message, userId, requestId, metadata),
    debug: (message, userId, requestId, metadata) => log('debug', message, userId, requestId, metadata),
  };
};

// --- UUID API for Request Tracing ---

export const createRequestId = (): string => {
  // Using a simple unique ID generator
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};