import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { logger, requestIdMiddleware, loggingMiddleware } from "./logger";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Add request ID and logging middleware
app.use(requestIdMiddleware);
app.use(loggingMiddleware);

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error with context
    logger.logApiError(err, {
      requestId: (req as any).requestId,
      method: req.method,
      url: req.path,
      statusCode: status,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(status).json({ 
      message,
      requestId: (req as any).requestId,
      timestamp: new Date().toISOString()
    });
    
    // Don't throw in production, just log
    if (process.env.NODE_ENV !== 'production') {
      throw err;
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5005;
  server.listen({
    port,
    host: "0.0.0.0",
    // reusePort: true,
  }, () => {
    logger.info(`Server started successfully`, {
      port,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      uptime: process.uptime(),
    });
    log(`serving on port ${port}`);
  });
})();
