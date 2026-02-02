ALTER TABLE "readings" ADD COLUMN "is_favorite" boolean DEFAULT false NOT NULL;
CREATE INDEX "readings_user_favorite_idx" ON "readings" ("user_id", "is_favorite") WHERE "is_favorite" = true;
