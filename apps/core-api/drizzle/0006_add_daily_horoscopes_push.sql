-- Add zodiac sign to users
ALTER TABLE "users" ADD COLUMN "zodiac_sign" varchar(20);

-- Create zodiac_sign enum type
DO $$ BEGIN
  CREATE TYPE "zodiac_sign" AS ENUM ('aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Daily horoscopes table
CREATE TABLE IF NOT EXISTS "daily_horoscopes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "sign" varchar(20) NOT NULL,
  "date" varchar(10) NOT NULL,
  "content" jsonb NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "daily_horoscope_sign_date" ON "daily_horoscopes" ("sign", "date");

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "user_id" varchar(36) NOT NULL,
  "endpoint" text NOT NULL UNIQUE,
  "p256dh" text NOT NULL,
  "auth" text NOT NULL
);
