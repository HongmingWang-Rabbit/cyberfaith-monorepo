import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailService } from "../email.service";

// Mock nodemailer
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: "test-id" }),
    })),
  },
  createTransport: vi.fn(() => ({
    sendMail: vi.fn().mockResolvedValue({ messageId: "test-id" }),
  })),
}));

describe("EmailService", () => {
  let service: EmailService;
  let sendMailMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    service = new EmailService();
    // Access the mock sendMail
    sendMailMock = (service as any).transporter.sendMail;
  });

  describe("sendWelcome", () => {
    it("sends a welcome email", async () => {
      await service.sendWelcome("test@example.com", "Alice");
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: expect.stringContaining("Welcome"),
        }),
      );
    });
  });

  describe("sendWeeklyDigest", () => {
    it("sends a digest email with correct data", async () => {
      await service.sendWeeklyDigest("test@example.com", {
        userName: "Alice",
        readingsThisWeek: 5,
        readingTypes: { tarot: 3, mbti: 2 },
        pointsEarned: 50,
        totalPoints: 200,
        currentStreak: 7,
        communityHighlights: [{ authorName: "Bob", type: "tarot" }],
      });
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: expect.stringContaining("Weekly Digest"),
          html: expect.stringContaining("Alice"),
        }),
      );
    });

    it("handles empty community highlights", async () => {
      await service.sendWeeklyDigest("test@example.com", {
        userName: "Alice",
        readingsThisWeek: 0,
        readingTypes: {},
        pointsEarned: 0,
        totalPoints: 0,
        currentStreak: 0,
        communityHighlights: [],
      });
      expect(sendMailMock).toHaveBeenCalled();
    });
  });

  describe("sendStreakReminder", () => {
    it("sends a streak reminder email", async () => {
      await service.sendStreakReminder("test@example.com", "Alice", 5);
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "test@example.com",
          subject: expect.stringContaining("5-day streak"),
        }),
      );
    });
  });
});
