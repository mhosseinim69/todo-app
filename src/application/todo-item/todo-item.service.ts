import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TodoItem } from 'src/domain/todo-item/todo-item.entity';
import { CreateTodoItemCommand, UpdateTodoItemCommand, DeleteTodoItemCommand } from '../commands/todo-item.commands';
import { GetTodoItemByIdQuery, GetAllTodoItemsQuery } from '../queries/todo-item.queries';

@Injectable()

export class TodoItemService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus) { }

    async createTodoItem(todoListId: string, title: string, description: string, priority: number): Promise<TodoItem> {
        return this.commandBus.execute(new CreateTodoItemCommand(todoListId, title, description, priority));
    }

    async getTodoItemById(id: string): Promise<TodoItem | null> {
        return this.queryBus.execute(new GetTodoItemByIdQuery(id));
    }

    async getAllTodoItems(): Promise<TodoItem[]> {
        return this.queryBus.execute(new GetAllTodoItemsQuery());
    }

    async updateTodoItem(id: string, updateData: Partial<TodoItem>): Promise<TodoItem | null> {
        return this.commandBus.execute(new UpdateTodoItemCommand(id, updateData));
    }

    async deleteTodoItem(id: string): Promise<string> {
        const result = await this.commandBus.execute(new DeleteTodoItemCommand(id));
        return result ? 'TodoItem deleted successfully' : 'TodoItem not found';
    }
}