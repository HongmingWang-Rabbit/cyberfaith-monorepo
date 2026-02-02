DO $$ BEGIN
  CREATE TYPE "notification_type" AS ENUM('follow', 'comment', 'reaction', 'achievement', 'gift', 'system');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "in_app_notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" varchar(36) NOT NULL,
  "type" "notification_type" NOT NULL,
  "title" varchar(255) NOT NULL,
  "message" text,
  "link_url" varchar(500),
  "read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "in_app_notif_user_read_created_idx" ON "in_app_notifications" ("user_id", "read", "created_at");
CREATE INDEX IF NOT EXISTS "in_app_notif_user_created_idx" ON "in_app_notifications" ("user_id", "created_at");
