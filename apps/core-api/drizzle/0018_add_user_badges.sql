CREATE TABLE IF NOT EXISTS "user_badges" (
  "id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" varchar(36) NOT NULL,
  "badge_key" varchar(50) NOT NULL,
  "title" varchar(100) NOT NULL,
  "icon" varchar(20) NOT NULL,
  "earned_at" timestamp DEFAULT now() NOT NULL,
  "display_on_profile" boolean DEFAULT true NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_badge_unique" ON "user_badges" ("user_id", "badge_key");
CREATE INDEX IF NOT EXISTS "user_badges_user_idx" ON "user_badges" ("user_id");
