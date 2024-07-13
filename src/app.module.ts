import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './modules/user/user.module';
import { TodoListModule } from './modules/todo-list/todo-list.module';
import { TodoItemModule } from './modules/todo-item/todo-item.module';
import { UserSagas } from './application/sagas/user.saga';
import { TodoListSagas } from './application/sagas/todo-list.saga';
import { TodoItemSagas } from './application/sagas/todo-item.saga';
import { AuthModule } from './modules/authentication/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtConfigService } from './application/authentication/jwt-config.service';
import { WinstonLogger } from './application/logger/winston-logger.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DB_URI),
    EventEmitterModule.forRoot(),
    CqrsModule,
    UserModule,
    TodoListModule,
    TodoItemModule,
    AuthModule,
  ],
  providers: [UserSagas, TodoListSagas, TodoItemSagas, JwtConfigService, WinstonLogger],
  exports: [JwtConfigService],
})
export class AppModule { }