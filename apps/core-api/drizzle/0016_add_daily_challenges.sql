-- Daily Challenges
CREATE TYPE challenge_type AS ENUM (
  'tarot_stranger', 'meditation', 'journaling', 'share_reading',
  'kindness', 'divination', 'reflection', 'community'
);

CREATE TABLE daily_challenges (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  type challenge_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  karma_reward INTEGER NOT NULL DEFAULT 10,
  date VARCHAR(10) NOT NULL
);

CREATE UNIQUE INDEX daily_challenge_date_unique ON daily_challenges (date);

CREATE TABLE challenge_completions (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  user_id VARCHAR(36) NOT NULL,
  challenge_id VARCHAR(36) NOT NULL
);

CREATE UNIQUE INDEX challenge_completion_unique ON challenge_completions (user_id, challenge_id);
CREATE INDEX challenge_completions_user_idx ON challenge_completions (user_id);
