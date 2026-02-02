import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, of, tap } from "rxjs";
import { CacheService } from "./cache.service";
import type { Request } from "express";

export const CACHE_TTL_KEY = "cache:ttl";
export const CACHE_KEY_PREFIX = "cache:prefix";

/** Decorator: set TTL in seconds for a cached endpoint */
export const CacheTTL = (seconds: number) =>
  SetMetadata(CACHE_TTL_KEY, seconds * 1000);

/** Decorator: set a custom cache key prefix */
export const CachePrefix = (prefix: string) =>
  SetMetadata(CACHE_KEY_PREFIX, prefix);

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cache: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest<Request>();

    // Only cache GET requests
    if (req.method !== "GET") {
      return next.handle();
    }

    const ttlMs =
      this.reflector.get<number>(CACHE_TTL_KEY, context.getHandler()) ??
      5 * 60 * 1000; // default 5 min

    const prefix =
      this.reflector.get<string>(CACHE_KEY_PREFIX, context.getHandler()) ?? "";

    const cacheKey = `http:${prefix}:${req.originalUrl}`;

    const cached = await this.cache.get(cacheKey);
    if (cached !== null) {
      return of(cached);
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.cache.set(cacheKey, data, ttlMs);
      }),
    );
  }
}
