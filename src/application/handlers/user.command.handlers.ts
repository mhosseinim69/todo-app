import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/user/user.repository.interface';
import { CreateUserCommand, UpdateUserCommand, DeleteUserCommand } from '../commands/user.commands';
import { User } from '../../domain/user/user.entity';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
    constructor(
        @Inject('UserRepository') private readonly userRepository: UserRepository,
        private readonly publisher: EventPublisher) { }

    async execute(command: CreateUserCommand): Promise<User> {
        const { username, password } = command;
        const user = this.publisher.mergeObjectContext(new User(null, username, password));
        user.createUser();
        try {
            const createdUser = await this.userRepository.create(user);
            user.commit();
            return createdUser;
        } catch (error) {
            throw new InternalServerErrorException('An error occurred while creating the user');
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
            throw new InternalServerErrorException('An error occurred while updating the user');
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
            throw new InternalServerErrorException('An error occurred while deleting the user');
        }
    }
}