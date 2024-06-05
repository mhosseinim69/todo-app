import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserRepository } from '../../domain/user/user.repository.interface';
import { GetUserByIdQuery, GetUserByUserNameQuery, GetAllUsersQuery } from '../queries/user.queries';
import { User } from '../../domain/user/user.entity';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
    constructor(@Inject('UserRepository') private readonly userRepository: UserRepository) { }

    async execute(query: GetUserByIdQuery): Promise<User | null> {
        return this.userRepository.findById(query.id);
    }
}

@QueryHandler(GetUserByUserNameQuery)
export class GetUserByUserNameHandler implements IQueryHandler<GetUserByUserNameQuery> {
    constructor(@Inject('UserRepository') private readonly userRepository: UserRepository) { }

    async execute(query: GetUserByUserNameQuery): Promise<User | null> {
        return this.userRepository.findOne(query.username);
    }
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery> {
    constructor(@Inject('UserRepository') private readonly userRepository: UserRepository) { }

    async execute(): Promise<User[]> {
        return this.userRepository.findAll();
    }
}