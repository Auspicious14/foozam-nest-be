import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
export declare class AuthService {
    private userModel;
    private jwtService;
    constructor(userModel: Model<User>, jwtService: JwtService);
    googleLogin(req: any): Promise<"No user from google" | {
        access_token: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            email: string;
            name: string;
            picture: string;
        };
    }>;
    validateUserByEmail(email: string): Promise<import("mongoose").Document<unknown, {}, User, {}, {}> & User & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
