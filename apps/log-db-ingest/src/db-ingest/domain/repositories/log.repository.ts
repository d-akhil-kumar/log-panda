import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LogEntity } from '../entities/log.entity';
import { IngestLogRequest } from '../interfaces/log.interface';
import { DatabaseService } from '../../../config/database.service';

@Injectable()
export class LogRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private getLogRepository(): Repository<LogEntity> {
    return this.databaseService.getDataSource().getRepository(LogEntity);
  }

  async batchInsertLogs(logs: IngestLogRequest[]): Promise<void> {
    if (logs.length === 0) {
      return;
    }

    const logEntities = logs.map(log => {
      const entity = new LogEntity();
      entity.appName = log.appName;
      entity.level = log.level;
      entity.message = log.message;
      entity.timestamp = log.timestamp ? new Date(log.timestamp) : undefined;
      entity.context = log.context;
      return entity;
    });

    await this.getLogRepository().save(logEntities);
  }

  async findLogsByAppName(appName: string): Promise<LogEntity[]> {
    return this.getLogRepository().find({
      where: { appName },
      order: { createdAt: 'DESC' },
    });
  }

  async findLogsByLevel(level: string): Promise<LogEntity[]> {
    return this.getLogRepository().find({
      where: { level: level as any },
      order: { createdAt: 'DESC' },
    });
  }
}
