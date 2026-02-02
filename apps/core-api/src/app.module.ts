import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { DbModule } from "./db/db.module";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PointsModule } from "./points/points.module";
import { AchievementsModule } from "./achievements/achievements.module";
import { ReadingsModule } from "./readings/readings.module";
import { LoggerMiddleware } from "./common/logger.middleware";
import { CorsMiddleware } from "./common/cors.middleware";
import { RateLimitGuard } from "./common/rate-limit.guard";
import { StripeModule } from "./stripe/stripe.module";
import { ArcadeModule } from "./arcade/arcade.module";
import { MuyuModule } from "./arcade/muyu/muyu.module";
import { FriendsModule } from "./friends/friends.module";
import { AdminModule } from "./admin/admin.module";
import { EmailModule } from "./email/email.module";
import { HoroscopeModule } from "./horoscope/horoscope.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { CompatibilityModule } from "./compatibility/compatibility.module";
import { ReferralsModule } from "./referrals/referrals.module";
import { GiftsModule } from "./gifts/gifts.module";
import { CacheModule } from "./cache/cache.module";
import { LeaderboardModule } from "./leaderboard/leaderboard.module";
import { FollowsModule } from "./follows/follows.module";
import { CommentsModule } from "./comments/comments.module";
import { ReportsModule } from "./reports/reports.module";
import { RedisModule } from "./redis/redis.module";
import { RedisService } from "./redis/redis.service";
import { MetricsMiddleware } from "./common/metrics.middleware";
import { MetricsModule } from "./metrics/metrics.module";

@Module({
  imports: [RedisModule, CacheModule, DbModule, HealthModule, AuthModule, UsersModule, PointsModule, AchievementsModule, ReadingsModule, StripeModule, ArcadeModule, MuyuModule, FriendsModule, EmailModule, AdminModule, HoroscopeModule, NotificationsModule, CompatibilityModule, ReferralsModule, GiftsModule, LeaderboardModule, MetricsModule, FollowsModule, CommentsModule, ReportsModule],
  providers: [
    {
      provide: APP_GUARD,
      useFactory: (redis: RedisService) => new RateLimitGuard(redis, 60, 60_000),
      inject: [RedisService],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware, LoggerMiddleware, MetricsMiddleware).forRoutes("*");
  }
}
