-- Sprint 7: Add missing database indexes for common query patterns

-- users: lookup by subscription tier, stripe IDs, role
CREATE INDEX IF NOT EXISTS "users_subscription_tier_idx" ON "users" ("subscription_tier");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" ("role");
CREATE INDEX IF NOT EXISTS "users_stripe_customer_id_idx" ON "users" ("stripe_customer_id");
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" ("created_at");
CREATE INDEX IF NOT EXISTS "users_deleted_at_idx" ON "users" ("deleted_at");

-- readings: type index for filtering, isPublic for feed
CREATE INDEX IF NOT EXISTS "readings_type_idx" ON "readings" ("type");
CREATE INDEX IF NOT EXISTS "readings_is_public_created_at_idx" ON "readings" ("is_public", "created_at");
CREATE INDEX IF NOT EXISTS "readings_user_id_type_idx" ON "readings" ("user_id", "type");

-- arcade_plays: user lookups, game lookups
CREATE INDEX IF NOT EXISTS "arcade_plays_user_id_created_at_idx" ON "arcade_plays" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "arcade_plays_game_id_idx" ON "arcade_plays" ("game_id");

-- muyu_sessions: user lookups
CREATE INDEX IF NOT EXISTS "muyu_sessions_user_id_created_at_idx" ON "muyu_sessions" ("user_id", "created_at");

-- fortune_cookie_cracks: user lookups
CREATE INDEX IF NOT EXISTS "fortune_cookie_cracks_user_id_created_at_idx" ON "fortune_cookie_cracks" ("user_id", "created_at");

-- destiny_wheel_spins: user lookups
CREATE INDEX IF NOT EXISTS "destiny_wheel_spins_user_id_created_at_idx" ON "destiny_wheel_spins" ("user_id", "created_at");

-- meditation_sessions: user lookups
CREATE INDEX IF NOT EXISTS "meditation_sessions_user_id_created_at_idx" ON "meditation_sessions" ("user_id", "created_at");

-- referrals: lookup by referrer and code
CREATE INDEX IF NOT EXISTS "referrals_referrer_id_idx" ON "referrals" ("referrer_id");
CREATE INDEX IF NOT EXISTS "referrals_code_idx" ON "referrals" ("code");
CREATE INDEX IF NOT EXISTS "referrals_referred_user_id_idx" ON "referrals" ("referred_user_id");

-- gift_readings: sender and redeem lookups
CREATE INDEX IF NOT EXISTS "gift_readings_sender_id_idx" ON "gift_readings" ("sender_id");
CREATE INDEX IF NOT EXISTS "gift_readings_recipient_user_id_idx" ON "gift_readings" ("recipient_user_id");

-- push_subscriptions: user lookup
CREATE INDEX IF NOT EXISTS "push_subscriptions_user_id_idx" ON "push_subscriptions" ("user_id");

-- events: date range and active lookups
CREATE INDEX IF NOT EXISTS "events_start_date_end_date_idx" ON "events" ("start_date", "end_date");
CREATE INDEX IF NOT EXISTS "events_active_idx" ON "events" ("active");

-- games: status and sort
CREATE INDEX IF NOT EXISTS "games_status_sort_order_idx" ON "games" ("status", "sort_order");

-- user_settings: already has unique on userId, but add for broader queries
CREATE INDEX IF NOT EXISTS "user_settings_user_id_idx" ON "user_settings" ("user_id");
