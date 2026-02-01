import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

export function createDbClient(connectionString: string) {
  const client = postgres(connectionString);
  return drizzle(client);
}

export const idColumn = () => uuid("id").primaryKey().defaultRandom();
export const timestampColumns = () => ({
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export { pgTable, uuid, timestamp };
export { varchar, text, integer, boolean, jsonb } from "drizzle-orm/pg-core";
