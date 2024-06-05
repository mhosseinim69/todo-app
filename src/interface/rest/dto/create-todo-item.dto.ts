import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTodoItemDto {
    @IsString()
    @IsNotEmpty()
    todoListId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    priority: number;

    createdAt?: Date;

    updatedAt?: Date;
}