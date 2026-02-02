-- User Follows
CREATE TABLE IF NOT EXISTS "user_follows" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "follower_id" varchar(36) NOT NULL,
  "following_id" varchar(36) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_follows_unique" ON "user_follows" ("follower_id", "following_id");
CREATE INDEX IF NOT EXISTS "user_follows_follower_idx" ON "user_follows" ("follower_id");
CREATE INDEX IF NOT EXISTS "user_follows_following_idx" ON "user_follows" ("following_id");

-- Comments
CREATE TABLE IF NOT EXISTS "comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "reading_id" varchar(36) NOT NULL,
  "user_id" varchar(36) NOT NULL,
  "content" varchar(500) NOT NULL,
  "parent_id" varchar(36),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp
);

CREATE INDEX IF NOT EXISTS "comments_reading_idx" ON "comments" ("reading_id");
CREATE INDEX IF NOT EXISTS "comments_parent_idx" ON "comments" ("parent_id");

-- Reports
DO $$ BEGIN
  CREATE TYPE "report_reason" AS ENUM ('spam', 'inappropriate', 'harassment', 'other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "report_status" AS ENUM ('pending', 'reviewed', 'dismissed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "report_target_type" AS ENUM ('reading', 'comment', 'user');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "reporter_id" varchar(36) NOT NULL,
  "target_type" "report_target_type" NOT NULL,
  "target_id" varchar(36) NOT NULL,
  "reason" "report_reason" NOT NULL,
  "details" text,
  "status" "report_status" DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "reports_status_idx" ON "reports" ("status");
CREATE INDEX IF NOT EXISTS "reports_reporter_idx" ON "reports" ("reporter_id");
