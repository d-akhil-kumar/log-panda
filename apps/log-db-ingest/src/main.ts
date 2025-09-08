import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

const logger = new Logger('main.ts:bootstrap');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {});

  app.setGlobalPrefix('');

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT);

  logger.debug(`Server is running on port: ${PORT}`);
}

bootstrap();
