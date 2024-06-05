import { AggregateRoot } from '@nestjs/cqrs';
import { TodoItemCreatedEvent, TodoItemUpdatedEvent, TodoItemDeletedEvent } from '../../domain/events/todo-item-events';

export interface ITodoItem {
    _id: string;
    todoListId: string;
    title: string;
    description: string;
    priority: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export class TodoItem extends AggregateRoot {
    constructor(
        public _id: string,
        public readonly todoListId: string,
        public readonly title: string,
        public readonly description: string,
        public readonly priority: number,
        public createdAt?: Date,
        public updatedAt?: Date
    ) {
        super();
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }

    createTodoItem() {
        this.apply(new TodoItemCreatedEvent(this._id, this.todoListId));
    }

    updateTodoItem() {
        this.updatedAt = new Date();
        this.apply(new TodoItemUpdatedEvent(this._id));
    }

    deleteTodoItem() {
        this.apply(new TodoItemDeletedEvent(this._id));
    }
}