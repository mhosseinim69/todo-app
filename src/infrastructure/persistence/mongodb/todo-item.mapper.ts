import { ITodoItem, TodoItem } from '../../../domain/todo-item/todo-item.entity';
import { TodoItemDocument } from './schemas/todo-item.schema';

export class TodoItemMapper {
    static toDomain(todoItemDocument: TodoItemDocument): TodoItem {
        const { _id, todoListId, title, description, priority, createdAt, updatedAt } = todoItemDocument;
        return new TodoItem(_id.toString(), todoListId, title, description, priority, createdAt, updatedAt);
    }

    static toPersistence(todoItem: ITodoItem): Partial<TodoItemDocument> {
        const { _id, todoListId, title, description, priority, createdAt, updatedAt } = todoItem;
        const persistenceData: Partial<TodoItemDocument> = { todoListId, title, description, priority, createdAt, updatedAt };

        if (_id) {
            persistenceData._id = _id.toString();
        }

        return persistenceData;
    }
}