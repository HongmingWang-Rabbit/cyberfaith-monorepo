import { Provider } from "@nestjs/common";
import { createDbClient } from "@cyberfaith/db-utils";

export const DRIZZLE = Symbol("DRIZZLE");

export const DrizzleProvider: Provider = {
  provide: DRIZZLE,
  useFactory: () => {
    const url = process.env.DATABASE_URL || "postgresql://localhost:5432/cyberfaith";
    return createDbClient(url);
  },
};
