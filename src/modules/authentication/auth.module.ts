import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '../../application/authentication/auth.service';
import { JwtStrategy } from '../../application/authentication/jwt.strategy';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from '../../application/user/user.service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtConfigService } from '../../application/authentication/jwt-config.service';

@Module({
    imports: [
        UserModule,
        PassportModule,
        ConfigModule.forRoot(),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>(process.env.JWT_SECRET),
                signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, JwtStrategy, UserService, CommandBus, QueryBus, JwtConfigService],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }