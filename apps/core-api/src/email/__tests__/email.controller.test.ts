import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailController, AdminEmailController } from "../email.controller";
import { EmailService } from "../email.service";
import { DigestService } from "../digest.service";

describe("EmailController", () => {
  let controller: EmailController;
  let digestService: Partial<DigestService>;

  beforeEach(() => {
    digestService = {
      generateDigest: vi.fn(),
    };
    controller = new EmailController({} as EmailService, digestService as DigestService);
  });

  describe("digestPreview", () => {
    it("returns digest data for authenticated user", async () => {
      const data = { userName: "Alice", readingsThisWeek: 3, readingTypes: {}, pointsEarned: 10, totalPoints: 50, currentStreak: 2, communityHighlights: [] };
      (digestService.generateDigest as any).mockResolvedValue(data);

      const req = { user: { id: "u1", email: "a@b.com" } } as any;
      const result = await controller.digestPreview(req);
      expect(result).toEqual({ success: true, data });
    });

    it("returns error when no data", async () => {
      (digestService.generateDigest as any).mockResolvedValue(null);
      const req = { user: { id: "u1", email: "a@b.com" } } as any;
      const result = await controller.digestPreview(req);
      expect(result.success).toBe(false);
    });
  });
});

describe("AdminEmailController", () => {
  let controller: AdminEmailController;
  let emailService: Partial<EmailService>;
  let digestService: Partial<DigestService>;

  beforeEach(() => {
    emailService = {
      sendWeeklyDigest: vi.fn().mockResolvedValue(undefined),
    };
    digestService = {
      getUsersForDigest: vi.fn().mockResolvedValue([{ id: "u1", email: "a@b.com", name: "Alice" }]),
      generateDigest: vi.fn().mockResolvedValue({
        userName: "Alice",
        readingsThisWeek: 1,
        readingTypes: { tarot: 1 },
        pointsEarned: 10,
        totalPoints: 50,
        currentStreak: 1,
        communityHighlights: [],
      }),
    };
    controller = new AdminEmailController(emailService as EmailService, digestService as DigestService);
  });

  describe("sendDigest", () => {
    it("sends digests to all opted-in users", async () => {
      const result = await controller.sendDigest();
      expect(result.success).toBe(true);
      expect(result.data.sent).toBe(1);
      expect(result.data.failed).toBe(0);
      expect(emailService.sendWeeklyDigest).toHaveBeenCalled();
    });
  });
});
