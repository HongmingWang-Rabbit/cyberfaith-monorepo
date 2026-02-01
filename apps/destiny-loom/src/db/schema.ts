import { pgTable, idColumn, timestampColumns, varchar, text, integer, jsonb } from "@cyberfaith/db-utils";

export const journeys = pgTable("journeys", {
  id: idColumn(),
  ...timestampColumns(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  progress: integer("progress").notNull().default(0),
  metadata: jsonb("metadata"),
});
