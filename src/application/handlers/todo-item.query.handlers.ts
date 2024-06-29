import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { TodoItemRepository } from '../../domain/todo-item/todo-item.repository.interface';
import { GetTodoItemByIdQuery, GetAllTodoItemsQuery } from '../queries/todo-item.queries';
import { TodoItem } from '../../domain/todo-item/todo-item.entity';
import { WinstonLogger } from '../../application/logger/winston-logger.service';

@QueryHandler(GetTodoItemByIdQuery)
export class GetTodoItemByIdHandler implements IQueryHandler<GetTodoItemByIdQuery> {
    constructor(
        @Inject('TodoItemRepository') private readonly todoItemRepository: TodoItemRepository,
        private readonly logger: WinstonLogger) { }

    async execute(query: GetTodoItemByIdQuery): Promise<TodoItem | null> {

        let todoItem: TodoItem | null;

        try {
            todoItem = await this.todoItemRepository.findById(query.id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.logger.error(`TodoItem with ID ${query.id} not found`, error.stack);
                throw error;
            } else {
                this.logger.error(`Error getting todoItem with ID ${query.id}: ${error.message}`, error.stack);
                throw new BadRequestException(error.message);
            }
        }

        return todoItem
    }
}


@QueryHandler(GetAllTodoItemsQuery)
export class GetAllTodoItemsHandler implements IQueryHandler<GetAllTodoItemsQuery> {
    constructor(
        @Inject('TodoItemRepository') private readonly todoItemRepository: TodoItemRepository,
        private readonly logger: WinstonLogger) { }

    async execute(): Promise<TodoItem[]> {

        let todoItems: TodoItem[];

        try {
            todoItems = await this.todoItemRepository.findAll();
        } catch (error) {
            this.logger.error(`Error getting todoItems ${error.message}`, error.stack);
            throw new BadRequestException(error.message);
        }

        return todoItems
    }
}