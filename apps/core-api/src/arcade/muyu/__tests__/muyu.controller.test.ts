import { describe, it, expect, vi, beforeEach } from "vitest";
import { MuyuController } from "../muyu.controller";
import { MuyuService } from "../muyu.service";

describe("MuyuController", () => {
  let controller: MuyuController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      recordTaps: vi.fn().mockResolvedValue({
        session: { id: "s1", tapCount: 10, pointsEarned: 0 },
        totalTaps: 60,
        totalMerit: 60,
        pointsEarned: 0,
        nextPointAt: 100,
      }),
      getStats: vi.fn().mockResolvedValue({
        totalTaps: 500,
        totalMerit: 500,
        totalPoints: 5,
        streakDays: 3,
        nextPointAt: 600,
      }),
    };
    controller = new MuyuController(mockService as any);
  });

  describe("POST /arcade/muyu/tap", () => {
    it("records taps and returns result", async () => {
      const req = { user: { id: "user-1", email: "test@test.com" } } as any;
      const result = await controller.tap(req, { tapCount: 10 });

      expect(result.success).toBe(true);
      expect(result.data.totalTaps).toBe(60);
      expect(mockService.recordTaps).toHaveBeenCalledWith("user-1", 10, undefined);
    });

    it("passes tapCount directly (validation handled by DTO pipe)", async () => {
      const req = { user: { id: "user-1", email: "test@test.com" } } as any;
      // Note: In production, ValidationPipe rejects invalid tapCount before reaching controller.
      // Controller now passes tapCount as-is since DTO enforces @Min(1) @Max(100).
      await controller.tap(req, { tapCount: 50 });

      expect(mockService.recordTaps).toHaveBeenCalledWith("user-1", 50, undefined);
    });

    it("passes duration when provided", async () => {
      const req = { user: { id: "user-1", email: "test@test.com" } } as any;
      await controller.tap(req, { tapCount: 10, duration: 30 });

      expect(mockService.recordTaps).toHaveBeenCalledWith("user-1", 10, 30);
    });
  });

  describe("GET /arcade/muyu/stats", () => {
    it("returns user stats", async () => {
      const req = { user: { id: "user-1", email: "test@test.com" } } as any;
      const result = await controller.stats(req);

      expect(result.success).toBe(true);
      expect(result.data.totalTaps).toBe(500);
      expect(result.data.streakDays).toBe(3);
      expect(mockService.getStats).toHaveBeenCalledWith("user-1");
    });
  });
});
