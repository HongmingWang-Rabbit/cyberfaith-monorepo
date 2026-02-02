-- Add user_settings table for comprehensive user preferences
CREATE TABLE IF NOT EXISTS "user_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "user_id" varchar(36) NOT NULL UNIQUE,
  "display_name" varchar(255),
  "mbti_type" varchar(4),
  "notification_email_digest" boolean DEFAULT true NOT NULL,
  "notification_push" boolean DEFAULT true NOT NULL,
  "notification_streak_reminders" boolean DEFAULT true NOT NULL,
  "theme" varchar(10) DEFAULT 'dark' NOT NULL,
  "language" varchar(5) DEFAULT 'en' NOT NULL,
  "privacy_profile_visible" boolean DEFAULT true NOT NULL,
  "privacy_reading_visible" boolean DEFAULT true NOT NULL
);

-- Add soft delete column to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
