DO $$ BEGIN
  CREATE TYPE "journal_mood" AS ENUM('happy', 'neutral', 'sad', 'anxious', 'hopeful', 'confused');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "journal_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "reading_id" varchar(36) NOT NULL,
  "user_id" varchar(36) NOT NULL,
  "content" text NOT NULL,
  "mood" "journal_mood"
);

CREATE INDEX IF NOT EXISTS "journal_entries_user_id_idx" ON "journal_entries" ("user_id");
CREATE INDEX IF NOT EXISTS "journal_entries_reading_id_idx" ON "journal_entries" ("reading_id");
