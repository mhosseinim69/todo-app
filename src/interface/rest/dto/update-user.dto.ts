import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    username?: string;

    @IsString()
    @IsOptional()
    password?: string;

    updatedAt?: Date;
}