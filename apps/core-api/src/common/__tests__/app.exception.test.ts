import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { AppException } from "../app.exception";
import { ErrorCode } from "../error-codes";

describe("AppException", () => {
  it("creates exception with default BAD_REQUEST status", () => {
    const ex = new AppException(ErrorCode.INSUFFICIENT_POINTS, "Not enough");
    expect(ex.getStatus()).toBe(400);
    expect(ex.errorCode).toBe("INSUFFICIENT_POINTS");
    expect(ex.message).toBe("Not enough");
  });

  it("creates exception with custom status", () => {
    const ex = new AppException(ErrorCode.GAME_NOT_FOUND, "No game", HttpStatus.NOT_FOUND);
    expect(ex.getStatus()).toBe(404);
    expect(ex.errorCode).toBe("GAME_NOT_FOUND");
  });

  it("is instance of HttpException", () => {
    const ex = new AppException(ErrorCode.FORBIDDEN, "Nope", HttpStatus.FORBIDDEN);
    expect(ex).toBeInstanceOf(AppException);
  });
});
