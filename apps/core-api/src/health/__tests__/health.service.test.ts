import { describe, it, expect, vi } from "vitest";
import { HealthService } from "../health.service";
import { DRIZZLE } from "../../db/drizzle.provider";
import { Test } from "@nestjs/testing";

describe("HealthService", () => {
  it("returns ok when DB is connected", async () => {
    const mockDb = { execute: vi.fn().mockResolvedValue([{ "?column?": 1 }]) };
    const module = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile();

    const service = module.get(HealthService);
    const health = await service.getHealth();

    expect(health.status).toBe("ok");
    expect(health.database.status).toBe("connected");
    expect(typeof health.database.latencyMs).toBe("number");
    expect(typeof health.uptime).toBe("number");
    expect(health.memory.heapUsedMB).toBeGreaterThan(0);
    expect(health.timestamp).toBeTruthy();
  });

  it("returns degraded when DB is disconnected", async () => {
    const mockDb = { execute: vi.fn().mockRejectedValue(new Error("connection refused")) };
    const module = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile();

    const service = module.get(HealthService);
    const health = await service.getHealth();

    expect(health.status).toBe("degraded");
    expect(health.database.status).toBe("disconnected");
    expect(health.database.latencyMs).toBeUndefined();
  });
});
