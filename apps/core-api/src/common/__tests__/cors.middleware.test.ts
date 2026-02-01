import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CorsMiddleware } from "../cors.middleware";

describe("CorsMiddleware", () => {
  const middleware = new CorsMiddleware();
  const originalEnv = process.env.ALLOWED_ORIGINS;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.ALLOWED_ORIGINS;
    else process.env.ALLOWED_ORIGINS = originalEnv;
  });

  it("sets CORS headers for allowed origin", () => {
    const req = { headers: { origin: "http://localhost:3000" }, method: "GET" } as any;
    const res = { setHeader: vi.fn() } as any;
    const next = vi.fn();

    middleware.use(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Origin", "http://localhost:3000");
    expect(next).toHaveBeenCalled();
  });

  it("does not set origin for disallowed origin", () => {
    const req = { headers: { origin: "http://evil.com" }, method: "GET" } as any;
    const res = { setHeader: vi.fn() } as any;
    const next = vi.fn();

    middleware.use(req, res, next);
    const originCalls = (res.setHeader as any).mock.calls.filter((c: any[]) => c[0] === "Access-Control-Allow-Origin");
    expect(originCalls).toHaveLength(0);
    expect(next).toHaveBeenCalled();
  });

  it("returns 204 for OPTIONS", () => {
    const req = { headers: { origin: "http://localhost:3000" }, method: "OPTIONS" } as any;
    const res = { setHeader: vi.fn(), sendStatus: vi.fn() } as any;
    const next = vi.fn();

    middleware.use(req, res, next);
    expect(res.sendStatus).toHaveBeenCalledWith(204);
    expect(next).not.toHaveBeenCalled();
  });

  it("reads ALLOWED_ORIGINS from env", () => {
    process.env.ALLOWED_ORIGINS = "https://cyberfaith.app";
    const req = { headers: { origin: "https://cyberfaith.app" }, method: "GET" } as any;
    const res = { setHeader: vi.fn() } as any;
    const next = vi.fn();

    middleware.use(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Origin", "https://cyberfaith.app");
  });
});
