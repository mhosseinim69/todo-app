import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TodoItemRepository } from '../../domain/todo-item/todo-item.repository.interface';
import { CreateTodoItemCommand, UpdateTodoItemCommand, DeleteTodoItemCommand } from '../commands/todo-item.commands';
import { TodoItem } from '../../domain/todo-item/todo-item.entity';
import { TodoListRepository } from '../../domain/todo-list/todo-list.repository.interface';

@CommandHandler(CreateTodoItemCommand)
export class CreateTodoItemHandler implements ICommandHandler<CreateTodoItemCommand> {
    constructor(
        @Inject('TodoItemRepository') private readonly todoItemRepository: TodoItemRepository,
        private readonly publisher: EventPublisher,
        @Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository) { }

    async execute(command: CreateTodoItemCommand): Promise<TodoItem> {

        const { todoListId, title, description, priority } = command;
        const todoItem = new TodoItem(null, todoListId, title, description, priority);
        const todoItemContext = this.publisher.mergeObjectContext(todoItem);
        todoItemContext.createTodoItem();

        try {
            const savedTodoItem = await this.todoItemRepository.create(todoItem);
            todoItemContext._id = savedTodoItem._id;
            todoItemContext.commit();

            const todoList = await this.todoListRepository.findById(todoListId);
            if (!todoList) {
                throw new NotFoundException(`TodoList with id ${todoListId} not found`);
            }

            todoList.addTodoItem(todoItem);
            await this.todoListRepository.update(todoListId, todoList);

            return savedTodoItem;
        } catch (error) {
            throw new InternalServerErrorException('An error occurred while creating the todo item');
        }
    }
}

@CommandHandler(UpdateTodoItemCommand)
export class UpdateTodoItemHandler implements ICommandHandler<UpdateTodoItemCommand> {
    constructor(
        @Inject('TodoItemRepository') private readonly todoItemRepository: TodoItemRepository,
        private readonly publisher: EventPublisher) { }

    async execute(command: UpdateTodoItemCommand): Promise<TodoItem | null> {
        const { id, updateData } = command;

        try {
            const todoItem = await this.todoItemRepository.findById(id);
            if (todoItem) {
                Object.assign(todoItem, updateData);
                todoItem.updateTodoItem();
                await this.todoItemRepository.update(id, todoItem);
                todoItem.commit();
                return todoItem;
            } else {
                throw new NotFoundException(`TodoItem with id ${id} not found`);
            }
        } catch (error) {
            throw new InternalServerErrorException('An error occurred while updating the todo item');
        }
    }
}

@CommandHandler(DeleteTodoItemCommand)
export class DeleteTodoItemHandler implements ICommandHandler<DeleteTodoItemCommand> {
    constructor(
        @Inject('TodoItemRepository') private readonly todoItemRepository: TodoItemRepository,
        @Inject('TodoListRepository') private readonly todoListRepository: TodoListRepository,
        private readonly publisher: EventPublisher) { }

    async execute(command: DeleteTodoItemCommand): Promise<boolean> {
        const { id } = command;

        try {
            const todoItem = await this.todoItemRepository.findById(id);
            if (todoItem) {
                const todoItemContext = this.publisher.mergeObjectContext(todoItem);
                todoItemContext.deleteTodoItem();
                await this.todoItemRepository.delete(id);
                todoItemContext.commit();

                const todoList = await this.todoListRepository.findById(todoItem.todoListId);
                if (!todoList) {
                    throw new NotFoundException(`TodoList with id ${todoItem.todoListId} not found`);
                }

                todoList.todoItems = todoList.todoItems.filter(item => item._id !== id);
                await this.todoListRepository.update(todoList._id, todoList);

                return true;
            } else {
                throw new NotFoundException(`TodoItem with id ${id} not found`);
            }
        } catch (error) {
            throw new InternalServerErrorException('An error occurred while deleting the todo item');
        }
    }
}