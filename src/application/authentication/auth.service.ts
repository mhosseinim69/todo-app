import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtConfigService } from '../authentication/jwt-config.service';
import 'dotenv/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly jwtConfigService: JwtConfigService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.userService.getUserByUserName(username);
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.jwtConfigService.getSecretKey(),
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        return { access_token: accessToken };
    }
}