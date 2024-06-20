import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TodoListService } from '../../application/todo-list/todo-list.service';
import { MongoTodoListRepository } from '../../infrastructure/persistence/mongodb/todo-list.repository';
import { TodoListSchema } from '../../infrastructure/persistence/mongodb/schemas/todo-list.schema';
import { TodoListController } from '../../interface/rest/todo-list.controller';
import { CreateTodoListHandler, UpdateTodoListHandler, DeleteTodoListHandler } from '../../application/handlers/todo-list.command.handlers';
import { GetTodoListByIdHandler, GetAllTodoListsHandler } from '../../application/handlers/todo-list.query.handlers';
import { TodoListSagas } from '../../application/sagas/todo-list.saga';
import { UserModule } from '../user/user.module';
import { WinstonLogger } from '../../application/logger/winston-logger.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'TodoList', schema: TodoListSchema }]),
        CqrsModule,
        UserModule
    ],
    providers: [
        TodoListService,
        CreateTodoListHandler,
        UpdateTodoListHandler,
        DeleteTodoListHandler,
        GetTodoListByIdHandler,
        GetAllTodoListsHandler,
        TodoListSagas,
        { provide: 'TodoListRepository', useClass: MongoTodoListRepository },
        WinstonLogger
    ],
    controllers: [TodoListController],
})
export class TodoListModule { }