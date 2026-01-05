import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    const { email, firstName, lastName, picture } = req.user;
    
    let user = await this.userModel.findOne({ email });
    const adminEmails = this.configService.get<string>('ADMIN_EMAILS')?.split(',') || [];
    const isAdmin = adminEmails.includes(email);

    if (!user) {
      user = await this.userModel.create({
        email,
        name: `${firstName} ${lastName}`,
        picture,
        lastLogin: new Date(),
        role: isAdmin ? 'admin' : 'user',
      });
    } else {
      user.lastLogin = new Date();
      if (isAdmin && user.role !== 'admin') {
        user.role = 'admin';
      }
      await user.save();
    }

    const payload = { 
      email: user.email, 
      sub: user._id, 
      name: user.name,
      picture: user.picture,
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role
      }
    };
  }

  async validateUserByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
}
