import { describe, it, expect } from "vitest";
import { HealthController } from "../health.controller";
import { HealthService } from "../health.service";

const mockHealthReport = {
  status: "ok" as const,
  uptime: 100,
  version: "0.0.0",
  timestamp: "2026-01-01T00:00:00.000Z",
  memory: { heapUsedMB: 50, heapTotalMB: 100, rssMB: 120 },
  database: { status: "connected" as const, latencyMs: 2 },
};

describe("HealthController", () => {
  it("returns structured health report", async () => {
    const mockService = { getHealth: () => Promise.resolve(mockHealthReport) } as unknown as HealthService;
    const controller = new HealthController(mockService);
    const result = await controller.check();
    expect(result).toEqual(mockHealthReport);
    expect(result.status).toBe("ok");
    expect(result.database.status).toBe("connected");
  });
});
