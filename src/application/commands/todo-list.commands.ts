import { TodoList } from '../../domain/todo-list/todo-list.entity';

export class CreateTodoListCommand {
    constructor(
        public readonly userId: string,
        public readonly title: string,
    ) { }
}

export class UpdateTodoListCommand {
    constructor(
        public readonly id: string,
        public readonly updateData: Partial<TodoList>,
    ) { }
}

export class DeleteTodoListCommand {
    constructor(
        public readonly id: string,
    ) { }
}