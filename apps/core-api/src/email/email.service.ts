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
  friendActivity: {
    newFriends: string[];
    friendReadings: { friendName: string; type: string }[];
  };
  featuredReading: { authorName: string; type: string } | null;
  horoscopeTeaser: string | null;
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
      .map(([type, count]) => `<li style="padding: 4px 0; color: #c0c0d0;">${type}: <strong>${count}</strong></li>`)
      .join("");

    const highlights = data.communityHighlights.length
      ? data.communityHighlights
          .slice(0, 5)
          .map((h) => `<li style="padding: 4px 0; color: #c0c0d0;">${h.authorName} shared a <strong>${h.type}</strong> reading</li>`)
          .join("")
      : '<li style="color: #888;">No community highlights this week</li>';

    const streakEmoji = data.currentStreak >= 7 ? "🔥" : data.currentStreak >= 3 ? "⚡" : "✨";

    // Friend activity section
    const friendSection = this.buildFriendSection(data.friendActivity);

    // Featured reading section
    const featuredSection = data.featuredReading
      ? `<div style="background: linear-gradient(135deg, #1a1a2e, #2d1b69); border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 1px solid #6c5ce744;">
          <h3 style="margin: 0 0 8px 0; color: #a29bfe; font-size: 14px;">⭐ Featured Reading</h3>
          <p style="margin: 0; color: #ddd;">${data.featuredReading.authorName} shared an inspiring <strong style="color: #6c5ce7;">${data.featuredReading.type}</strong> reading this week</p>
        </div>`
      : "";

    // Horoscope teaser section
    const horoscopeSection = data.horoscopeTeaser
      ? `<div style="background: linear-gradient(135deg, #0d1117, #1a1a2e); border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 1px solid #fdcb6e44;">
          <h3 style="margin: 0 0 8px 0; color: #fdcb6e; font-size: 14px;">🌟 Next Week's Horoscope Teaser</h3>
          <p style="margin: 0; color: #ddd; font-style: italic;">${data.horoscopeTeaser}</p>
        </div>`
      : "";

    const appUrl = process.env.DESTINY_LOOM_URL || "http://localhost:3002";

    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto;">

    <!-- Header with gradient -->
    <div style="background: linear-gradient(135deg, #6c5ce7, #a29bfe, #fd79a8); padding: 40px 20px; text-align: center; border-radius: 0 0 24px 24px;">
      <h1 style="color: #fff; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🔮 Weekly Digest</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Your spiritual recap is here</p>
    </div>

    <!-- Body -->
    <div style="padding: 24px 20px;">

      <!-- Greeting -->
      <p style="color: #e0e0e0; font-size: 16px; margin: 0 0 20px;">Hi <strong>${data.userName}</strong> 👋</p>

      <!-- Stats cards -->
      <div style="margin-bottom: 20px;">
        <!--[if mso]><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td width="33%" valign="top"><![endif]-->
        <div style="display: inline-block; width: 30%; min-width: 120px; vertical-align: top; margin: 4px; background: #161b22; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #30363d;">
          <div style="font-size: 28px; font-weight: bold; color: #6c5ce7;">${data.readingsThisWeek}</div>
          <div style="font-size: 11px; color: #8b949e; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Readings</div>
        </div>
        <!--[if mso]></td><td width="33%" valign="top"><![endif]-->
        <div style="display: inline-block; width: 30%; min-width: 120px; vertical-align: top; margin: 4px; background: #161b22; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #30363d;">
          <div style="font-size: 28px; font-weight: bold; color: #00b894;">+${data.pointsEarned}</div>
          <div style="font-size: 11px; color: #8b949e; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Karma</div>
        </div>
        <!--[if mso]></td><td width="33%" valign="top"><![endif]-->
        <div style="display: inline-block; width: 30%; min-width: 120px; vertical-align: top; margin: 4px; background: #161b22; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #30363d;">
          <div style="font-size: 28px; font-weight: bold; color: #fdcb6e;">${streakEmoji} ${data.currentStreak}</div>
          <div style="font-size: 11px; color: #8b949e; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Day Streak</div>
        </div>
        <!--[if mso]></td></tr></table><![endif]-->
      </div>

      <!-- Readings Breakdown -->
      ${readingsList ? `
      <div style="background: #161b22; border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 1px solid #30363d;">
        <h3 style="margin: 0 0 12px 0; color: #e0e0e0; font-size: 14px;">📖 Readings Breakdown</h3>
        <ul style="margin: 0; padding-left: 20px; list-style-type: none;">${readingsList}</ul>
      </div>` : ""}

      <!-- Friend Activity -->
      ${friendSection}

      <!-- Featured Reading -->
      ${featuredSection}

      <!-- Community Highlights -->
      <div style="background: #161b22; border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 1px solid #30363d;">
        <h3 style="margin: 0 0 12px 0; color: #e0e0e0; font-size: 14px;">🌟 Community Highlights</h3>
        <ul style="margin: 0; padding-left: 20px; list-style-type: none;">${highlights}</ul>
      </div>

      <!-- Horoscope Teaser -->
      ${horoscopeSection}

      <!-- CTA -->
      <div style="text-align: center; padding: 20px 0;">
        <a href="${appUrl}" style="display: inline-block; background: linear-gradient(135deg, #6c5ce7, #a29bfe); color: #fff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 15px;">Open CyberFaith →</a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 16px 0; border-top: 1px solid #30363d;">
        <p style="color: #8b949e; font-size: 12px; margin: 4px 0;">Total Karma: ${data.totalPoints} ✨</p>
        <p style="color: #484f58; font-size: 11px; margin: 4px 0;">You're receiving this because you have email digest enabled.</p>
      </div>

    </div>
  </div>
</body></html>`;

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: `🔮 Your CyberFaith Weekly — ${data.readingsThisWeek} readings, +${data.pointsEarned} karma`,
      html,
    });
  }

  private buildFriendSection(
    activity: DigestData["friendActivity"],
  ): string {
    const hasNewFriends = activity.newFriends.length > 0;
    const hasFriendReadings = activity.friendReadings.length > 0;

    if (!hasNewFriends && !hasFriendReadings) return "";

    let inner = "";
    if (hasNewFriends) {
      inner += `<p style="color: #c0c0d0; margin: 0 0 8px;">🤝 New friends: <strong>${activity.newFriends.join(", ")}</strong></p>`;
    }
    if (hasFriendReadings) {
      const items = activity.friendReadings
        .map((r) => `<li style="padding: 2px 0; color: #c0c0d0;">${r.friendName} did a <strong>${r.type}</strong> reading</li>`)
        .join("");
      inner += `<ul style="margin: 0; padding-left: 20px; list-style-type: none;">${items}</ul>`;
    }

    return `<div style="background: #161b22; border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 1px solid #30363d;">
      <h3 style="margin: 0 0 12px 0; color: #e0e0e0; font-size: 14px;">👥 Friend Activity</h3>
      ${inner}
    </div>`;
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
