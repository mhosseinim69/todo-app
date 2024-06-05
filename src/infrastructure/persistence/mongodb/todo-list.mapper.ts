import { ITodoList, TodoList } from '../../../domain/todo-list/todo-list.entity';
import { TodoListDocument } from './schemas/todo-list.schema';

export class TodoListMapper {
    static toDomain(todoListDocument: TodoListDocument): TodoList {
        const { _id, userId, title, todoItems, createdAt, updatedAt } = todoListDocument;
        return new TodoList(_id.toString(), userId, title, todoItems, createdAt, updatedAt);
    }

    static toPersistence(todoList: ITodoList): Partial<TodoListDocument> {
        const { _id, userId, title, todoItems, createdAt, updatedAt } = todoList;
        const persistenceData: Partial<TodoListDocument> = { userId, title, todoItems, createdAt, updatedAt };

        if (_id) {
            persistenceData._id = _id.toString();
        }

        return persistenceData;
    }
}