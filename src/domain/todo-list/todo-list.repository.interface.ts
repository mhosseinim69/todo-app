import { TodoList } from './todo-list.entity';

export interface TodoListRepository {
    findById(id: string): Promise<TodoList | null>;
    findAll(): Promise<TodoList[]>;
    create(todoList: TodoList): Promise<TodoList>;
    update(id: string, todoList: TodoList): Promise<TodoList | null>;
    delete(id: string): Promise<void>;
}