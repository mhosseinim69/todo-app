import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../domain/user/user.repository.interface';
import { GetUserByIdQuery, GetAllUsersQuery } from '../queries/user.queries';
import { User } from '../../domain/user/user.entity';
import { WinstonLogger } from '../../application/logger/winston-logger.service';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
    constructor(
        @Inject('UserRepository') private readonly userRepository: UserRepository,
        private readonly logger: WinstonLogger) { }

    async execute(query: GetUserByIdQuery): Promise<User | null> {

        let user: User | null;

        try {
            user = await this.userRepository.findById(query.id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.logger.error(`User with ID ${query.id} not found`, error.stack);
                throw error;
            } else {
                this.logger.error(`Error getting user with ID ${query.id}: ${error.message}`, error.stack);
                throw new BadRequestException(error.message);
            }
        }

        return user
    }
}


@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery> {
    constructor(
        @Inject('UserRepository') private readonly userRepository: UserRepository,
        private readonly logger: WinstonLogger) { }

    async execute(): Promise<User[]> {

        let users: User[];

        try {
            users = await this.userRepository.findAll();
        } catch (error) {
            this.logger.error(`Error getting users ${error.message}`, error.stack);
            throw new BadRequestException(error.message);
        }

        return users
    }
}