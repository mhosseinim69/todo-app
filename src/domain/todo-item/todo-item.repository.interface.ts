import { TodoItem } from './todo-item.entity';

export interface TodoItemRepository {
    findById(id: string): Promise<TodoItem | null>;
    findAll(): Promise<TodoItem[]>;
    create(todoItem: TodoItem): Promise<TodoItem>;
    update(id: string, todoItem: TodoItem): Promise<TodoItem | null>;
    delete(id: string): Promise<void>;
}