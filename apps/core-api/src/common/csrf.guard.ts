import { Injectable, CanActivate, ExecutionContext, HttpStatus } from "@nestjs/common";
import { Request } from "express";
import { AppException } from "./app.exception";
import { ErrorCode } from "./error-codes";

/**
 * CSRF protection via Origin/Referer header validation.
 * Applied to state-changing methods (POST, PUT, PATCH, DELETE).
 * Skips GET, HEAD, OPTIONS and webhook paths.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly allowedOrigins: string[];
  private readonly skipPaths = ["/stripe/webhook"];

  constructor() {
    const envOrigins = process.env.ALLOWED_ORIGINS;
    this.allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      ...(envOrigins ? envOrigins.split(",").map((o) => o.trim()).filter(Boolean) : []),
    ];
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    // Skip safe methods
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      return true;
    }

    // Skip webhook endpoints
    if (this.skipPaths.some((p) => req.path.includes(p))) {
      return true;
    }

    const origin = req.headers.origin;
    const referer = req.headers.referer;

    // If Origin header is present, validate it
    if (origin) {
      if (this.allowedOrigins.includes(origin)) {
        return true;
      }
      throw new AppException(
        ErrorCode.FORBIDDEN || "FORBIDDEN",
        "CSRF validation failed: invalid origin",
        HttpStatus.FORBIDDEN,
      );
    }

    // Fall back to Referer header
    if (referer) {
      try {
        const refererOrigin = new URL(referer).origin;
        if (this.allowedOrigins.includes(refererOrigin)) {
          return true;
        }
      } catch {
        // Invalid referer URL
      }
      throw new AppException(
        ErrorCode.FORBIDDEN || "FORBIDDEN",
        "CSRF validation failed: invalid referer",
        HttpStatus.FORBIDDEN,
      );
    }

    // No origin or referer — allow if it's likely a server-to-server or API call with auth
    // (Bearer token requests from non-browser clients won't have Origin)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      return true;
    }

    throw new AppException(
      ErrorCode.FORBIDDEN || "FORBIDDEN",
      "CSRF validation failed: missing origin",
      HttpStatus.FORBIDDEN,
    );
  }
}
