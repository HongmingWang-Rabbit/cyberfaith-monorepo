import { pgTable, idColumn, timestampColumns, varchar, text, boolean } from "@cyberfaith/db-utils";

export const communities = pgTable("communities", {
  id: idColumn(),
  ...timestampColumns(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(true).notNull(),
  createdBy: varchar("created_by", { length: 36 }).notNull(),
});

export const memberships = pgTable("memberships", {
  id: idColumn(),
  ...timestampColumns(),
  communityId: varchar("community_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("member"),
});
