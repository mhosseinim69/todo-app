import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../../domain/user/user.repository.interface';
import { CreateUserCommand, UpdateUserCommand, DeleteUserCommand } from '../commands/user.commands';
import { User } from '../../domain/user/user.entity';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
    constructor(
        @Inject('UserRepository') private readonly userRepository: UserRepository,
        private readonly eventPublisher: EventPublisher,
    ) { }

    async execute(command: CreateUserCommand): Promise<User> {
        const { username, password } = command;
        const userContext = this.eventPublisher.mergeObjectContext(new User(null, username, password));

        try {
            const createdUser = await this.userRepository.create(userContext);

            const userEvent = this.eventPublisher.mergeObjectContext(
                new User(createdUser.id, username, password),
            );
            userEvent.createUser();
            userEvent.commit();

            return createdUser;
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException(`Username '${username}' is already taken`);
            } else {
                throw new InternalServerErrorException(error.message);
            }
        }
    }
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
    constructor(@Inject('UserRepository') private readonly userRepository: UserRepository,
        private readonly publisher: EventPublisher) { }

    async execute(command: UpdateUserCommand): Promise<User | null> {
        const { id, updateData } = command;
        try {
            const user = await this.userRepository.findById(id);
            if (!user) {
                throw new NotFoundException(`User with id ${id} not found`);
            }
            const userContext = this.publisher.mergeObjectContext(user);
            userContext.updateUser(updateData);
            await this.userRepository.update(id, userContext);
            userContext.commit();
            return user;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            } else {
                throw new InternalServerErrorException(error.message);
            }
        }
    }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
    constructor(@Inject('UserRepository') private readonly userRepository: UserRepository,
        private readonly publisher: EventPublisher) { }

    async execute(command: DeleteUserCommand): Promise<boolean> {
        const { id } = command;
        try {
            const user = await this.userRepository.findById(id);
            if (!user) {
                throw new NotFoundException(`User with id ${id} not found`);
            }
            const userContext = this.publisher.mergeObjectContext(user);
            userContext.deleteUser();
            await this.userRepository.delete(id);
            userContext.commit();
            return true;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            } else {
                throw new InternalServerErrorException(error.message);
            }
        }
    }
}