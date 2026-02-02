-- Sprint 4: Zodiac Compatibility Matrix cache table
CREATE TABLE IF NOT EXISTS "compatibility_results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "sign1" varchar(20) NOT NULL,
  "sign2" varchar(20) NOT NULL,
  "mbti_type1" varchar(4),
  "mbti_type2" varchar(4),
  "content" jsonb NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "compatibility_pair_unique"
  ON "compatibility_results" ("sign1", "sign2", "mbti_type1", "mbti_type2");
