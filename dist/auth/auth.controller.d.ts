import { AuthService } from "./auth.service";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    constructor(authService: AuthService, configService: ConfigService);
    googleAuth(req: any): Promise<void>;
    googleAuthRedirect(req: any, res: Response): Promise<void>;
}
