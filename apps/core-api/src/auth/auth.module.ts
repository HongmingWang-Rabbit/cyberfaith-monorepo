import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GoogleStrategy } from "./google.strategy";
import { MockGoogleStrategy } from "./mock-google.strategy";
import { JwtStrategy } from "./jwt.strategy";

const GoogleOAuthStrategy =
  process.env.AUTH_MOCK === "true" ? MockGoogleStrategy : GoogleStrategy;

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "dev-secret",
      signOptions: { expiresIn: "7d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleOAuthStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
