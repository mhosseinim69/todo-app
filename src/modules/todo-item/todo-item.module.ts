import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { TodoItemService } from '../../application/todo-item/todo-item.service';
import { MongoTodoItemRepository } from '../../infrastructure/persistence/mongodb/todo-item.repository';
import { TodoItemSchema } from '../../infrastructure/persistence/mongodb/schemas/todo-item.schema';
import { TodoItemController } from '../../interface/rest/todo-item.controller';
import { CreateTodoItemHandler, UpdateTodoItemHandler, DeleteTodoItemHandler } from '../../application/handlers/todo-itemcommand.handlers';
import { GetTodoItemByIdHandler, GetAllTodoItemsHandler } from '../../application/handlers/todo-item.query.handlers';
import { TodoItemSagas } from '../../application/sagas/todo-item.saga';
import { TodoListSchema } from '../../infrastructure/persistence/mongodb/schemas/todo-list.schema';
import { MongoTodoListRepository } from '../../infrastructure/persistence/mongodb/todo-list.repository';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'TodoItem', schema: TodoItemSchema }]),
        MongooseModule.forFeature([{ name: 'TodoList', schema: TodoListSchema }]),
        CqrsModule,
    ],
    providers: [
        TodoItemService,
        CreateTodoItemHandler,
        UpdateTodoItemHandler,
        DeleteTodoItemHandler,
        GetTodoItemByIdHandler,
        GetAllTodoItemsHandler,
        TodoItemSagas,
        { provide: 'TodoItemRepository', useClass: MongoTodoItemRepository },
        { provide: 'TodoListRepository', useClass: MongoTodoListRepository },
    ],
    controllers: [TodoItemController],
})
export class TodoItemModule { }