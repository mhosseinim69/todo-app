import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { TodoItemRepository } from '../../domain/todo-item/todo-item.repository.interface';
import { CreateTodoItemCommand, UpdateTodoItemCommand, DeleteTodoItemCommand } from '../commands/todo-item.commands';
import { TodoItem } from '../../domain/todo-item/todo-item.entity';
import { TodoListRepository } from '../../domain/todo-list/todo-list.repository.interface';
import { TodoList } from 'src/domain/todo-list/todo-list.entity';
import { WinstonLogger } from '../../application/logger/winston-logger.service';

@CommandHandler(CreateTodoItemCommand)
export class CreateTodoItemHandler implements ICommandHandler<CreateTodoItemCommand> {
    constructor(
        @Inject('TodoItemRepository') private readonly todoItemRepository: TodoItemRepository,
        @Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository,
        private readonly eventPublisher: EventPublisher,
        private readonly logger: WinstonLogger) { }

    async execute(command: CreateTodoItemCommand): Promise<TodoItem> {
        const { todoListId, title, description, priority } = command;

        let todoList: TodoList;

        try {
            todoList = await this.todoListRepository.findById(todoListId);
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.logger.error(`TodoList with ID ${todoListId} not found`, error.stack);
                throw error;
            } else {
                this.logger.error(`Error occurred: ${error.message}`, error.stack);
                throw new BadRequestException(error.message);
            }
        }

        const todoItem = new TodoItem(null, todoListId, title, description, priority);

        let createdTodoItem: TodoItem;

        try {
            createdTodoItem = await this.todoItemRepository.create(todoItem);
        } catch (error) {
            this.logger.error(`Failed to create todoitem: ${error.message}`, error.stack);
            throw new BadRequestException(error.message);
        }

        const todoItemEventPublisher = new TodoItem(createdTodoItem._id, todoListId, title, description, priority);
        const todoItemEvent = this.eventPublisher.mergeObjectContext(todoItemEventPublisher);
        todoItemEvent.createTodoItem();
        todoItemEvent.commit();

        const todoListContext = this.eventPublisher.mergeObjectContext(todoList);
        todoListContext.addTodoItem(createdTodoItem);
        try {
            await this.todoListRepository.update(todoListId, todoListContext);
        } catch (error) {
            this.logger.error(`Error updating todolist with ID ${todoListId}: ${error.message}`, error.stack);
            throw new BadRequestException(error.message);
        }

        todoListContext.commit();

        return createdTodoItem;
    }
}

@CommandHandler(UpdateTodoItemCommand)
export class UpdateTodoItemHandler implements ICommandHandler<UpdateTodoItemCommand> {
    constructor(
        @Inject('TodoItemRepository') private readonly todoItemRepository: TodoItemRepository,
        private readonly eventPublisher: EventPublisher,
        private readonly logger: WinstonLogger) { }

    async execute(command: UpdateTodoItemCommand): Promise<TodoItem | null> {
        const { id, updateData } = command;

        let todoItem: TodoItem | null;

        try {
            todoItem = await this.todoItemRepository.findById(id);
            await this.todoItemRepository.update(id, updateData);
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.logger.error(`TodoItem with ID ${id} not found`, error.stack);
                throw error;
            } else {
                this.logger.error(`Error updating todoItem with ID ${id}: ${error.message}`, error.stack);
                throw new BadRequestException(error.message);
            }
        }

        const todoItemContext = this.eventPublisher.mergeObjectContext(todoItem);
        todoItemContext.updateTodoItem(updateData);
        todoItemContext.commit();

        return todoItem
    }
}

@CommandHandler(DeleteTodoItemCommand)
export class DeleteTodoItemHandler implements ICommandHandler<DeleteTodoItemCommand> {
    constructor(
        @Inject('TodoItemRepository') private readonly todoItemRepository: TodoItemRepository,
        @Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository,
        private readonly eventPublisher: EventPublisher,
        private readonly logger: WinstonLogger) { }

    async execute(command: DeleteTodoItemCommand): Promise<boolean> {
        const { id } = command;

        let todoItem: TodoItem

        try {
            todoItem = await this.todoItemRepository.findById(id);
            await this.todoItemRepository.delete(id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.logger.error(`TodoItem with ID ${id} not found`, error.stack);
                throw error;
            } else {
                this.logger.error(`Error deleting todoItem with ID ${id}: ${error.message}`, error.stack);
                throw new BadRequestException(error.message);
            }
        }

        const todoItemContext = this.eventPublisher.mergeObjectContext(todoItem);
        todoItemContext.deleteTodoItem();
        todoItemContext.commit();

        let todoList: TodoList;

        try {
            todoList = await this.todoListRepository.findById(todoItem.todoListId);
        } catch (error) {
            if (error instanceof NotFoundException) {
                this.logger.error(`TodoList with ID ${todoItem.todoListId} not found`, error.stack);
                throw error;
            } else {
                this.logger.error(`Error occurred: ${error.message}`, error.stack);
                throw new BadRequestException(error.message);
            }
        }
        todoList.todoItems = todoList.todoItems.filter(item => item._id !== id);
        const todoListUpdate = await this.todoListRepository.update(todoList._id, todoList);

        const todoListContext = this.eventPublisher.mergeObjectContext(todoList);
        todoListContext.updateTodoList(todoListUpdate);
        todoListContext.commit();

        return true;
    }
}