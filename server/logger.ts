interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

interface LogContext {
  requestId?: string;
  userId?: number;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLogEntry(level: string, message: string, context?: LogContext, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private writeLog(entry: LogEntry) {
    const output = this.isDevelopment 
      ? this.formatDevelopmentOutput(entry)
      : JSON.stringify(entry);

    switch (entry.level) {
      case LOG_LEVELS.ERROR:
        console.error(output);
        break;
      case LOG_LEVELS.WARN:
        console.warn(output);
        break;
      case LOG_LEVELS.INFO:
        console.info(output);
        break;
      case LOG_LEVELS.DEBUG:
        if (this.isDevelopment) {
          console.debug(output);
        }
        break;
      default:
        console.log(output);
    }
  }

  private formatDevelopmentOutput(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const level = entry.level.toUpperCase().padEnd(5);
    
    let output = `[${timestamp}] ${level} ${entry.message}`;
    
    if (entry.context) {
      const contextStr = Object.entries(entry.context)
        .map(([key, value]) => `${key}=${value}`)
        .join(' ');
      output += ` | ${contextStr}`;
    }
    
    if (entry.error) {
      output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\n  Stack: ${entry.error.stack}`;
      }
    }
    
    return output;
  }

  error(message: string, context?: LogContext, error?: Error) {
    this.writeLog(this.formatLogEntry(LOG_LEVELS.ERROR, message, context, error));
  }

  warn(message: string, context?: LogContext) {
    this.writeLog(this.formatLogEntry(LOG_LEVELS.WARN, message, context));
  }

  info(message: string, context?: LogContext) {
    this.writeLog(this.formatLogEntry(LOG_LEVELS.INFO, message, context));
  }

  debug(message: string, context?: LogContext) {
    this.writeLog(this.formatLogEntry(LOG_LEVELS.DEBUG, message, context));
  }

  // HTTP request logging
  logRequest(method: string, url: string, context: LogContext) {
    this.info(`${method} ${url}`, context);
  }

  logResponse(method: string, url: string, statusCode: number, duration: number, context?: LogContext) {
    const level = statusCode >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
    const message = `${method} ${url} ${statusCode} ${duration}ms`;
    
    this.writeLog(this.formatLogEntry(level, message, {
      ...context,
      method,
      url,
      statusCode,
      duration,
    }));
  }

  // API error logging
  logApiError(error: Error, context: LogContext) {
    this.error(`API Error: ${error.message}`, context, error);
  }

  // Health check logging
  logHealthCheck(status: 'healthy' | 'unhealthy', checks: Record<string, boolean>) {
    const message = `Health check: ${status}`;
    const context = { checks, healthStatus: status };
    
    if (status === 'healthy') {
      this.info(message, context);
    } else {
      this.error(message, context);
    }
  }
}

export const logger = new Logger();

// Request ID middleware
export const requestIdMiddleware = (req: any, res: any, next: any) => {
  req.requestId = Math.random().toString(36).substring(2, 15);
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Logging middleware
export const loggingMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  const context: LogContext = {
    requestId: req.requestId,
    method: req.method,
    url: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
  };

  logger.logRequest(req.method, req.path, context);

  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - start;
    logger.logResponse(req.method, req.path, res.statusCode, duration, context);
    return originalSend.call(this, data);
  };

  next();
};