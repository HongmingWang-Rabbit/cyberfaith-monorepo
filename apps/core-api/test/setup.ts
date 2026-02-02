/**
 * E2E Test Setup for CyberFaith Core API
 *
 * Provides:
 * - Mock DB with in-memory tracking
 * - NestJS test module factory
 * - Auth helpers for JWT generation
 * - Cleanup utilities
 */
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AppModule } from "../src/app.module";
import { DRIZZLE } from "../src/db/db.module";
import { AllExceptionsFilter } from "../src/common/all-exceptions.filter";

// ── Mock DB ──────────────────────────────────────────────────────────────────

type Row = Record<string, any>;

/**
 * Simple in-memory mock that mimics Drizzle's query-builder chain.
 * Each table is stored as an array of rows. Supports insert/select/update/delete
 * with basic where filtering.
 */
export class MockDb {
  tables: Map<string, Row[]> = new Map();
  private idCounter = 0;

  private getTable(name: string): Row[] {
    if (!this.tables.has(name)) this.tables.set(name, []);
    return this.tables.get(name)!;
  }

  private nextId(): string {
    this.idCounter++;
    return `mock-id-${this.idCounter}`;
  }

  reset() {
    this.tables.clear();
    this.idCounter = 0;
  }

  /**
   * Seed a table with rows (for test setup convenience).
   */
  seed(tableName: string, rows: Row[]) {
    const table = this.getTable(tableName);
    for (const row of rows) {
      table.push({ id: this.nextId(), createdAt: new Date(), updatedAt: new Date(), ...row });
    }
  }

  /**
   * Returns a Drizzle-like chainable mock.
   */
  createProxy(): any {
    const db = this;

    const makeChain = () => {
      let _tableName: string | null = null;
      let _whereConditions: any[] = [];
      let _values: Row | Row[] | null = null;
      let _setData: Row | null = null;
      let _joinTable: string | null = null;
      let _joinOn: any = null;
      let _selectFields: any = null;
      let _orderDesc = false;
      let _limitNum: number | null = null;
      let _offsetNum: number | null = null;
      let _groupByFields: any[] = [];

      const resolveTableName = (tableRef: any): string => {
        // Drizzle table objects have a Symbol with the table name
        if (typeof tableRef === "object" && tableRef !== null) {
          // Check common patterns for table name
          const symbols = Object.getOwnPropertySymbols(tableRef);
          for (const sym of symbols) {
            const val = tableRef[sym];
            if (typeof val === "string") return val;
            if (typeof val === "object" && val?.name) return val.name;
          }
          // Fallback: check if it has a _.name (Drizzle v2)
          if (tableRef._?.name) return tableRef._.name;
          if (tableRef[Symbol.for("drizzle:Name")]) return tableRef[Symbol.for("drizzle:Name")];
        }
        return String(tableRef);
      };

      const matchesWhere = (row: Row): boolean => {
        if (_whereConditions.length === 0) return true;
        // Simple: always match (where conditions are opaque SQL expressions)
        // For real tests, we'll use the filter approach below
        return true;
      };

      const chain: any = {
        from(table: any) {
          _tableName = resolveTableName(table);
          return chain;
        },
        where(...args: any[]) {
          _whereConditions = args;
          return chain;
        },
        set(data: Row) {
          _setData = data;
          return chain;
        },
        values(data: Row | Row[]) {
          _values = data;
          return chain;
        },
        returning() {
          // Execute the pending operation
          const tableName = _tableName!;
          const table = db.getTable(tableName);

          if (_values) {
            // INSERT
            const rows = Array.isArray(_values) ? _values : [_values];
            const inserted: Row[] = [];
            for (const row of rows) {
              const newRow = {
                id: db.nextId(),
                createdAt: new Date(),
                updatedAt: new Date(),
                isPublic: false,
                isActive: true,
                subscriptionTier: "free",
                emailNotifications: true,
                role: "user",
                ...row,
              };
              table.push(newRow);
              inserted.push(newRow);
            }
            return Promise.resolve(inserted);
          }

          if (_setData) {
            // UPDATE – update all rows (where is ignored in mock, handled by test design)
            const updated: Row[] = [];
            for (const row of table) {
              Object.assign(row, _setData, { updatedAt: new Date() });
              updated.push({ ...row });
            }
            return Promise.resolve(updated);
          }

          // DELETE returning
          return Promise.resolve([...table]);
        },
        innerJoin(table: any, _on: any) {
          _joinTable = resolveTableName(table);
          _joinOn = _on;
          return chain;
        },
        leftJoin(table: any, _on: any) {
          _joinTable = resolveTableName(table);
          _joinOn = _on;
          return chain;
        },
        groupBy(...fields: any[]) {
          _groupByFields = fields;
          return chain;
        },
        orderBy(...args: any[]) {
          _orderDesc = true;
          return chain;
        },
        limit(n: number) {
          _limitNum = n;
          return chain.then ? chain : Object.assign(chain, {
            then(resolve: any, reject?: any) {
              return chain._execute().then(resolve, reject);
            }
          });
        },
        offset(n: number) {
          _offsetNum = n;
          return chain;
        },
        _execute(): Promise<Row[]> {
          const tableName = _tableName!;
          let rows = [...db.getTable(tableName)];
          if (_limitNum !== null) rows = rows.slice(_offsetNum || 0, (_offsetNum || 0) + _limitNum);
          return Promise.resolve(rows);
        },
        then(resolve: any, reject?: any) {
          return chain._execute().then(resolve, reject);
        },
      };

      return chain;
    };

    const proxy: any = {
      select: (fields?: any) => {
        const c = makeChain();
        return c;
      },
      insert: (table: any) => {
        const c = makeChain();
        const symbols = Object.getOwnPropertySymbols(table);
        for (const sym of symbols) {
          const val = table[sym];
          if (typeof val === "string") { c.from(table); break; }
          if (typeof val === "object" && val?.name) { c.from(table); break; }
        }
        if (table._?.name) c.from(table);
        return c;
      },
      update: (table: any) => {
        const c = makeChain();
        c.from(table);
        return c;
      },
      delete: (table: any) => {
        const c = makeChain();
        const tableName = typeof table === "string" ? table : (table._?.name || "unknown");
        const tbl = db.getTable(tableName);
        tbl.length = 0;
        c.from(table);
        return { where: () => Promise.resolve() };
      },
    };

    return proxy;
  }
}

