import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { TodoItemRepository } from '../../domain/todo-item/todo-item.repository.interface';
import { CreateTodoItemCommand, UpdateTodoItemCommand, DeleteTodoItemCommand } from '../commands/todo-item.commands';
import { TodoItem } from '../../domain/todo-item/todo-item.entity';
import { TodoListRepository } from '../../domain/todo-list/todo-list.repository.interface';
import { TodoList } from 'src/domain/todo-list/todo-list.entity';

@CommandHandler(CreateTodoItemCommand)
export class CreateTodoItemHandler implements ICommandHandler<CreateTodoItemCommand> {
    constructor(
        @Inject('TodoItemRepository') private readonly todoItemRepository: TodoItemRepository,
        @Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository,
        private readonly eventPublisher: EventPublisher,) { }

    async execute(command: CreateTodoItemCommand): Promise<TodoItem> {
        const { todoListId, title, description, priority } = command;

        let todoList: TodoList;

        try {
            todoList = await this.todoListRepository.findById(todoListId);
            if (!todoList) {
                throw new NotFoundException(`TodoList with id ${todoListId} not found`);
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }

        const todoItem = new TodoItem(null, todoListId, title, description, priority);
        const todoItemContext = this.eventPublisher.mergeObjectContext(todoItem);

        let createdTodoItem: TodoItem;

        try {
            createdTodoItem = await this.todoItemRepository.create(todoItemContext);
        } catch (error) {
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
        private readonly eventPublisher: EventPublisher) { }

    async execute(command: UpdateTodoItemCommand): Promise<TodoItem | null> {
        const { id, updateData } = command;

        let todoItem: TodoItem | null;

        try {
            todoItem = await this.todoItemRepository.findById(id);
            if (!todoItem) {
                throw new NotFoundException(`TodoList with id ${id} not found`);
            }
            await this.todoItemRepository.update(id, updateData);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            } else {
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
        private readonly eventPublisher: EventPublisher) { }

    async execute(command: DeleteTodoItemCommand): Promise<boolean> {
        const { id } = command;

        let todoItem: TodoItem

        try {
            todoItem = await this.todoItemRepository.findById(id);
            if (!todoItem) {
                throw new NotFoundException(`TodoItem with id ${id} not found`);
            }
            await this.todoItemRepository.delete(id);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            } else {
                throw new BadRequestException(error.message);
            }
        }

        const todoItemContext = this.eventPublisher.mergeObjectContext(todoItem);
        todoItemContext.deleteTodoItem();
        todoItemContext.commit();

        let todoList: TodoList;

        try {
            todoList = await this.todoListRepository.findById(todoItem.todoListId);
            if (!todoList) {
                throw new NotFoundException(`TodoList with id ${todoItem.todoListId} not found`);
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            } else {
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