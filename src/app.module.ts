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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigService } from './application/authentication/jwt-config.service';

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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(process.env.JWT_SECRET),
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [UserSagas, TodoListSagas, TodoItemSagas, JwtConfigService],
  exports: [JwtConfigService],
})
export class AppModule { }