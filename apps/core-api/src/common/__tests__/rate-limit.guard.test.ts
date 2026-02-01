import { describe, it, expect } from "vitest";
import { RateLimitGuard } from "../rate-limit.guard";
import { HttpException } from "@nestjs/common";

function makeContext(ip = "127.0.0.1") {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ ip, socket: { remoteAddress: ip } }),
    }),
  } as any;
}

describe("RateLimitGuard", () => {
  it("allows requests within limit", () => {
    const guard = new RateLimitGuard(3, 60_000);
    expect(guard.canActivate(makeContext())).toBe(true);
    expect(guard.canActivate(makeContext())).toBe(true);
    expect(guard.canActivate(makeContext())).toBe(true);
  });

  it("blocks requests exceeding limit", () => {
    const guard = new RateLimitGuard(2, 60_000);
    guard.canActivate(makeContext());
    guard.canActivate(makeContext());
    expect(() => guard.canActivate(makeContext())).toThrow(HttpException);
  });

  it("tracks different IPs separately", () => {
    const guard = new RateLimitGuard(1, 60_000);
    expect(guard.canActivate(makeContext("1.1.1.1"))).toBe(true);
    expect(guard.canActivate(makeContext("2.2.2.2"))).toBe(true);
  });
});
