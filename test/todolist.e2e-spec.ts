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

  it('should create a todo list', async () => {
    const createUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send({ username: 'testuser', password: 'testpassword' })
      .expect(201);

    const userId = createUserResponse.body.id;

    const createTodoListDto = {
      userId,
      title: 'My Todo List',
    };

    return request(app.getHttpServer())
      .post('/todolists')
      .send(createTodoListDto)
      .expect(201)
      .expect((response) => {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('title', 'My Todo List');
        expect(response.body).toHaveProperty('userId', userId);
      });
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
      .post('/users')
      .send({ username: 'testuser2', password: 'testpassword2' })
      .expect(201);

    const userId = createUserResponse.body.id;

    const createTodoListDto = {
      userId,
      title: 'Another Todo List',
    };

    const createTodoListResponse = await request(app.getHttpServer())
      .post('/todolists')
      .send(createTodoListDto)
      .expect(201);

    const todoListId = createTodoListResponse.body.id;

    return request(app.getHttpServer())
      .get(`/todolists/${todoListId}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveProperty('id', todoListId);
        expect(response.body).toHaveProperty('title', 'Another Todo List');
      });
  });

  it('should update a todo list', async () => {
    const createUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send({ username: 'testuser3', password: 'testpassword3' })
      .expect(201);

    const userId = createUserResponse.body.id;

    const createTodoListDto = {
      userId,
      title: 'Todo List to Update',
    };

    const createTodoListResponse = await request(app.getHttpServer())
      .post('/todolists')
      .send(createTodoListDto)
      .expect(201);

    const todoListId = createTodoListResponse.body.id;

    const updateTodoListDto = {
      title: 'Updated Todo List Title',
    };

    return request(app.getHttpServer())
      .patch(`/todolists/${todoListId}`)
      .send(updateTodoListDto)
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveProperty('id', todoListId);
        expect(response.body).toHaveProperty('title', 'Updated Todo List Title');
      });
  });

  it('should delete a todo list', async () => {
    const createUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send({ username: 'testuser4', password: 'testpassword4' })
      .expect(201);

    const userId = createUserResponse.body.id;

    const createTodoListDto = {
      userId,
      title: 'Todo List to Delete',
    };

    const createTodoListResponse = await request(app.getHttpServer())
      .post('/todolists')
      .send(createTodoListDto)
      .expect(201);

    const todoListId = createTodoListResponse.body.id;

    return request(app.getHttpServer())
      .delete(`/todolists/${todoListId}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveProperty('message', 'TodoList deleted successfully');
      });
  });
});
