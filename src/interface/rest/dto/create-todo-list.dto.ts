import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTodoListDto {

    @IsString()
    @IsNotEmpty()
    title: string;

    createdAt?: Date;

    updatedAt?: Date;
}