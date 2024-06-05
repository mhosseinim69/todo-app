import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtConfigService {
    constructor(private readonly configService: ConfigService) { }

    getSecretKey(): string {
        return this.configService.get<string>('JWT_SECRET');
    }
}