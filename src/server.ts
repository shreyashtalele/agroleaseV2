import app from "./app";
import config from "./config/config";
import logger from "./config/logger";
import database from "./config/database";
import redis from "./config/redis";
import { CronService } from "./services/cronService";

let server: any = null;

const gracefulShutdown = async () => {
  logger.info("Received shutdown signal, closing gracefully...");
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed");
    });
  }
  await database.disconnect();
  await redis.disconnect();
  logger.info("Shutdown complete");
  process.exit(0);
};

const startServer = async () => {
  try {
    await database.connect();
    CronService.start();
    await redis.connect().catch(() => {
      logger.warn("Redis connection failed, continuing without cache");
    });

    const PORT = config.port;
    server = app.listen(PORT, () => {
      logger.info(`${config.appName} server started`);
      logger.info(`   Environment: ${config.env}`);
      logger.info(`   Port: ${PORT}`);
      logger.info(`   API: /api/${config.apiVersion}`);
      logger.info(`   Health: /health`);
      logger.info(`   Logging level: ${config.logging.level}`);
    });

    setInterval(() => {
      if (!database.getConnectionStatus()) {
        logger.error("MongoDB connection lost. Attempting to reconnect...");
        database.connect().catch((err: any) => {
          logger.error("MongoDB reconnection failed:", err);
        });
      }
    }, 30000);
  } catch (error: any) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

process.on("unhandledRejection", (err: any) => {
  logger.error("Unhandled Promise Rejection:", err);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

process.on("uncaughtException", (err: any) => {
  logger.error("Uncaught Exception:", err);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

startServer();

export default server;
