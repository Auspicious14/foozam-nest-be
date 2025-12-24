import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  InternalServerErrorException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Initiate Google OAuth flow" })
  async googleAuth(@Req() req) {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Google OAuth callback" })
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req);

      if (typeof result === "string") {
        throw new InternalServerErrorException(result);
      }

      const frontendUrl =
        this.configService.get<string>("FRONTEND_URL") ||
        "http://localhost:5371";
      return res.redirect(
        `${frontendUrl}/auth/callback?token=${result.access_token}`
      );
    } catch (error) {
      const frontendUrl =
        this.configService.get<string>("FRONTEND_URL") ||
        "http://localhost:5371";
      return res.redirect(`${frontendUrl}/auth/callback?error=auth_failed`);
    }
  }
}
