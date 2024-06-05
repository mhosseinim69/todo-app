import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TodoListSchema } from '../src/infrastructure/persistence/mongodb/schemas/todo-list.schema';
import { UserSchema } from '../src/infrastructure/persistence/mongodb/schemas/user.schema';
import { JwtAuthGuard } from "../src/application/authentication/auth.guard";

describe('TodoList E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        MongooseModule.forFeature([
          { name: 'TodoList', schema: TodoListSchema },
          { name: 'User', schema: UserSchema },
        ]),
      ],
    }).overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get all todo lists', async () => {
    return request(app.getHttpServer())
      .get('/todolists')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeInstanceOf(Array);
      });
  });

  it('should get a todo list by id', async () => {
    const createUserResponse = await request(app.getHttpServer())
      .post('/users/register')
      .send({ username: Math.random().toString(36).substring(2, 7), password: 'testpassword2' })
      .expect(201);

    const userId = createUserResponse.body.user.id;

    const createTodoListDto = {
      userId,
      title: 'Another Todo List',
    };

    const createTodoListResponse = await request(app.getHttpServer())
      .post('/todolists')
      .send(createTodoListDto)
      .expect(201);

    const todoListId = createTodoListResponse.body._id;

    return request(app.getHttpServer())
      .get(`/todolists/${todoListId}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveProperty('_id', todoListId);
        expect(response.body).toHaveProperty('title', 'Another Todo List');
      });
  });
});
