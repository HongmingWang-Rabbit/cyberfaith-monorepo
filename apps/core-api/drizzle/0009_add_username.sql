ALTER TABLE "users" ADD COLUMN "username" varchar(50);
CREATE UNIQUE INDEX "users_username_unique" ON "users" ("username");

-- Auto-generate usernames from existing display names
UPDATE "users" SET "username" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE("name", '[^a-zA-Z0-9]', '-', 'g'), '-+', '-', 'g')) || '-' || SUBSTR("id"::text, 1, 4)
WHERE "username" IS NULL;
