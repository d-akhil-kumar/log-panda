import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseService } from './config/database.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get('/health')
  async health(): Promise<any> {
    const isDbHealthy = await this.databaseService.testConnection();

    if (!isDbHealthy) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Database connection failed',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      status: 'ok',
      message: this.appService.health(),
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/db-status')
  async databaseStatus(): Promise<any> {
    const isDbHealthy = await this.databaseService.testConnection();

    return {
      database: {
        connected: isDbHealthy,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5431',
        database: process.env.DB_DATABASE || 'log_panda',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
