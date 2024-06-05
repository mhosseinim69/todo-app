import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TodoListRepository } from '../../domain/todo-list/todo-list.repository.interface';
import { CreateTodoListCommand, UpdateTodoListCommand, DeleteTodoListCommand } from '../commands/todo-list.commands';
import { TodoList } from '../../domain/todo-list/todo-list.entity';
import { UserRepository } from '../../domain/user/user.repository.interface';

@CommandHandler(CreateTodoListCommand)
export class CreateTodoListHandler implements ICommandHandler<CreateTodoListCommand> {
    constructor(
        @Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository,
        @Inject('UserRepository') private readonly userRepository: UserRepository,
        private readonly publisher: EventPublisher) { }

    async execute(command: CreateTodoListCommand): Promise<TodoList> {
        const { userId, title } = command;

        const todoList = new TodoList(null, userId, title);
        const todoListContext = this.publisher.mergeObjectContext(todoList);
        todoListContext.createTodoList();

        try {
            const createdTodoList = await this.todoListRepository.create(todoListContext);
            todoListContext.commit();

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundException(`User with id ${userId} not found`);
            }
            const userContext = this.publisher.mergeObjectContext(user);
            userContext.addTodoList(createdTodoList);
            await this.userRepository.update(userId, userContext);
            userContext.commit();

            return createdTodoList;
        } catch (error) {
            throw new InternalServerErrorException('An error occurred while updating the todo list');
        }

    }
}

@CommandHandler(UpdateTodoListCommand)
export class UpdateTodoListHandler implements ICommandHandler<UpdateTodoListCommand> {
    constructor(
        @Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository,
        private readonly publisher: EventPublisher) { }

    async execute(command: UpdateTodoListCommand): Promise<TodoList | null> {
        const { id, updateData } = command;
        try {
            const todoList = await this.todoListRepository.findById(id);
            if (todoList) {
                Object.assign(todoList, updateData);
                todoList.updateTodoList();
                await this.todoListRepository.update(id, todoList);
                todoList.commit();
                return todoList;
            } else {
                throw new NotFoundException(`TodoList with id ${id} not found`);
            }
        } catch (error) {
            throw new InternalServerErrorException('An error occurred while updating the todo list');
        }
    }
}

@CommandHandler(DeleteTodoListCommand)
export class DeleteTodoListHandler implements ICommandHandler<DeleteTodoListCommand> {
    constructor(
        @Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository,
        private readonly publisher: EventPublisher) { }

    async execute(command: DeleteTodoListCommand): Promise<boolean> {
        const { id } = command;
        try {
            const todoList = await this.todoListRepository.findById(id);
            if (todoList) {
                const todoListContext = this.publisher.mergeObjectContext(todoList);
                todoListContext.deleteTodoList();
                await this.todoListRepository.delete(id);
                todoListContext.commit();
                return true;
            } else {
                throw new NotFoundException(`TodoList with id ${id} not found`);
            }
        } catch (error) {
            throw new InternalServerErrorException('An error occurred while deleting the todo list');
        }
    }
}