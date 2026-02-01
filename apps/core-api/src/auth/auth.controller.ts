import { Controller, Post, Body } from "@nestjs/common";

@Controller("auth")
export class AuthController {
  @Post("login")
  login(@Body() body: { email: string; password: string }) {
    return { success: true, message: "Login stub" };
  }

  @Post("register")
  register(@Body() body: { email: string; password: string; name: string }) {
    return { success: true, message: "Register stub" };
  }
}
