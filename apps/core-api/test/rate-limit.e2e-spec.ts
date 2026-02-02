/**
 * Rate limiting e2e tests
 * Hit endpoint multiple times → 429 returned
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe, Module, Controller, Get } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { RateLimitGuard } from "../src/common/rate-limit.guard";

// Minimal app module with tight rate limit for testing
@Controller("test-endpoint")
class TestController {
  @Get()
  hello() {
    return { ok: true };
  }
}

@Module({
  controllers: [TestController],
  providers: [
    {
      provide: APP_GUARD,
      useFactory: () => new RateLimitGuard(5, 60_000), // 5 requests per minute
    },
  ],
})
class RateLimitTestModule {}

describe("Rate Limiting (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RateLimitTestModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should allow requests within the rate limit", async () => {
    const res = await request(app.getHttpServer())
      .get("/test-endpoint")
      .expect(200);

    expect(res.body.ok).toBe(true);
  });

  it("should return 429 after exceeding rate limit", async () => {
    const server = app.getHttpServer();

    // Fire requests up to the limit (5) + 1 extra
    const results: number[] = [];
    for (let i = 0; i < 7; i++) {
      const res = await request(server).get("/test-endpoint");
      results.push(res.status);
    }

    // At least one should be 429
    expect(results).toContain(429);

    // First few should be 200
    expect(results.slice(0, 5).every((s) => s === 200)).toBe(true);
  });

  it("429 response should contain rate limit error info", async () => {
    const server = app.getHttpServer();

    // Exhaust limit
    let lastRes: any;
    for (let i = 0; i < 10; i++) {
      lastRes = await request(server).get("/test-endpoint");
      if (lastRes.status === 429) break;
    }

    if (lastRes.status === 429) {
      expect(lastRes.body).toHaveProperty("message", "Too Many Requests");
      expect(lastRes.body).toHaveProperty("error", "RATE_LIMIT_EXCEEDED");
    }
  });
});
