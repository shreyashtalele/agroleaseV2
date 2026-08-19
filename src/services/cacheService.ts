import redis from "../config/redis";
import logger from "../config/logger";

export const CACHE_TTL = {
  EQUIPMENT_LIST: 300, // 5 minutes
  EQUIPMENT_DETAIL: 600, // 10 minutes
  CATEGORIES: 3600, // 1 hour
  USER_PROFILE: 900, // 15 minutes
};

export class CacheService {
  private static getClient() {
    return redis.getClient();
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const client = this.getClient();
      if (!client) return null;

      const value = await client.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error: any) {
      logger.error("Cache get error:", error.message || error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number): Promise<boolean> {
    try {
      const client = this.getClient();
      if (!client) return false;

      const stringValue = JSON.stringify(value);
      await client.setEx(key, ttl, stringValue);
      return true;
    } catch (error: any) {
      logger.error("Cache set error:", error.message || error);
      return false;
    }
  }

  static async delete(key: string): Promise<boolean> {
    try {
      const client = this.getClient();
      if (!client) return false;

      await client.del(key);
      return true;
    } catch (error: any) {
      logger.error("Cache delete error:", error.message || error);
      return false;
    }
  }

  static async deletePattern(pattern: string): Promise<boolean> {
    try {
      const client = this.getClient();
      if (!client) return false;

      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error: any) {
      logger.error("Cache delete pattern error:", error.message || error);
      return false;
    }
  }

  static async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number,
  ): Promise<T> {
    try {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      const fresh = await fetchFn();
      if (fresh !== null && fresh !== undefined) {
        await this.set(key, fresh, ttl);
      }
      return fresh;
    } catch (error: any) {
      logger.error("Cache getOrSet error:", error.message || error);
      return await fetchFn();
    }
  }

  // Equipment cache keys
  static getEquipmentListKey(filters: any): string {
    return `equipment:list:${JSON.stringify(filters)}`;
  }

  static getEquipmentDetailKey(id: string): string {
    return `equipment:detail:${id}`;
  }

  static getCategoriesKey(): string {
    return "equipment:categories";
  }

  static getUserProfileKey(id: string): string {
    return `user:profile:${id}`;
  }
}
