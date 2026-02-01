import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE } from "../db/drizzle.provider";
import { sql } from "drizzle-orm";

interface HealthReport {
  status: "ok" | "degraded" | "down";
  uptime: number;
  version: string;
  timestamp: string;
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
  database: {
    status: "connected" | "disconnected";
    latencyMs?: number;
  };
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async getHealth(): Promise<HealthReport> {
    const mem = process.memoryUsage();
    const dbStatus = await this.checkDatabase();

    return {
      status: dbStatus.status === "connected" ? "ok" : "degraded",
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || "0.0.0",
      timestamp: new Date().toISOString(),
      memory: {
        heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024 * 100) / 100,
        heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024 * 100) / 100,
        rssMB: Math.round(mem.rss / 1024 / 1024 * 100) / 100,
      },
      database: dbStatus,
    };
  }

  private async checkDatabase(): Promise<HealthReport["database"]> {
    try {
      const start = Date.now();
      await this.db.execute(sql`SELECT 1`);
      return { status: "connected", latencyMs: Date.now() - start };
    } catch {
      return { status: "disconnected" };
    }
  }
}
