// lib/logger.ts

import db from "./db";

/**
 * Logger API Severity Levels
 */
export type LogSeverity = "info" | "warn" | "error" | "debug";

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
// Inside lib/logger.ts

/**
 * The core function that handles writing the log entry to both console and DB.
 */
const writeLog = async (entry: LogEntry): Promise<void> => {
  // 🎯 CRITICAL TEST: Console Output MUST be the first thing.
  const formattedOutput = `[${entry.timestamp}] [${entry.severity.toUpperCase()}] [${entry.source}] (Req: ${entry.requestId || "N/A"}) (User: ${entry.userId}) - ${entry.message}`;

  // 1. Console Output - If this fails, the issue is outside the function call.
  console.log("--- LOG START ---"); // New line for debugging
  console.log(formattedOutput, entry.metadata || "");
  console.log("--- LOG END ---"); // New line for debugging

  // 2. Database Persistence (Wrap this entire block in a local try/catch)
  try {
    await db.log.create({
      data: {
        userId: entry.userId,
        severity: entry.severity,
        source: entry.source,
        message: entry.message,
        requestId: entry.requestId,
        metadata: entry.metadata,
      },
    });
    console.log(`Successfully saved log to DB for source: ${entry.source}`);
  } catch (dbError) {
    // 🚨 Log failures to save logs—this should now be visible if the console logs fire.
    console.error(
      `🚨 FATAL LOGGING ERROR: Failed to save log to DB for source ${entry.source}.`,
      dbError,
    );
  }
};
// ... rest of the file ...

// --- Logger Factory and Interface ---

/**
 * Defines the ASYNCHRONOUS interface for the log functions.
 */
export interface Logger {
  info: (
    message: string,
    userId: string,
    requestId?: string,
    metadata?: Record<string, any>,
  ) => Promise<void>;
  warn: (
    message: string,
    userId: string,
    requestId?: string,
    metadata?: Record<string, any>,
  ) => Promise<void>;
  error: (
    message: string,
    userId: string,
    requestId?: string,
    metadata?: Record<string, any>,
  ) => Promise<void>;
  debug: (
    message: string,
    userId: string,
    requestId?: string,
    metadata?: Record<string, any>,
  ) => Promise<void>;
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
    metadata?: Record<string, any>,
  ) => {
    // We run the async writeLog and return its promise
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
    info: (message, userId, requestId, metadata) =>
      log("info", message, userId, requestId, metadata),
    warn: (message, userId, requestId, metadata) =>
      log("warn", message, userId, requestId, metadata),
    error: (message, userId, requestId, metadata) =>
      log("error", message, userId, requestId, metadata),
    debug: (message, userId, requestId, metadata) =>
      log("debug", message, userId, requestId, metadata),
  };
};

// --- UUID API for Request Tracing ---

export const createRequestId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
