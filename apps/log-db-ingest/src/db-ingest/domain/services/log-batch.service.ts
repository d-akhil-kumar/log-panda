import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { LogRepository } from '../repositories/log.repository';
import { IngestLogRequest } from '../interfaces/log.interface';

@Injectable()
export class LogBatchService implements OnModuleDestroy {
  private readonly logger = new Logger(LogBatchService.name);
  private readonly batch: IngestLogRequest[] = [];
  private readonly BATCH_SIZE = 50;
  private readonly BATCH_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes in milliseconds
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(private readonly logRepository: LogRepository) {}

  async addLogToBatch(logData: IngestLogRequest): Promise<void> {
    this.batch.push(logData);
    this.logger.debug(`Added log to batch. Current batch size: ${this.batch.length}`);

    // Start timer if this is the first log in the batch
    if (this.batch.length === 1) {
      this.startBatchTimer();
    }

    // Process batch if it reaches the batch size
    if (this.batch.length >= this.BATCH_SIZE) {
      await this.processBatch();
    }
  }

  private startBatchTimer(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(async () => {
      this.logger.log('Batch timeout reached, processing current batch');
      await this.processBatch();
    }, this.BATCH_TIMEOUT_MS);
  }

  private async processBatch(): Promise<void> {
    if (this.batch.length === 0) {
      return;
    }

    try {
      // Clear the timer
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
        this.batchTimer = null;
      }

      const logsToProcess = [...this.batch]; // Create a copy
      this.batch.length = 0; // Clear the original batch

      this.logger.log(`Processing batch of ${logsToProcess.length} logs`);
      
      await this.logRepository.batchInsertLogs(logsToProcess);
      
      this.logger.log(`Successfully inserted ${logsToProcess.length} logs`);
    } catch (error) {
      this.logger.error('Failed to process batch:', error.message);
      // In production, you might want to implement retry logic or dead letter queue
      throw error;
    }
  }

  async flushBatch(): Promise<void> {
    if (this.batch.length > 0) {
      this.logger.log('Flushing remaining batch on shutdown');
      await this.processBatch();
    }
  }

  getBatchSize(): number {
    return this.batch.length;
  }

  async onModuleDestroy(): Promise<void> {
    try {
      // Clear any pending timer
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
        this.batchTimer = null;
      }
      
      // Flush any remaining logs
      await this.flushBatch();
      this.logger.log('LogBatchService destroyed and batch flushed');
    } catch (error) {
      this.logger.error('Error during LogBatchService destruction:', error.message);
    }
  }
}
