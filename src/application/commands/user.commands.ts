import { User } from '../../domain/user/user.entity';

export class CreateUserCommand {
    constructor(
        public readonly username: string,
        public readonly password: string,
    ) { }
}

export class UpdateUserCommand {
    constructor(
        public readonly id: string,
        public readonly updateData: Partial<User>,
    ) { }
}

export class DeleteUserCommand {
    constructor(
        public readonly id: string,
    ) { }
}