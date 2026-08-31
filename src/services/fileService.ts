import cloudinary from "../config/cloudinary";
import fs from "fs";
import logger from "../config/logger";

export class FileService {
  static async uploadToCloudinary(
    file: any,
  ): Promise<{ url: string; publicId: string }> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "agrolease/equipment",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" },
        ],
      });

      // Remove local file after upload
      try {
        fs.unlinkSync(file.path);
      } catch (err: any) {
        logger.warn("Failed to delete local file:", err.message || err);
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: any) {
      logger.error("Cloudinary upload error:", error.message || error);
      throw error;
    }
  }

  static async deleteFromCloudinary(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
      logger.error("Cloudinary delete error:", error.message || error);
    }
  }

  static async uploadMultiple(
    files: any[],
  ): Promise<Array<{ url: string; publicId: string }>> {
    const results = [];
    for (const file of files) {
      const result = await this.uploadToCloudinary(file);
      results.push(result);
    }
    return results;
  }
}
