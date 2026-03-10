import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { AppModule } from './app.module';
import { LOGGER_TOKEN } from './logger/logger.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/afisha');
  app.enableCors();
  
  const logger = app.get(LOGGER_TOKEN);
  app.useLogger(logger);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);

  // Логируем старт приложения
  logger.log(`Приложение запущено по адресу: ${await app.getUrl()}`);
  logger.log(`Формат логирования: ${process.env.LOGGER_TYPE || 'dev'}`);
  logger.log(`Используется СУБД: ${process.env.DATABASE_DRIVER}`);
}

bootstrap();
