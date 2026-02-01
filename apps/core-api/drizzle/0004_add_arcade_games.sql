DO $$ BEGIN
  CREATE TYPE "game_status" AS ENUM('active', 'draft', 'disabled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "games" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "slug" varchar(50) NOT NULL UNIQUE,
  "name" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "thumbnail" varchar(100),
  "config" jsonb NOT NULL,
  "status" "game_status" DEFAULT 'active' NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "arcade_plays" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "user_id" varchar(36) NOT NULL,
  "game_id" varchar(36) NOT NULL,
  "points_spent" integer NOT NULL,
  "points_won" integer DEFAULT 0 NOT NULL,
  "result" jsonb
);
