import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

export interface DigestData {
  userName: string;
  readingsThisWeek: number;
  readingTypes: Record<string, number>;
  pointsEarned: number;
  totalPoints: number;
  currentStreak: number;
  communityHighlights: { authorName: string; type: string }[];
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor() {
    this.from = process.env.SMTP_FROM || "CyberFaith <noreply@cyberfaith.app>";
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_PORT === "465",
      auth:
        process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
  }

  async sendWelcome(to: string, name: string): Promise<void> {
    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
  <div style="text-align: center; padding: 30px 0;">
    <h1 style="color: #6c5ce7; margin: 0;">✨ Welcome to CyberFaith</h1>
  </div>
  <p>Hi ${name},</p>
  <p>Welcome to CyberFaith! Your spiritual journey begins now.</p>
  <p>Here's what you can explore:</p>
  <ul>
    <li>🔮 Readings — Tarot, I-Ching, MBTI, Four Pillars, Zodiac</li>
    <li>🏆 Achievements — Unlock milestones on your path</li>
    <li>🎮 Arcade — Fun spiritual mini-games</li>
    <li>👥 Community — Share readings & connect with others</li>
  </ul>
  <p style="color: #636e72;">May your path be illuminated. 🙏</p>
</body></html>`;

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: "✨ Welcome to CyberFaith",
      html,
    });
  }

  async sendWeeklyDigest(to: string, data: DigestData): Promise<void> {
    const readingsList = Object.entries(data.readingTypes)
      .map(([type, count]) => `<li>${type}: ${count}</li>`)
      .join("");

    const highlights = data.communityHighlights.length
      ? data.communityHighlights
          .slice(0, 5)
          .map((h) => `<li>${h.authorName} shared a ${h.type} reading</li>`)
          .join("")
      : "<li>No community highlights this week</li>";

    const streakEmoji = data.currentStreak >= 7 ? "🔥" : data.currentStreak >= 3 ? "⚡" : "✨";

    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
  <div style="text-align: center; padding: 30px 0;">
    <h1 style="color: #6c5ce7; margin: 0;">🔮 Your Weekly Digest</h1>
    <p style="color: #636e72;">Here's what happened this week</p>
  </div>

  <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
    <h3 style="margin-top: 0;">Hi ${data.userName} 👋</h3>
    <div style="display: flex; gap: 12px; text-align: center;">
      <div style="flex: 1; background: white; border-radius: 8px; padding: 12px;">
        <div style="font-size: 24px; font-weight: bold; color: #6c5ce7;">${data.readingsThisWeek}</div>
        <div style="font-size: 12px; color: #636e72;">Readings</div>
      </div>
      <div style="flex: 1; background: white; border-radius: 8px; padding: 12px;">
        <div style="font-size: 24px; font-weight: bold; color: #00b894;">+${data.pointsEarned}</div>
        <div style="font-size: 12px; color: #636e72;">Points</div>
      </div>
      <div style="flex: 1; background: white; border-radius: 8px; padding: 12px;">
        <div style="font-size: 24px; font-weight: bold; color: #fdcb6e;">${streakEmoji} ${data.currentStreak}</div>
        <div style="font-size: 12px; color: #636e72;">Day Streak</div>
      </div>
    </div>
  </div>

  ${readingsList ? `<div style="margin-bottom: 16px;"><h3>📖 Readings Breakdown</h3><ul>${readingsList}</ul></div>` : ""}

  <div style="margin-bottom: 16px;">
    <h3>🌟 Community Highlights</h3>
    <ul>${highlights}</ul>
  </div>

  <div style="text-align: center; padding: 20px; color: #636e72; font-size: 12px;">
    <p>Total Points: ${data.totalPoints} ✨</p>
    <p>You're receiving this because you have email notifications enabled.</p>
  </div>
</body></html>`;

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: `🔮 Your CyberFaith Weekly Digest — ${data.readingsThisWeek} readings, +${data.pointsEarned} points`,
      html,
    });
  }

  async sendStreakReminder(to: string, name: string, streak: number): Promise<void> {
    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
  <div style="text-align: center; padding: 30px 0;">
    <h1 style="color: #fdcb6e; margin: 0;">⚡ Don't Break Your Streak!</h1>
  </div>
  <p>Hi ${name},</p>
  <p>You're on a <strong>${streak}-day streak</strong>! Don't let it slip — do a quick reading today to keep it going.</p>
  <p style="text-align: center; padding: 20px;">
    <a href="${process.env.DESTINY_LOOM_URL || "http://localhost:3002"}" style="background: #6c5ce7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Do a Reading →</a>
  </p>
  <p style="color: #636e72; font-size: 12px; text-align: center;">You're receiving this because you have email notifications enabled.</p>
</body></html>`;

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: `⚡ ${streak}-day streak! Don't break it — CyberFaith`,
      html,
    });
  }
}
