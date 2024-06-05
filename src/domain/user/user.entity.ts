import { TodoList } from '../todo-list/todo-list.entity';
import { AggregateRoot } from '@nestjs/cqrs';
import { UserCreatedEvent, UserUpdatedEvent, UserDeletedEvent } from '../../domain/events/user-events';

export class User extends AggregateRoot {
    constructor(
        public readonly id: string,
        public username: string,
        public password: string,
        public todoLists: TodoList[] = [],
        public createdAt?: Date,
        public updatedAt?: Date
    ) {
        super();
    }

    addTodoList(todoList: TodoList) {
        this.todoLists.push(todoList);
        this.apply(new UserUpdatedEvent(this.id));
    }

    createUser() {
        this.apply(new UserCreatedEvent(this.id, this.username));
    }

    updateUser(updateData: Partial<User>) {
        if (updateData.username) this.username = updateData.username;
        if (updateData.password) this.password = updateData.password;
        this.apply(new UserUpdatedEvent(this.id));
    }

    deleteUser() {
        this.apply(new UserDeletedEvent(this.id));
    }
}