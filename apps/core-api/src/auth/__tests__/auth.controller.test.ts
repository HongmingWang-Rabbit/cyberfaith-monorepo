import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { AuthController } from "../auth.controller";

describe("AuthController", () => {
  let controller: AuthController;
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      findOrCreateGoogleUser: vi.fn(),
      issueToken: vi.fn(),
      getUserById: vi.fn(),
    };

    controller = new AuthController(mockAuthService);
  });

  describe("googleLogin", () => {
    it("exists as a method (guard handles redirect)", () => {
      expect(controller.googleLogin).toBeDefined();
      expect(controller.googleLogin()).toBeUndefined();
    });
  });

  describe("googleCallback", () => {
    it("redirects with token on success", async () => {
      const mockUser = { id: "1", email: "test@test.com" };
      mockAuthService.findOrCreateGoogleUser.mockResolvedValue(mockUser);
      mockAuthService.issueToken.mockResolvedValue({ access_token: "jwt-token" });

      const req = { user: { googleId: "g1", email: "test@test.com", name: "Test", avatarUrl: null } } as any;
      const res = { redirect: vi.fn() } as any;

      await controller.googleCallback(req, res);
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining("token=jwt-token"));
    });
  });

  describe("getMe", () => {
    it("returns user without passwordHash", async () => {
      mockAuthService.getUserById.mockResolvedValue({
        id: "1",
        email: "test@test.com",
        name: "Test",
        passwordHash: "secret",
      });

      const req = { user: { id: "1" } } as any;
      const result = await controller.getMe(req);
      expect(result).not.toHaveProperty("passwordHash");
      expect(result).toHaveProperty("email", "test@test.com");
    });

    it("throws NotFoundException when user not found", async () => {
      mockAuthService.getUserById.mockResolvedValue(null);
      const req = { user: { id: "nonexistent" } } as any;
      await expect(controller.getMe(req)).rejects.toThrow(NotFoundException);
    });
  });
});
