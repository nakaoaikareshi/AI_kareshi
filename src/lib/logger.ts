export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  performance?: {
    duration: number;
    memory: number;
  };
}

class Logger {
  private minLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.minLevel = process.env.LOG_LEVEL ? 
      LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel] || LogLevel.INFO : 
      LogLevel.INFO;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private sanitizeError(error: unknown): LogEntry['error'] {
    if (!error) return undefined;

    const sanitized: LogEntry['error'] = {
      name: error.name || 'Error',
      message: error.message || 'Unknown error',
    };

    // Include stack trace only in development
    if (this.isDevelopment && error.stack) {
      sanitized.stack = error.stack;
    }

    // Include error code if available
    if (error.code) {
      sanitized.code = error.code;
    }

    return sanitized;
  }

  private sanitizeContext(context: LogContext = {}): LogContext {
    const sanitized: LogContext = { ...context };

    // Remove sensitive information
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }

    // Truncate long values
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
        sanitized[key] = sanitized[key].substring(0, 1000) + '...[TRUNCATED]';
      }
    });

    return sanitized;
  }

  private formatLogEntry(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp;
    
    if (this.isDevelopment) {
      // Colorized output for development
      const colors = {
        [LogLevel.DEBUG]: '\x1b[36m', // Cyan
        [LogLevel.INFO]: '\x1b[32m',  // Green
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.ERROR]: '\x1b[31m', // Red
        [LogLevel.FATAL]: '\x1b[35m', // Magenta
      };
      const reset = '\x1b[0m';
      const color = colors[entry.level] || reset;

      let output = `${color}[${timestamp}] ${levelName}: ${entry.message}${reset}`;
      
      if (entry.context && Object.keys(entry.context).length > 0) {
        output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
      }
      
      if (entry.error) {
        output += `\n  Error: ${JSON.stringify(entry.error, null, 2)}`;
      }
      
      if (entry.performance) {
        output += `\n  Performance: ${JSON.stringify(entry.performance, null, 2)}`;
      }
      
      return output;
    } else {
      // JSON output for production (easier for log aggregation)
      return JSON.stringify(entry);
    }
  }

  private writeLog(entry: LogEntry): void {
    const formatted = this.formatLogEntry(entry);
    
    if (entry.level >= LogLevel.ERROR) {
      console.error(formatted);
    } else {
      console.log(formatted);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      context: this.sanitizeContext(context)
    });
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      context: this.sanitizeContext(context)
    });
  }

  warn(message: string, context?: LogContext, error?: unknown): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      context: this.sanitizeContext(context),
      error: this.sanitizeError(error)
    });
  }

  error(message: string, context?: LogContext, error?: unknown): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context: this.sanitizeContext(context),
      error: this.sanitizeError(error)
    });
  }

  fatal(message: string, context?: LogContext, error?: unknown): void {
    if (!this.shouldLog(LogLevel.FATAL)) return;
    
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.FATAL,
      message,
      context: this.sanitizeContext(context),
      error: this.sanitizeError(error)
    });
  }

  // Performance logging
  performance(message: string, startTime: number, context?: LogContext): void {
    const duration = Date.now() - startTime;
    const memory = process.memoryUsage().heapUsed / 1024 / 1024; // MB

    this.info(message, {
      ...this.sanitizeContext(context),
      performance: { duration, memory }
    });
  }

  // API request logging
  apiRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    const level = statusCode >= 500 ? LogLevel.ERROR :
                  statusCode >= 400 ? LogLevel.WARN :
                  LogLevel.INFO;

    const message = `${method} ${endpoint} ${statusCode} - ${duration}ms`;

    if (level === LogLevel.ERROR) {
      this.error(message, context);
    } else if (level === LogLevel.WARN) {
      this.warn(message, context);
    } else {
      this.info(message, context);
    }
  }

  // Security event logging
  securityEvent(
    event: 'CSRF_BLOCKED' | 'RATE_LIMITED' | 'AUTH_FAILED' | 'INVALID_INPUT' | 'SUSPICIOUS_ACTIVITY',
    context?: LogContext
  ): void {
    this.warn(`Security event: ${event}`, {
      ...this.sanitizeContext(context),
      securityEvent: event
    });
  }
}

// Singleton logger instance
export const logger = new Logger();

// Request context helper
export function createRequestContext(request: Request, additionalContext?: LogContext): LogContext {
  const url = new URL(request.url);
  
  return {
    method: request.method,
    endpoint: url.pathname,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        undefined,
    requestId: crypto.randomUUID(),
    ...additionalContext
  };
}

// API response helpers
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
) {
  return Response.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    },
    { status: statusCode }
  );
}

export function createErrorResponse(
  message: string,
  code?: string,
  statusCode: number = 500,
  context?: LogContext
) {
  // Log the error
  logger.error(`API Error: ${message}`, context);

  // Return sanitized error response
  const errorResponse = {
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString()
  };

  return Response.json(errorResponse, { status: statusCode });
}