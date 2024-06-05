import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TodoItemRepository } from 'src/domain/todo-item/todo-item.repository.interface';
import { TodoItemMapper } from './todo-item.mapper';
import { TodoItemDocument } from './schemas/todo-item.schema';
import { TodoItem } from '../../../domain/todo-item/todo-item.entity';

@Injectable()
export class MongoTodoItemRepository implements TodoItemRepository {
    constructor(@InjectModel('TodoItem') private todoItemModel: Model<TodoItemDocument>) { }

    async findById(id: string): Promise<TodoItem | null> {
        const todoItemDocument = await this.todoItemModel.findById(id).exec();
        return todoItemDocument ? TodoItemMapper.toDomain(todoItemDocument) : null;
    }

    async findAll(): Promise<TodoItem[]> {
        const todoItemDocuments = await this.todoItemModel.find().exec();
        return todoItemDocuments.map(TodoItemMapper.toDomain);
    }

    async create(todoItem: TodoItem): Promise<TodoItem> {
        const todoItemDocument = new this.todoItemModel(TodoItemMapper.toPersistence(todoItem));
        const createdTodoItem = await todoItemDocument.save();
        return TodoItemMapper.toDomain(createdTodoItem);
    }

    async update(id: string, todoItem: TodoItem): Promise<TodoItem | null> {
        const updatedTodoItem = await this.todoItemModel.findByIdAndUpdate(
            id,
            todoItem,
            { new: true },
        ).exec();

        return updatedTodoItem ? TodoItemMapper.toDomain(updatedTodoItem) : null;
    }

    async delete(id: string): Promise<void> {
        await this.todoItemModel.findByIdAndDelete(id).exec();
    }
}