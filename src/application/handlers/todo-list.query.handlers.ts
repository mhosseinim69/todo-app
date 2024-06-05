import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TodoListRepository } from '../../domain/todo-list/todo-list.repository.interface';
import { GetTodoListByIdQuery, GetAllTodoListsQuery } from '../queries/todo-list.queries';
import { TodoList } from 'src/domain/todo-list/todo-list.entity';

@QueryHandler(GetTodoListByIdQuery)
export class GetTodoListByIdHandler implements IQueryHandler<GetTodoListByIdQuery> {
    constructor(@Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository) { }

    async execute(query: GetTodoListByIdQuery): Promise<TodoList | null> {
        const todoList = await this.todoListRepository.findById(query.id);
        if (todoList) {
            todoList.sortTodoItemsByPriority();
        }
        return todoList;
    }
}

@QueryHandler(GetAllTodoListsQuery)
export class GetAllTodoListsHandler implements IQueryHandler<GetAllTodoListsQuery> {
    constructor(@Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository) { }

    async execute(): Promise<TodoList[]> {
        const todoLists = await this.todoListRepository.findAll();
        todoLists.forEach(todoList => todoList.sortTodoItemsByPriority());
        return todoLists;
    }
}