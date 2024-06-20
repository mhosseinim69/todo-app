import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { TodoListRepository } from '../../domain/todo-list/todo-list.repository.interface';
import { CreateTodoListCommand, UpdateTodoListCommand, DeleteTodoListCommand } from '../commands/todo-list.commands';
import { TodoList } from '../../domain/todo-list/todo-list.entity';
import { UserRepository } from '../../domain/user/user.repository.interface';
import { User } from 'src/domain/user/user.entity';
import { WinstonLogger } from '../../application/logger/winston-logger.service';

@CommandHandler(CreateTodoListCommand)
export class CreateTodoListHandler implements ICommandHandler<CreateTodoListCommand> {
    constructor(
        @Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository,
        @Inject('UserRepository') private readonly userRepository: UserRepository,
        private readonly eventPublisher: EventPublisher,
        private readonly logger: WinstonLogger) { }

    async execute(command: CreateTodoListCommand): Promise<TodoList> {
        const { userId, title } = command;

        let createdTodoList: TodoList;

        try {
            createdTodoList = await this.todoListRepository.create(new TodoList(null, userId, title));
        } catch (error) {
            this.logger.error(`Failed to create todolist: ${error.message}`, error.stack);
            throw new BadRequestException(error.message);
        }

        const todoListEvent = this.eventPublisher.mergeObjectContext(
            new TodoList(createdTodoList._id, userId, title),
        );
        todoListEvent.createTodoList();
        todoListEvent.commit();

        let user: User;

        try {
            user = await this.userRepository.findById(userId);;
        } catch (error) {
            this.logger.error(`Error occurred: ${error.message}`, error.stack);
            throw new BadRequestException(error.message);
        }

        const userContext = this.eventPublisher.mergeObjectContext(user);
        userContext.addTodoList(createdTodoList);
        try {
            await this.userRepository.update(userId, userContext);
        } catch (error) {
            this.logger.error(`Error updating user with ID ${userId}: ${error.message}`, error.stack);
            throw new BadRequestException(error.message);
        }

        userContext.commit();

        return createdTodoList;
    }
}

@CommandHandler(UpdateTodoListCommand)
export class UpdateTodoListHandler implements ICommandHandler<UpdateTodoListCommand> {
    constructor(
        @Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository,
        private readonly eventPublisher: EventPublisher,
        private readonly logger: WinstonLogger) { }

    async execute(command: UpdateTodoListCommand): Promise<TodoList | null> {
        const { id, updateData } = command;

        let todoList: TodoList | null;

        try {
            todoList = await this.todoListRepository.findById(id);
            await this.todoListRepository.update(id, updateData);
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.logger.error(`TodoList with ID ${id} not found`, error.stack);
                throw error;
            } else {
                this.logger.error(`Error updating todolist with ID ${id}: ${error.message}`, error.stack);
                throw new BadRequestException(error.message);
            }
        }

        const todoListContext = this.eventPublisher.mergeObjectContext(todoList);
        todoListContext.updateTodoList(updateData);
        todoListContext.commit();

        return todoList
    }
}

@CommandHandler(DeleteTodoListCommand)
export class DeleteTodoListHandler implements ICommandHandler<DeleteTodoListCommand> {
    constructor(
        @Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository,
        private readonly eventPublisher: EventPublisher,
        private readonly logger: WinstonLogger) { }

    async execute(command: DeleteTodoListCommand): Promise<boolean> {
        const { id } = command;

        let todoList: TodoList | null;

        try {
            todoList = await this.todoListRepository.findById(id);
            await this.todoListRepository.delete(id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.logger.error(`TodoList with ID ${id} not found`, error.stack);
                throw error;
            } else {
                this.logger.error(`Error deleting todolist with ID ${id}: ${error.message}`, error.stack);
                throw new BadRequestException(error.message);
            }
        }

        const todoListContext = this.eventPublisher.mergeObjectContext(todoList);
        todoListContext.deleteTodoList();
        todoListContext.commit();

        return true;
    }
}