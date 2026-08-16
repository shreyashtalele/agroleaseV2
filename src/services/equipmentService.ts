import Equipment, { IEquipment } from "../models/Equipment";
import { AppError } from "../middleware/errorHandler";
import { ERROR_CODES } from "../middleware/errorHandler";
import mongoose from "mongoose";

interface CreateEquipmentData {
  title: string;
  description: string;
  category: string;
  rentalPricePerDay: number;
  sellingPrice?: number;
  securityDeposit?: number;
  quantity?: number;
  availableFrom?: Date;
  availableUntil?: Date;
  location: {
    city: string;
    state: string;
    pincode?: string;
    coordinates?: number[];
    address?: string;
  };
  specifications?: {
    brand?: string;
    model?: string;
    modelYear?: number;
    powerSource?: string;
    fuelType?: string;
    horsepower?: number;
    weight?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
  };
  images?: Array<{
    url: string;
    publicId?: string;
    isPrimary: boolean;
    caption?: string;
  }>;
}

interface UpdateEquipmentData {
  title?: string;
  description?: string;
  category?: string;
  rentalPricePerDay?: number;
  sellingPrice?: number;
  securityDeposit?: number;
  quantity?: number;
  availableFrom?: Date;
  availableUntil?: Date;
  status?: "available" | "rented" | "under_maintenance" | "sold";
  location?: {
    city?: string;
    state?: string;
    pincode?: string;
    coordinates?: number[];
    address?: string;
  };
  specifications?: {
    brand?: string;
    model?: string;
    modelYear?: number;
    powerSource?: string;
    fuelType?: string;
    horsepower?: number;
    weight?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
  };
}

interface ListOptions {
  page: number;
  limit: number;
  category?: string;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  search?: string;
  sort?: string;
  userId?: string;
}

export class EquipmentService {
  static async createEquipment(
    data: CreateEquipmentData,
    ownerId: string,
  ): Promise<IEquipment> {
    const equipment = new Equipment({
      ...data,
      owner: new mongoose.Types.ObjectId(ownerId),
      images: data.images || [],
    });

    await equipment.save();
    return equipment;
  }

  static async getEquipmentList(
    options: ListOptions,
  ): Promise<{ data: IEquipment[]; total: number }> {
    const {
      page,
      limit,
      category,
      city,
      state,
      minPrice,
      maxPrice,
      status,
      search,
      sort,
      userId,
    } = options;

    const query: any = {};

    if (category) query.category = category;
    if (city) query["location.city"] = { $regex: city, $options: "i" };
    if (state) query["location.state"] = { $regex: state, $options: "i" };
    if (status) query.status = status;
    if (userId) query.owner = new mongoose.Types.ObjectId(userId);

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.rentalPricePerDay = {};
      if (minPrice !== undefined) query.rentalPricePerDay.$gte = minPrice;
      if (maxPrice !== undefined) query.rentalPricePerDay.$lte = maxPrice;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const sortField = sort || "-createdAt";

    const [data, total] = await Promise.all([
      Equipment.find(query)
        .populate("owner", "firstName lastName email phoneNumber")
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean(),
      Equipment.countDocuments(query),
    ]);

    return { data, total };
  }

  static async getEquipmentById(id: string): Promise<IEquipment> {
    const equipment = await Equipment.findById(id).populate(
      "owner",
      "firstName lastName email phoneNumber profileImage",
    );

    if (!equipment) {
      throw new AppError("Equipment not found", 404, ERROR_CODES.NOT_FOUND);
    }

    // Increment view count
    equipment.viewsCount += 1;
    await equipment.save({ validateBeforeSave: false });

    return equipment;
  }

  static async updateEquipment(
    id: string,
    data: UpdateEquipmentData,
    ownerId: string,
  ): Promise<IEquipment> {
    const equipment = await Equipment.findById(id);

    if (!equipment) {
      throw new AppError("Equipment not found", 404, ERROR_CODES.NOT_FOUND);
    }

    if (equipment.owner.toString() !== ownerId) {
      throw new AppError(
        "You are not authorized to update this equipment",
        403,
        ERROR_CODES.FORBIDDEN,
      );
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "rentalPricePerDay",
      "sellingPrice",
      "securityDeposit",
      "quantity",
      "availableFrom",
      "availableUntil",
      "status",
      "location",
      "specifications",
    ];

    for (const field of allowedFields) {
      if (data[field as keyof UpdateEquipmentData] !== undefined) {
        (equipment as any)[field] = data[field as keyof UpdateEquipmentData];
      }
    }

    await equipment.save();
    return equipment;
  }

  static async deleteEquipment(id: string, ownerId: string): Promise<void> {
    const equipment = await Equipment.findById(id);

    if (!equipment) {
      throw new AppError("Equipment not found", 404, ERROR_CODES.NOT_FOUND);
    }

    if (equipment.owner.toString() !== ownerId) {
      throw new AppError(
        "You are not authorized to delete this equipment",
        403,
        ERROR_CODES.FORBIDDEN,
      );
    }

    await equipment.deleteOne();
  }

  static async getMyListings(
    ownerId: string,
    options: { page: number; limit: number; status?: string },
  ): Promise<{ data: IEquipment[]; total: number }> {
    return this.getEquipmentList({
      ...options,
      userId: ownerId,
    });
  }

  static async getCategories(): Promise<string[]> {
    return [
      "tractor",
      "harvester",
      "plow",
      "cultivator",
      "seeder",
      "sprayer",
      "irrigation",
      "baler",
      "combine",
      "mower",
      "other",
    ];
  }

  static async checkAvailability(
    id: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ available: boolean; message?: string }> {
    const equipment = await Equipment.findById(id);

    if (!equipment) {
      throw new AppError("Equipment not found", 404, ERROR_CODES.NOT_FOUND);
    }

    if (equipment.status !== "available") {
      return {
        available: false,
        message: `Equipment is currently ${equipment.status}`,
      };
    }

    if (equipment.quantity <= 0) {
      return { available: false, message: "Equipment is out of stock" };
    }

    if (
      equipment.availableFrom &&
      new Date(startDate) < new Date(equipment.availableFrom)
    ) {
      return {
        available: false,
        message: `Equipment is not available before ${equipment.availableFrom}`,
      };
    }

    if (
      equipment.availableUntil &&
      new Date(endDate) > new Date(equipment.availableUntil)
    ) {
      return {
        available: false,
        message: `Equipment is not available after ${equipment.availableUntil}`,
      };
    }

    return { available: true };
  }
}
