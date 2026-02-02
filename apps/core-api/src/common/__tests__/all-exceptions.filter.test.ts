import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpException, HttpStatus, BadRequestException, NotFoundException } from "@nestjs/common";
import { AllExceptionsFilter } from "../all-exceptions.filter";
import { AppException } from "../app.exception";
import { ErrorCode } from "../error-codes";

describe("AllExceptionsFilter", () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockRequest = { url: "/test", method: "GET" };
    mockHost = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    };
  });

  it("handles AppException with error code", () => {
    const ex = new AppException(ErrorCode.INSUFFICIENT_POINTS, "Not enough points");
    filter.catch(ex, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    const body = mockResponse.json.mock.calls[0][0];
    expect(body.statusCode).toBe(400);
    expect(body.message).toBe("Not enough points");
    expect(body.error).toBe("INSUFFICIENT_POINTS");
    expect(body.path).toBe("/test");
    expect(body.timestamp).toBeDefined();
  });

  it("handles AppException with custom status", () => {
    const ex = new AppException(ErrorCode.READING_NOT_FOUND, "Not found", HttpStatus.NOT_FOUND);
    filter.catch(ex, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    const body = mockResponse.json.mock.calls[0][0];
    expect(body.error).toBe("READING_NOT_FOUND");
  });

  it("handles standard HttpException", () => {
    const ex = new NotFoundException("Resource missing");
    filter.catch(ex, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    const body = mockResponse.json.mock.calls[0][0];
    expect(body.statusCode).toBe(404);
    expect(body.message).toBe("Resource missing");
    expect(body.error).toBe("NOT_FOUND");
  });

  it("handles BadRequestException with array messages (class-validator)", () => {
    const ex = new BadRequestException({ message: ["field must be string", "field is required"] });
    filter.catch(ex, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    const body = mockResponse.json.mock.calls[0][0];
    expect(body.message).toBe("field must be string; field is required");
    expect(body.error).toBe("VALIDATION_ERROR");
  });

  it("handles unknown errors as 500", () => {
    const ex = new Error("Something broke");
    filter.catch(ex, mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    const body = mockResponse.json.mock.calls[0][0];
    expect(body.statusCode).toBe(500);
    expect(body.message).toBe("Something broke");
    expect(body.error).toBe("INTERNAL_ERROR");
  });

  it("handles non-Error thrown values", () => {
    filter.catch("random string", mockHost as any);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    const body = mockResponse.json.mock.calls[0][0];
    expect(body.statusCode).toBe(500);
    expect(body.message).toBe("Internal server error");
  });
});
