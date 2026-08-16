import * as redis from "redis";
import config from "./config";
import logger from "./logger";

class RedisClient {
  private client: any = null;
  private isConnected: boolean = false;

  async connect() {
    try {
      if (this.isConnected) {
        return this.client;
      }

      logger.info("Connecting to Redis...");

      this.client = redis.createClient({
        url: config.redis.url,
        socket: {
          connectTimeout: 10000,
        },
      });

      this.client.on("connect", () => {
        logger.info("Redis connected successfully");
        this.isConnected = true;
      });

      this.client.on("error", (err: Error) => {
        logger.error("Redis connection error:", err.message);
        this.isConnected = false;
      });

      await this.client.connect();

      return this.client;
    } catch (error: any) {
      logger.error("Failed to connect to Redis:", error.message || error);
      return null;
    }
  }

  async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.quit();
        this.isConnected = false;
        logger.info("Redis disconnected");
      }
    } catch (error: any) {
      logger.error("Error disconnecting Redis:", error.message || error);
    }
  }

  getClient() {
    return this.client;
  }

  isConnectedStatus() {
    return this.isConnected;
  }
}

export default new RedisClient();
