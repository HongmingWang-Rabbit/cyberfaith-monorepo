import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminGuard } from "../admin.guard";
import { ForbiddenException } from "@nestjs/common";

describe("AdminGuard", () => {
  let guard: AdminGuard;
  let mockDb: any;

  function makeContext(user?: { id: string; email: string }) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any;
  }

  beforeEach(() => {
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn(),
    };
    guard = new AdminGuard(mockDb);
  });

  it("throws ForbiddenException when no user", async () => {
    await expect(guard.canActivate(makeContext())).rejects.toThrow(ForbiddenException);
  });

  it("throws ForbiddenException when user is not admin", async () => {
    mockDb.where.mockResolvedValue([{ id: "1", role: "user" }]);
    await expect(
      guard.canActivate(makeContext({ id: "1", email: "test@test.com" })),
    ).rejects.toThrow(ForbiddenException);
  });

  it("allows admin users", async () => {
    mockDb.where.mockResolvedValue([{ id: "1", role: "admin" }]);
    const result = await guard.canActivate(makeContext({ id: "1", email: "admin@test.com" }));
    expect(result).toBe(true);
  });

  it("throws ForbiddenException when user not found in DB", async () => {
    mockDb.where.mockResolvedValue([]);
    await expect(
      guard.canActivate(makeContext({ id: "missing", email: "test@test.com" })),
    ).rejects.toThrow(ForbiddenException);
  });
});
