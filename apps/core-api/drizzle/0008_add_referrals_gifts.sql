-- Add referral and gift columns to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referral_code" varchar(20) UNIQUE;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "premium_until" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "karma" integer NOT NULL DEFAULT 0;

-- Referral status enum
DO $$ BEGIN
  CREATE TYPE "referral_status" AS ENUM ('pending', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Referrals table
CREATE TABLE IF NOT EXISTS "referrals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "referrer_id" varchar(36) NOT NULL,
  "referred_user_id" varchar(36) NOT NULL,
  "code" varchar(20) NOT NULL,
  "status" "referral_status" DEFAULT 'pending' NOT NULL,
  "karma_awarded" integer DEFAULT 0 NOT NULL,
  "premium_days_awarded" integer DEFAULT 0 NOT NULL
);

-- Gift readings table
CREATE TABLE IF NOT EXISTS "gift_readings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "sender_id" varchar(36) NOT NULL,
  "recipient_email" varchar(255),
  "recipient_user_id" varchar(36),
  "reading_type" varchar(20) NOT NULL,
  "message" text,
  "redeem_code" varchar(36) NOT NULL UNIQUE,
  "redeemed" boolean DEFAULT false NOT NULL,
  "redeemed_at" timestamp,
  "redeemed_by_user_id" varchar(36)
);
