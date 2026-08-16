import winston from "winston";
import config from "./config";

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    ({ timestamp, level, message, correlationId, ...meta }) => {
      const correlation = correlationId ? `[${correlationId}] ` : "";
      const metaStr =
        Object.keys(meta).length > 0
          ? `\n${JSON.stringify(meta, null, 2)}`
          : "";
      return `${timestamp} ${level}: ${correlation}${message}${metaStr}`;
    },
  ),
);

const transports = [
  new winston.transports.Console({
    level: config.env === "production" ? "info" : "debug",
    format: consoleFormat,
  }),
];

const logger = winston.createLogger({
  level: config.logging.level,
  defaultMeta: { service: "agrolease-backend" },
  transports,
});

const logWithCorrelation = (
  level: string,
  message: string,
  correlationId: string | null = null,
  meta: any = {},
) => {
  logger.log({
    level,
    message,
    correlationId,
    ...meta,
  });
};

const extendedLogger = {
  info: (
    message: string,
    correlationId: string | null = null,
    meta: any = {},
  ) => logWithCorrelation("info", message, correlationId, meta),

  error: (
    message: string,
    correlationId: string | null = null,
    meta: any = {},
  ) => logWithCorrelation("error", message, correlationId, meta),

  warn: (
    message: string,
    correlationId: string | null = null,
    meta: any = {},
  ) => logWithCorrelation("warn", message, correlationId, meta),

  debug: (
    message: string,
    correlationId: string | null = null,
    meta: any = {},
  ) => logWithCorrelation("debug", message, correlationId, meta),

  child: (correlationId: string) => ({
    info: (message: string, meta: any = {}) =>
      extendedLogger.info(message, correlationId, meta),
    error: (message: string, meta: any = {}) =>
      extendedLogger.error(message, correlationId, meta),
    warn: (message: string, meta: any = {}) =>
      extendedLogger.warn(message, correlationId, meta),
    debug: (message: string, meta: any = {}) =>
      extendedLogger.debug(message, correlationId, meta),
  }),
};

export default extendedLogger;
