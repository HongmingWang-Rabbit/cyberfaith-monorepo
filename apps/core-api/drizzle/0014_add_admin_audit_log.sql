CREATE TABLE IF NOT EXISTS "admin_audit_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "admin_user_id" varchar(36) NOT NULL,
  "action" varchar(100) NOT NULL,
  "target_type" varchar(50),
  "target_id" varchar(36),
  "details" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "audit_log_admin_user_idx" ON "admin_audit_log" ("admin_user_id");
CREATE INDEX IF NOT EXISTS "audit_log_created_at_idx" ON "admin_audit_log" ("created_at");
