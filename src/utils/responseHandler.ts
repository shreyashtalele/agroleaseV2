import { Response } from "express";
import { v4 as uuidv4 } from "uuid";

interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  sort: string;
}

interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  skip: number;
}

interface PaginationData {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

class ResponseHandler {
  static success(
    res: Response,
    data: any = null,
    message: string = "Success",
    statusCode: number = 200,
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      correlationId: res.locals.correlationId || uuidv4(),
    });
  }

  static created(
    res: Response,
    data: any,
    message: string = "Resource created successfully",
  ) {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }

  static paginated(
    res: Response,
    data: any,
    pagination: PaginationData,
    message: string = "Success",
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 20,
        total: pagination.total || 0,
        totalPages: pagination.totalPages || 1,
        hasNext: pagination.hasNext || false,
        hasPrev: pagination.hasPrev || false,
      },
      timestamp: new Date().toISOString(),
      correlationId: res.locals.correlationId || uuidv4(),
    });
  }

  static getPaginationOptions(query: any): PaginationOptions {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    return {
      page,
      limit,
      skip: (page - 1) * limit,
      sort: query.sort || "-createdAt",
    };
  }

  static buildPagination(
    page: number = 1,
    limit: number = 20,
    total: number = 0,
  ): PaginationResult {
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10)));
    const totalPages = Math.ceil(total / limitNum);

    return {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
      skip: (pageNum - 1) * limitNum,
    };
  }
}

export default ResponseHandler;
