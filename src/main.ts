import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './application/filters/http-exception.filter';
import { WinstonLogger } from './application/logger/winston-logger.service';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  if (!existsSync('logs')) {
    mkdirSync('logs');
  }
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLogger(),
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();