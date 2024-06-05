import { Injectable } from '@nestjs/common';
import { TodoList } from '../../domain/todo-list/todo-list.entity';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTodoListCommand, UpdateTodoListCommand, DeleteTodoListCommand } from '../commands/todo-list.commands';
import { GetTodoListByIdQuery, GetAllTodoListsQuery } from '../queries/todo-list.queries';

@Injectable()
export class TodoListService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus) { }

    async createTodoList(userId: string, title: string): Promise<TodoList> {
        return this.commandBus.execute(new CreateTodoListCommand(userId, title));
    }

    async getTodoListById(id: string): Promise<TodoList | null> {
        return this.queryBus.execute(new GetTodoListByIdQuery(id));
    }

    async getAllTodoLists(): Promise<TodoList[]> {
        return this.queryBus.execute(new GetAllTodoListsQuery());
    }

    async updateTodoList(id: string, updateData: Partial<TodoList>): Promise<TodoList | null> {
        return this.commandBus.execute(new UpdateTodoListCommand(id, updateData));
    }

    async deleteTodoList(id: string): Promise<string> {
        const result = this.commandBus.execute(new DeleteTodoListCommand(id));
        return result ? 'TodoList deleted successfully' : 'TodoList not found';
    }
}