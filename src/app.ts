import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import config from "./config/config";
import correlationId from "./middleware/correlationId";
import requestLogger from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import equipmentRoutes from "./routes/equipmentRoutes";

class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandlers();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet());

    this.app.use(
      cors({
        origin: "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Correlation-ID"],
      }),
    );

    this.app.use(compression());

    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      message: {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests, please try again later.",
        },
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    this.app.use(
      "/uploads",
      express.static(path.join(__dirname, "../uploads")),
    );

    this.app.use(correlationId);
    this.app.use(requestLogger);
  }

  private initializeRoutes(): void {
    this.app.get("/health", (_req: Request, res: Response) => {
      res.json({
        status: "ok",
        environment: config.env,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    this.app.get("/", (_req: Request, res: Response) => {
      res.json({
        name: config.appName,
        version: "1.0.0",
        status: "running",
        environment: config.env,
        timestamp: new Date().toISOString(),
      });
    });

    this.app.get(
      `/api/${config.apiVersion}`,
      (_req: Request, res: Response) => {
        res.json({
          message: "Welcome to AgroLease API",
          version: config.apiVersion,
          endpoints: {
            auth: "/api/v1/auth",
            equipment: "/api/v1/equipment (coming soon)",
            bookings: "/api/v1/bookings (coming soon)",
            payments: "/api/v1/payments (coming soon)",
          },
        });
      },
    );

    // Auth routes
    this.app.use(`/api/${config.apiVersion}/auth`, authRoutes);

    this.app.use(`/api/${config.apiVersion}/equipment`, equipmentRoutes);
  }

  private initializeErrorHandlers(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  getApp(): Express {
    return this.app;
  }
}

export default new App().getApp();
