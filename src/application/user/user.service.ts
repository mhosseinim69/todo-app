import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand, UpdateUserCommand, DeleteUserCommand } from '../commands/user.commands';
import { GetUserByIdQuery, GetUserByUserNameQuery, GetAllUsersQuery } from '../queries/user.queries';
import { User } from '../../domain/user/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'
import { JwtConfigService } from '../authentication/jwt-config.service';

@Injectable()
export class UserService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly jwtService: JwtService,
        private jwtConfigService: JwtConfigService) { }

    async registerUser(username: string, password: string): Promise<{ user: User; token: string }> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.commandBus.execute(new CreateUserCommand(username, hashedPassword));

        const token = this.jwtService.sign({ sub: user.id, username: user.username }, {
            secret: this.jwtConfigService.getSecretKey(),
        });

        return { user, token };
    }

    async getUserById(id: string): Promise<User | null> {
        return this.queryBus.execute(new GetUserByIdQuery(id));
    }

    async getUserByUserName(username: string): Promise<User | null> {
        return this.queryBus.execute(new GetUserByUserNameQuery(username));
    }

    async getAllUsers(): Promise<User[]> {
        return this.queryBus.execute(new GetAllUsersQuery());
    }

    async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
        return this.commandBus.execute(new UpdateUserCommand(id, updateData));
    }

    async deleteUser(id: string): Promise<string> {
        const result = await this.commandBus.execute(new DeleteUserCommand(id));
        return result ? 'User deleted successfully' : 'User not found';
    }
}