import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

const logger = new Logger('main.ts:bootstrap');

async function bootstrap(): Promise<void> {
  try {
    logger.log('🚀 Starting log-db-ingest application...');

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    app.setGlobalPrefix('');

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      logger.log('🛑 Received SIGINT, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.log('🛑 Received SIGTERM, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });

    const PORT = process.env.PORT || 8080;

    await app.listen(PORT);

    logger.log(`✅ Server is running on port: ${PORT}`);
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  logger.error('💀 Unhandled error during bootstrap:', error);
  process.exit(1);
});
