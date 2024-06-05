import { TodoItem } from '../../domain/todo-item/todo-item.entity';

export class CreateTodoItemCommand {
    constructor(
        public readonly todoListId: string,
        public readonly title: string,
        public readonly description: string,
        public readonly priority: number,
    ) { }
}

export class UpdateTodoItemCommand {
    constructor(
        public readonly id: string,
        public readonly updateData: Partial<TodoItem>,
    ) { }
}

export class DeleteTodoItemCommand {
    constructor(
        public readonly id: string,
    ) { }
}