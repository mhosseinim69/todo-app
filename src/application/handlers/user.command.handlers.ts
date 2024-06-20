import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../domain/user/user.repository.interface';
import { CreateUserCommand, UpdateUserCommand, DeleteUserCommand } from '../commands/user.commands';
import { User } from '../../domain/user/user.entity';
import { WinstonLogger } from '../../application/logger/winston-logger.service';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
    constructor(
        @Inject('UserRepository') private readonly userRepository: UserRepository,
        private readonly eventPublisher: EventPublisher,
        private readonly logger: WinstonLogger,
    ) { }

    async execute(command: CreateUserCommand): Promise<User> {
        const { username, password } = command;
        const userContext = this.eventPublisher.mergeObjectContext(new User(null, username, password));

        let createdUser: User;

        try {
            createdUser = await this.userRepository.create(userContext);
        } catch (error) {
            if (error.code === 11000) {
                this.logger.error(`Username '${username}' is already taken`, error.stack);
                throw new ConflictException(`Username '${username}' is already taken`);
            } else {
                this.logger.error(`Failed to create user: ${error.message}`, error.stack);
                throw new BadRequestException(error.message);
            }
        }

        const userEvent = this.eventPublisher.mergeObjectContext(
            new User(createdUser.id, username, password),
        );
        userEvent.createUser();
        userEvent.commit();

        return createdUser;
    }
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
    constructor(@Inject('UserRepository') private readonly userRepository: UserRepository,
        private readonly eventPublisher: EventPublisher,
        private readonly logger: WinstonLogger) { }

    async execute(command: UpdateUserCommand): Promise<User | null> {
        const { id, updateData } = command;

        let user: User | null;

        try {
            user = await this.userRepository.findById(id);
            await this.userRepository.update(id, updateData);
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.logger.error(`User with ID ${id} not found`, error.stack);
                throw error;
            } else if (error.code === 11000) {
                this.logger.error(`Username '${updateData.username}' is already taken`, error.stack);
                throw new ConflictException(`Username '${updateData.username}' is already taken`);
            } else {
                this.logger.error(`Error updating user with ID ${id}: ${error.message}`, error.stack);
                throw new BadRequestException(error.message);
            }
        }

        const userContext = this.eventPublisher.mergeObjectContext(user);
        userContext.updateUser(updateData);
        userContext.commit();

        return user;
    }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
    constructor(@Inject('UserRepository') private readonly userRepository: UserRepository,
        private readonly eventPublisher: EventPublisher,
        private readonly logger: WinstonLogger) { }

    async execute(command: DeleteUserCommand): Promise<boolean> {
        const { id } = command;

        let user: User | null;

        try {
            user = await this.userRepository.findById(id);
            await this.userRepository.delete(id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.logger.error(`User with ID ${id} not found`, error.stack);
                throw error;
            } else {
                this.logger.error(`Error deleting user with ID ${id}: ${error.message}`, error.stack);
                throw new BadRequestException(error.message);
            }
        }

        const userContext = this.eventPublisher.mergeObjectContext(user);
        userContext.deleteUser();
        userContext.commit();

        return true;
    }
}