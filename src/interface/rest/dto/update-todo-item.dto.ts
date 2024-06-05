import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateTodoItemDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    priority?: number;

    updatedAt?: Date;
}