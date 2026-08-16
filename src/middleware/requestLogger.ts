import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const correlationId = (req as any).correlationId || "unknown";
  const log = logger.child(correlationId);

  const startTime = Date.now();

  log.info(`Request ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  res.on("finish", () => {
    const responseTime = Date.now() - startTime;
    const level = res.statusCode >= 400 ? "warn" : "info";

    log[level](
      `Response ${res.statusCode} ${req.method} ${req.path} (${responseTime}ms)`,
      {
        statusCode: res.statusCode,
        responseTime,
        contentLength: res.get("content-length"),
      },
    );
  });

  next();
};

export default requestLogger;
