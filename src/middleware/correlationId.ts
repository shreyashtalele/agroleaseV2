import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

const correlationId = (req: Request, res: Response, next: NextFunction) => {
  const id = (req.headers["x-correlation-id"] as string) || uuidv4();
  req.correlationId = id;
  res.locals.correlationId = id;
  res.setHeader("X-Correlation-ID", id);
  next();
};

export default correlationId;
