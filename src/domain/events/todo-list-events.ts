export class TodoListCreatedEvent {
    constructor(public readonly todoListId: string, public readonly userId: string) { }
}

export class TodoListUpdatedEvent {
    constructor(public readonly todoListId: string) { }
}

export class TodoListDeletedEvent {
    constructor(public readonly todoListId: string) { }
}