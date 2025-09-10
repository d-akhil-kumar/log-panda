import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LogEntity } from '../db-ingest/domain/entities/log.entity';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private dataSource: DataSource;

  constructor() {
    console.log({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5431'),
      username: process.env.DB_USERNAME || 'log_panda_db_user',
      password: process.env.DB_PASSWORD || 'ptm_pg_2024',
      database: process.env.DB_DATABASE || 'log_panda',
      entities: [LogEntity],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      extra: {
        connectionTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        max: 20,
      },
    });

    this.dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5431'),
      username: process.env.DB_USERNAME || 'log_panda_db_user',
      password: process.env.DB_PASSWORD || 'ptm_pg_2024',
      database: process.env.DB_DATABASE || 'log_panda',
      entities: [LogEntity],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      extra: {
        connectionTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        max: 20,
      },
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('Connecting to PostgreSQL database...');
      await this.dataSource.initialize();

      // Test the connection
      await this.dataSource.query('SELECT 1');

      this.logger.log('✅ Database connection established successfully');

      // Start health check interval
      this.startHealthCheck();
    } catch (error) {
      this.logger.error('❌ Database connection failed:', error.message);
      this.logger.error(
        '🛑 Shutting down application due to database connection failure',
      );
      process.exit(1);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.dataSource && this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        this.logger.log('🛑 Database connection closed');
      }
    } catch (error) {
      this.logger.error('⚠️ Error during database disconnect:', error.message);
    }
  }

  getDataSource(): DataSource {
    if (!this.dataSource) {
      this.logger.error('DataSource instance not created');
      throw new Error('DataSource instance not created. Check database configuration.');
    }
    
    if (!this.dataSource.isInitialized) {
      this.logger.error('Database connection not initialized. Module may not have started properly.');
      throw new Error('Database connection not initialized. Make sure the DatabaseService.onModuleInit() has been called.');
    }
    
    return this.dataSource;
  }

  private startHealthCheck(): void {
    setInterval(async () => {
      try {
        await this.dataSource.query('SELECT 1');
        this.logger.debug('Database health check passed');
      } catch (error) {
        this.logger.error('💀 Database health check failed:', error.message);
        this.logger.error(
          '🛑 Shutting down application due to database connection loss',
        );
        process.exit(1);
      }
    }, 30000); // Health check every 30 seconds
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error('Database connection test failed:', error.message);
      return false;
    }
  }
}
