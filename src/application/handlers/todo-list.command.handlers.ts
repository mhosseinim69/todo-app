import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TodoListRepository } from '../../domain/todo-list/todo-list.repository.interface';
import { CreateTodoListCommand, UpdateTodoListCommand, DeleteTodoListCommand } from '../commands/todo-list.commands';
import { TodoList } from '../../domain/todo-list/todo-list.entity';
import { UserRepository } from '../../domain/user/user.repository.interface';
import { User } from 'src/domain/user/user.entity';

@CommandHandler(CreateTodoListCommand)
export class CreateTodoListHandler implements ICommandHandler<CreateTodoListCommand> {
    constructor(
        @Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository,
        @Inject('UserRepository') private readonly userRepository: UserRepository,
        private readonly eventPublisher: EventPublisher) { }

    async execute(command: CreateTodoListCommand): Promise<TodoList> {
        const { userId, title } = command;

        const todoListContext = this.eventPublisher.mergeObjectContext(new TodoList(null, userId, title));

        let createdTodoList: TodoList;

        try {
            createdTodoList = await this.todoListRepository.create(todoListContext);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
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
            throw new InternalServerErrorException(error.message);
        }

        const userContext = this.eventPublisher.mergeObjectContext(user);
        userContext.addTodoList(createdTodoList);
        await this.userRepository.update(userId, userContext);
        userContext.commit();

        return createdTodoList;
    }
}

@CommandHandler(UpdateTodoListCommand)
export class UpdateTodoListHandler implements ICommandHandler<UpdateTodoListCommand> {
    constructor(
        @Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository,
        private readonly eventPublisher: EventPublisher) { }

    async execute(command: UpdateTodoListCommand): Promise<TodoList | null> {
        const { id, updateData } = command;

        let todoList: TodoList | null;

        try {
            todoList = await this.todoListRepository.findById(id);
            if (!todoList) {
                throw new NotFoundException(`TodoList with id ${id} not found`);
            }
            await this.todoListRepository.update(id, updateData);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            } else {
                throw new InternalServerErrorException(error.message);
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
        private readonly eventPublisher: EventPublisher) { }

    async execute(command: DeleteTodoListCommand): Promise<boolean> {
        const { id } = command;

        let todoList: TodoList | null;

        try {
            todoList = await this.todoListRepository.findById(id);
            if (!todoList) {
                throw new NotFoundException(`TodoList with id ${id} not found`);
            }
            await this.todoListRepository.delete(id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            } else {
                throw new InternalServerErrorException(error.message);
            }
        }

        const todoListContext = this.eventPublisher.mergeObjectContext(todoList);
        todoListContext.deleteTodoList();
        todoListContext.commit();

        return true;
    }
}