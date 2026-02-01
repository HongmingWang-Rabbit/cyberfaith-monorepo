CREATE TABLE "readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"type" varchar(20) NOT NULL,
	"input" jsonb,
	"result" jsonb,
	"locale" varchar(10)
);
