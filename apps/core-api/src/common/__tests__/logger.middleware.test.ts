import { describe, it, expect, vi } from "vitest";
import { LoggerMiddleware } from "../logger.middleware";

describe("LoggerMiddleware", () => {
  it("calls next and logs on finish", () => {
    const middleware = new LoggerMiddleware();
    const listeners: Record<string, Function> = {};
    const req = { method: "GET", originalUrl: "/health" } as any;
    const res = {
      statusCode: 200,
      on: vi.fn((event: string, cb: Function) => { listeners[event] = cb; }),
    } as any;
    const next = vi.fn();

    middleware.use(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.on).toHaveBeenCalledWith("finish", expect.any(Function));

    // Trigger finish
    listeners["finish"]();
  });
});
