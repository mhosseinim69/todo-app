import { AggregateRoot } from '@nestjs/cqrs';
import { TodoItem } from '../todo-item/todo-item.entity';
import { TodoListCreatedEvent, TodoListUpdatedEvent, TodoListDeletedEvent } from '../../domain/events/todo-list-events';

export interface ITodoList {
    _id: string;
    userId: string;
    title: string;
    todoItems: TodoItem[];
    createdAt?: Date;
    updatedAt?: Date;
}

export class TodoList extends AggregateRoot implements ITodoList {
    constructor(
        public readonly _id: string,
        public readonly userId: string,
        public title: string,
        public todoItems: TodoItem[] = [],
        public createdAt?: Date,
        public updatedAt?: Date
    ) {
        super();
    }

    createTodoList() {
        this.apply(new TodoListCreatedEvent(this._id, this.userId));
    }

    updateTodoList(updateData: Partial<TodoList>) {
        if (updateData.title) this.title = updateData.title;
        this.apply(new TodoListUpdatedEvent(this._id));
    }

    deleteTodoList() {
        this.apply(new TodoListDeletedEvent(this._id));
    }

    addTodoItem(todoItem: TodoItem) {
        this.todoItems.push(todoItem);
        this.apply(new TodoListUpdatedEvent(this._id));
    }

    removeTodoItem(todoItemId: string) {
        this.todoItems = this.todoItems.filter(item => item._id !== todoItemId);
    }

    sortTodoItemsByPriority() {
        this.todoItems.sort((a, b) => a.priority - b.priority);
    }
}