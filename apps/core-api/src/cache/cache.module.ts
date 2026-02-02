import { Global, Module } from "@nestjs/common";
import { CacheService } from "./cache.service";
import { RedisModule } from "../redis/redis.module";
import { RedisService } from "../redis/redis.service";

@Global()
@Module({
  imports: [RedisModule],
  providers: [
    {
      provide: CacheService,
      useFactory: (redis: RedisService) => new CacheService(redis, 500, 15 * 60 * 1000),
      inject: [RedisService],
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
