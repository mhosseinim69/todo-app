import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TodoItemRepository } from '../../domain/todo-item/todo-item.repository.interface';
import { GetTodoItemByIdQuery, GetAllTodoItemsQuery } from '../queries/todo-item.queries';
import { TodoItem } from '../../domain/todo-item/todo-item.entity';

@QueryHandler(GetTodoItemByIdQuery)
export class GetTodoItemByIdHandler implements IQueryHandler<GetTodoItemByIdQuery> {
    constructor(@Inject('TodoItemRepository') private readonly todoItemRepository: TodoItemRepository) { }

    async execute(query: GetTodoItemByIdQuery): Promise<TodoItem | null> {
        return this.todoItemRepository.findById(query.id);
    }
}

@QueryHandler(GetAllTodoItemsQuery)
export class GetAllTodoItemsHandler implements IQueryHandler<GetAllTodoItemsQuery> {
    constructor(@Inject('TodoItemRepository') private readonly todoItemRepository: TodoItemRepository) { }

    async execute(): Promise<TodoItem[]> {
        return this.todoItemRepository.findAll();
    }
}