import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from '../../application/user/user.service';
import { MongoUserRepository } from '../../infrastructure/persistence/mongodb/user.repository';
import { User, UserSchema } from '../../infrastructure/persistence/mongodb/schemas/user.schema';
import { UserController } from '../../interface/rest/user.controller';
import { CreateUserHandler, UpdateUserHandler, DeleteUserHandler } from '../../application/handlers/user.command.handlers';
import { GetUserByIdHandler, GetUserByUserNameHandler, GetAllUsersHandler } from '../../application/handlers/user.query.handlers';
import { UserSagas } from '../../application/sagas/user.saga';
import { AuthService } from '../../application/authentication/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtConfigService } from '../../application/authentication/jwt-config.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonLogger } from '../../application/logger/winston-logger.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        CqrsModule,
        JwtModule.register({}),
        ConfigModule
    ],
    providers: [
        UserService,
        { provide: 'UserRepository', useClass: MongoUserRepository },
        CreateUserHandler,
        UpdateUserHandler,
        DeleteUserHandler,
        GetUserByIdHandler,
        GetUserByUserNameHandler,
        GetAllUsersHandler,
        UserSagas,
        AuthService,
        JwtService,
        JwtConfigService,
        ConfigService,
        WinstonLogger
    ],
    exports: [UserService,
        { provide: 'UserRepository', useClass: MongoUserRepository }],
    controllers: [UserController],
})
export class UserModule { }