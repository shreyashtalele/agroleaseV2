import mongoose from "mongoose";
import config from "./config";
import logger from "./logger";

class Database {
  private isConnected: boolean = false;
  private connection: any = null;

  async connect() {
    try {
      if (this.isConnected) {
        logger.info("MongoDB already connected");
        return this.connection;
      }

      logger.info("Connecting to MongoDB...");

      this.connection = await mongoose.connect(
        config.mongodb.uri,
        config.mongodb.options,
      );
      this.isConnected = true;

      logger.info(`MongoDB connected successfully (${config.env} environment)`);

      mongoose.connection.on("error", (err: Error) => {
        logger.error("MongoDB connection error:", err.message);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
        this.isConnected = false;
      });

      return this.connection;
    } catch (error: any) {
      logger.error("Failed to connect to MongoDB:", error.message || error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.connection.close();
        this.isConnected = false;
        logger.info("MongoDB disconnected");
      }
    } catch (error: any) {
      logger.error("Error disconnecting MongoDB:", error.message || error);
    }
  }

  getConnection() {
    if (!this.isConnected) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.connection;
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState,
    };
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export default new Database();
