import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

const DEFAULT_ORIGINS = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"];

function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    return [...DEFAULT_ORIGINS, ...envOrigins.split(",").map((o) => o.trim()).filter(Boolean)];
  }
  return DEFAULT_ORIGINS;
}

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const origin = req.headers.origin;
    const allowed = getAllowedOrigins();

    if (origin && allowed.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }

    next();
  }
}
