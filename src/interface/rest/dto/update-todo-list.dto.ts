import { IsString, IsOptional } from 'class-validator';

export class UpdateTodoListDto {
    @IsString()
    @IsOptional()
    title?: string;

    updatedAt?: Date;
}