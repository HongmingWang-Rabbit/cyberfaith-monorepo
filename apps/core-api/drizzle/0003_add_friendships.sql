DO $$ BEGIN
  CREATE TYPE "friendship_status" AS ENUM('pending', 'accepted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "friendships" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "requester_id" varchar(36) NOT NULL,
  "addressee_id" varchar(36) NOT NULL,
  "status" "friendship_status" DEFAULT 'pending' NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "friendship_unique" ON "friendships" ("requester_id", "addressee_id");
