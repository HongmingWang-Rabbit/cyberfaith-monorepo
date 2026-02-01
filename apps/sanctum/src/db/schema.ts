import { pgTable, idColumn, timestampColumns, varchar, text, jsonb } from "@cyberfaith/db-utils";

export const sanctumProfiles = pgTable("sanctum_profiles", {
  id: idColumn(),
  ...timestampColumns(),
  userId: varchar("user_id", { length: 36 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }),
  bio: text("bio"),
  preferences: jsonb("preferences"),
});