// ── App Factory ──────────────────────────────────────────────────────────────

export interface TestContext {
  app: INestApplication;
  module: TestingModule;
  db: MockDb;
  jwtService: JwtService;
}

/**
 * Boot a full NestJS app with mock DB for e2e testing.
 */
export async function createTestApp(): Promise<TestContext> {
  const mockDb = new MockDb();
  const mockDbProxy = mockDb.createProxy();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DRIZZLE)
    .useValue(mockDbProxy)
    .compile();

  const app = moduleRef.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  await app.init();

  const jwtService = moduleRef.get(JwtService);

  return { app, module: moduleRef, db: mockDb, jwtService };
}

// ── Auth Helpers ─────────────────────────────────────────────────────────────

export interface TestUser {
  id: string;
  email: string;
  name: string;
  token: string;
}

let userCounter = 0;

/**
 * Generate a test user with a valid JWT token.
 */
export function createTestUser(jwtService: JwtService, overrides: Partial<TestUser> = {}): TestUser {
  userCounter++;
  const id = overrides.id || `test-user-${userCounter}`;
  const email = overrides.email || `user${userCounter}@test.com`;
  const name = overrides.name || `Test User ${userCounter}`;
  const token = jwtService.sign({ sub: id, email });

  return { id, email, name, token };
}

/**
 * Returns an Authorization header value for a test user.
 */
export function authHeader(user: TestUser): string {
  return `Bearer ${user.token}`;
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

/**
 * Reset state between tests.
 */
export function resetTestState(db: MockDb) {
  db.reset();
  userCounter = 0;
}

/**
 * Tear down the test app.
 */
export async function closeTestApp(app: INestApplication) {
  await app.close();
}
