export class GetUserByIdQuery {
    constructor(public readonly id: string) { }
}

export class GetUserByUserNameQuery {
    constructor(public readonly username: string) { }
}

export class GetAllUsersQuery { }