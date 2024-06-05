export class TodoItemCreatedEvent {
    constructor(public readonly todoItemId: string, public readonly todoListId: string) { }
}

export class TodoItemUpdatedEvent {
    constructor(public readonly todoItemId: string) { }
}

export class TodoItemDeletedEvent {
    constructor(public readonly todoItemId: string) { }
}