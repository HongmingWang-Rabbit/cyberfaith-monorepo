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
  it("allows requests within limit", async () => {
    const guard = new RateLimitGuard(undefined, 3, 60_000);
    expect(await guard.canActivate(makeContext())).toBe(true);
    expect(await guard.canActivate(makeContext())).toBe(true);
    expect(await guard.canActivate(makeContext())).toBe(true);
  });

  it("blocks requests exceeding limit", async () => {
    const guard = new RateLimitGuard(undefined, 2, 60_000);
    await guard.canActivate(makeContext());
    await guard.canActivate(makeContext());
    await expect(guard.canActivate(makeContext())).rejects.toThrow(HttpException);
  });

  it("tracks different IPs separately", async () => {
    const guard = new RateLimitGuard(undefined, 1, 60_000);
    expect(await guard.canActivate(makeContext("1.1.1.1"))).toBe(true);
    expect(await guard.canActivate(makeContext("2.2.2.2"))).toBe(true);
  });
});
