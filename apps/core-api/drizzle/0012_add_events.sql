-- Add events table for seasonal events
DO $$ BEGIN
  CREATE TYPE "event_type" AS ENUM('seasonal', 'holiday', 'astronomical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "type" "event_type" NOT NULL,
  "start_date" timestamp NOT NULL,
  "end_date" timestamp NOT NULL,
  "banner_image_url" text,
  "special_reading_type" varchar(50),
  "karma_multiplier" integer DEFAULT 1 NOT NULL,
  "active" boolean DEFAULT true NOT NULL
);
