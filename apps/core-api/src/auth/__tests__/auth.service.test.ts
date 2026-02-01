import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../auth.service";

describe("AuthService", () => {
  let service: AuthService;
  let mockDb: any;
  let mockJwtService: any;

  const mockProfile = {
    googleId: "google-123",
    email: "test@example.com",
    name: "Test User",
    avatarUrl: "https://example.com/avatar.jpg",
  };

  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    googleId: "google-123",
    avatarUrl: "https://example.com/avatar.jpg",
    isActive: true,
  };

  beforeEach(async () => {
    // Build a chainable mock for drizzle query builder where each method returns a new chain
    const createChain = () => {
      const chain: any = {};
      chain.select = vi.fn().mockReturnValue(chain);
      chain.from = vi.fn().mockReturnValue(chain);
      chain.where = vi.fn().mockReturnValue(chain);
      chain.limit = vi.fn().mockResolvedValue([]);
      chain.insert = vi.fn().mockReturnValue(chain);
      chain.values = vi.fn().mockReturnValue(chain);
      chain.returning = vi.fn().mockResolvedValue([]);
      chain.update = vi.fn().mockReturnValue(chain);
      chain.set = vi.fn().mockReturnValue(chain);
      return chain;
    };

    mockDb = createChain();

    mockJwtService = {
      sign: vi.fn().mockReturnValue("mock-jwt-token"),
    };

    // Manually instantiate to avoid NestJS DI issues with JwtService dependencies
    service = new AuthService(mockDb, mockJwtService);
  });

  describe("findOrCreateGoogleUser", () => {
    it("returns existing user when found by googleId", async () => {
      // First select (by googleId) returns user
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      const result = await service.findOrCreateGoogleUser(mockProfile);
      expect(result).toEqual(mockUser);
    });

    it("links google account when user found by email", async () => {
      const emailUser = { ...mockUser, googleId: null };
      // First limit (by googleId) → empty, second limit (by email) → user
      mockDb.limit
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([emailUser]);

      const result = await service.findOrCreateGoogleUser(mockProfile);
      expect(result.googleId).toBe("google-123");
    });

    it("creates new user when not found", async () => {
      // Both selects return empty
      mockDb.limit.mockResolvedValueOnce([]);
      mockDb.limit.mockResolvedValueOnce([]);
      // Insert returns new user
      mockDb.returning.mockResolvedValueOnce([mockUser]);

      const result = await service.findOrCreateGoogleUser(mockProfile);
      expect(result).toEqual(mockUser);
    });
  });

  describe("issueToken", () => {
    it("returns access_token", async () => {
      const result = await service.issueToken({ id: "user-1", email: "test@example.com" });
      expect(result).toEqual({ access_token: "mock-jwt-token" });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: "user-1", email: "test@example.com" });
    });
  });

  describe("getUserById", () => {
    it("returns user when found", async () => {
      mockDb.limit.mockResolvedValueOnce([mockUser]);
      const result = await service.getUserById("user-1");
      expect(result).toEqual(mockUser);
    });

    it("returns null when not found", async () => {
      mockDb.limit.mockResolvedValueOnce([]);
      const result = await service.getUserById("nonexistent");
      expect(result).toBeNull();
    });
  });
});
