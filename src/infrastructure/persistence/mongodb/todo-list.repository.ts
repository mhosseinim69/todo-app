import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TodoListRepository } from 'src/domain/todo-list/todo-list.repository.interface';
import { TodoListMapper } from './todo-list.mapper';
import { TodoListDocument } from './schemas/todo-list.schema';
import { TodoList } from '../../../domain/todo-list/todo-list.entity';

@Injectable()
export class MongoTodoListRepository implements TodoListRepository {
    constructor(@InjectModel('TodoList') private todoListModel: Model<TodoListDocument>) { }

    async findById(id: string): Promise<TodoList | null> {
        const todoListDocument = await this.todoListModel.findById(id).populate('todoItems').exec();
        if (!todoListDocument) {
            throw new NotFoundException(`TodoList with id ${id} not found`);
        }
        return TodoListMapper.toDomain(todoListDocument);
    }

    async findAll(): Promise<TodoList[]> {
        const todoListDocuments = await this.todoListModel.find().populate('todoItems').exec();
        return todoListDocuments.map(TodoListMapper.toDomain);
    }

    async create(todoList: TodoList): Promise<TodoList> {
        const todoListDocument = new this.todoListModel(TodoListMapper.toPersistence(todoList));
        const createdTodoList = await todoListDocument.save();
        return TodoListMapper.toDomain(createdTodoList);
    }

    async update(id: string, todoList: TodoList): Promise<TodoList | null> {
        const updatedTodoList = await this.todoListModel.findByIdAndUpdate(
            id,
            todoList,
            { new: true },
        ).exec();

        return updatedTodoList ? TodoListMapper.toDomain(updatedTodoList) : null;
    }

    async delete(id: string): Promise<void> {
        await this.todoListModel.findByIdAndDelete(id).exec();
    }
}