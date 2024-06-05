export class UserCreatedEvent {
    constructor(public readonly userId: string, public readonly username: string) { }
}

export class UserUpdatedEvent {
    constructor(public readonly userId: string) { }
}

export class UserDeletedEvent {
    constructor(public readonly userId: string) { }
}