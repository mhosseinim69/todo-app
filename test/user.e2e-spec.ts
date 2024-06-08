import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../src/infrastructure/persistence/mongodb/schemas/user.schema';
import { JwtAuthGuard } from "../src/application/authentication/auth.guard";

describe('User E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        MongooseModule.forFeature([
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

  it('should get all users', async () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((response) => {
        expect(response.body).toBeInstanceOf(Array);
      });
  });

  it('should get a user by id', async () => {

    const createUserDto = {
      username: Math.random().toString(36).substring(2, 7),
      password: 'testpassword2'
    };

    const createUserResponse = await request(app.getHttpServer())
      .post('/users/register')
      .send(createUserDto)
      .expect(201);

    const userId = createUserResponse.body.user.id

    return request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveProperty('id', userId);
        expect(response.body).toHaveProperty('username', createUserDto.username);
      });
  });
});
