import { Global, Module } from "@nestjs/common";
import { CacheService } from "./cache.service";

@Global()
@Module({
  providers: [
    {
      provide: CacheService,
      useFactory: () => new CacheService(500, 15 * 60 * 1000), // 500 entries, 15min default TTL
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
