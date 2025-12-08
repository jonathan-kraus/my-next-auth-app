// lib/logger.ts
// 🎯 NEW: Import the Prisma client instance
import db from './db'; 

// ... (existing imports, interfaces, etc.)

/**
 * The core function that handles writing the log entry.
 * Now modified to handle both console output and database persistence.
 */
const writeLog = async (entry: LogEntry): Promise<void> => { // 🎯 Make async
  // 1. Console Output (Always keep this for local visibility)
  const formattedOutput = `[${entry.timestamp}] [${entry.severity.toUpperCase()}] [${entry.source}] (Req: ${entry.requestId || 'N/A'}) - ${entry.message}`;
  // ... (existing console.log/error/warn logic)
  switch (entry.severity) {
    case 'error':
      console.error(formattedOutput, entry.metadata || '');
      break;
    case 'warn':
      console.warn(formattedOutput, entry.metadata || '');
      break;
    default:
      // Use console.info for 'info' and 'debug'
      console.log(formattedOutput, entry.metadata || '');
  }
  // 2. Database Persistence (The crucial new step)
  try {
    // 🎯 NEW: Create the log entry in the database
    // NOTE: You MUST pass the userId here, which means your Logger 
    // API needs to be updated to accept the userId.
    
    // For now, let's assume a dummy userId or handle it via metadata:
    const userId = entry.metadata?.userId as string | undefined;

    if (userId) {
        await db.log.create({
            data: {
                // Required fields for your Log model:
                userId: userId, // 🚨 Requires the userId to be passed in metadata 
                severity: entry.severity,
                source: entry.source,
                message: entry.message,
                requestId: entry.requestId,
                metadata: entry.metadata ? JSON.stringify(entry.metadata) : undefined,
                // timestamp will default to now()
            },
        });
    }

  } catch (dbError) {
    // Log failures to save logs, but don't crash the main application process
    console.error(`🚨 FATAL LOGGING ERROR: Failed to save log to DB for source ${entry.source}`, dbError);
  }
};
/**
 * Logger API Severity Levels
 */
export type LogSeverity = 'info' | 'warn' | 'error' | 'debug';

/**
 * Standard Log Entry Structure
 */
export interface LogEntry {
  severity: LogSeverity;
  source: string; // e.g., 'FetchWeatherModule', 'DB_Client'
  message: string;
  requestId?: string; // Central correlation ID (UUID)
  timestamp: string;
  metadata?: Record<string, any>;
}

// --- Central Logger Implementation ---

/**
 * The core function that handles writing the log entry.
 * In a real application, this would send data to a service like Datadog,
 * CloudWatch, or a dedicated logging database table.
 */

  // 2. Output to console based on severity


  // 3. In a production environment, you would add an API call here:
  // fetch('/api/log', { method: 'POST', body: JSON.stringify(entry) });


// --- Logger Factory and Interface ---

/**
 * Defines the interface for the log functions used by modules.
 */
export interface Logger {
  info: (message: string, requestId?: string, metadata?: Record<string, any>) => void;
  warn: (message: string, requestId?: string, metadata?: Record<string, any>) => void;
  error: (message: string, requestId?: string, metadata?: Record<string, any>) => void;
  debug: (message: string, requestId?: string, metadata?: Record<string, any>) => void;
}

/**
 * Creates a logger instance associated with a specific module.
 * @param source A string identifying the module (e.g., 'API_Handler', 'AuthService')
 * @returns A Logger object with info, warn, error, and debug methods.
 */
export const createLogger = (source: string): Logger => {
  const log = (severity: LogSeverity, message: string, requestId?: string, metadata?: Record<string, any>) => {
    writeLog({
      severity,
      source,
      message,
      requestId,
      timestamp: new Date().toISOString(),
      metadata,
    });
  };

  return {
    info: (message, requestId, metadata) => log('info', message, requestId, metadata),
    warn: (message, requestId, metadata) => log('warn', message, requestId, metadata),
    error: (message, requestId, metadata) => log('error', message, requestId, metadata),
    debug: (message, requestId, metadata) => log('debug', message, requestId, metadata),
  };
};

// --- UUID API for Request Tracing ---

// NOTE: You can integrate the uuid package for this in a real project
// Example: import { v4 as uuidv4 } from 'uuid';

export const createRequestId = (): string => {
  // In a real app, replace this with a library like 'uuid'
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};