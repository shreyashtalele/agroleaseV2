import mongoose, { Schema, Document } from "mongoose";

export interface IEquipment extends Document {
  title: string;
  description: string;
  category: string;
  rentalPricePerDay: number;
  sellingPrice?: number;
  securityDeposit: number;
  quantity: number;
  availableFrom: Date;
  availableUntil?: Date;
  status: "available" | "rented" | "under_maintenance" | "sold";
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
  condition?: "excellent" | "good" | "fair" | "needs_repair";
  manufactureYear?: number;
  usageHours?: number;
  images: Array<{
    url: string;
    publicId?: string;
    isPrimary: boolean;
    caption?: string;
    uploadedAt: Date;
  }>;
  owner: mongoose.Types.ObjectId;
  isVerified: boolean;
  viewsCount: number;
  averageRating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
  isAvailable: boolean;
}

const EquipmentSchema = new Schema<IEquipment>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
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
      ],
    },
    rentalPricePerDay: {
      type: Number,
      required: [true, "Rental price is required"],
      min: [0, "Rental price cannot be negative"],
    },
    sellingPrice: {
      type: Number,
      min: [0, "Selling price cannot be negative"],
      default: null,
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: [0, "Security deposit cannot be negative"],
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity must be at least 1"],
      max: [100, "Quantity cannot exceed 100"],
    },
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    availableUntil: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["available", "rented", "under_maintenance", "sold"],
      default: "available",
    },
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: String,
      coordinates: [Number],
      address: String,
    },
    specifications: {
      brand: String,
      model: String,
      modelYear: { type: Number, min: 1900 },
      powerSource: {
        type: String,
        enum: ["diesel", "electric", "manual", "solar", "petrol"],
      },
      fuelType: String,
      horsepower: Number,
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
    },
    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "needs_repair"],
      default: "good",
    },
    manufactureYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
    },
    usageHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: String,
        isPrimary: { type: Boolean, default: false },
        caption: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    averageRating: Number,
    reviewCount: Number,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
EquipmentSchema.index({ status: 1, category: 1 });
EquipmentSchema.index({ "location.city": 1, status: 1 });
EquipmentSchema.index({ rentalPricePerDay: 1 });
EquipmentSchema.index({ owner: 1, createdAt: -1 });
EquipmentSchema.index(
  { title: "text", description: "text", "specifications.brand": "text" },
  { weights: { title: 10, description: 5, "specifications.brand": 3 } },
);

// Virtual - isAvailable
EquipmentSchema.virtual("isAvailable").get(function () {
  return this.status === "available" && this.quantity > 0;
});

export default mongoose.model<IEquipment>("Equipment", EquipmentSchema);
