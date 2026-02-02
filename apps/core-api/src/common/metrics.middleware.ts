import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { MetricsService } from "../metrics/metrics.service";

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metrics: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      const userId = (req as any).user?.id || (req as any).user?.sub;
      this.metrics.recordRequest(duration, res.statusCode, userId);
    });

    next();
  }
}
