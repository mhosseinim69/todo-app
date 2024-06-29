import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { TodoListRepository } from '../../domain/todo-list/todo-list.repository.interface';
import { GetTodoListByIdQuery, GetAllTodoListsQuery } from '../queries/todo-list.queries';
import { TodoList } from 'src/domain/todo-list/todo-list.entity';
import { WinstonLogger } from '../../application/logger/winston-logger.service';

@QueryHandler(GetTodoListByIdQuery)
export class GetTodoListByIdHandler implements IQueryHandler<GetTodoListByIdQuery> {
    constructor(
        @Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository,
        private readonly logger: WinstonLogger) { }

    async execute(query: GetTodoListByIdQuery): Promise<TodoList | null> {

        let todoList: TodoList | null;

        try {
            todoList = await this.todoListRepository.findById(query.id);
            todoList.sortTodoItemsByPriority();
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.logger.error(`TodoList with ID ${query.id} not found`, error.stack);
                throw error;
            } else {
                this.logger.error(`Error getting todoList with ID ${query.id}: ${error.message}`, error.stack);
                throw new BadRequestException(error.message);
            }
        }

        return todoList
    }
}


@QueryHandler(GetAllTodoListsQuery)
export class GetAllTodoListsHandler implements IQueryHandler<GetAllTodoListsQuery> {
    constructor(
        @Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository,
        private readonly logger: WinstonLogger) { }

    async execute(): Promise<TodoList[]> {

        let todoLists: TodoList[];

        try {
            todoLists = await this.todoListRepository.findAll();
            todoLists.forEach(todoList => todoList.sortTodoItemsByPriority());
        } catch (error) {
            this.logger.error(`Error getting todoLists ${error.message}`, error.stack);
            throw new BadRequestException(error.message);
        }

        return todoLists
    }
}