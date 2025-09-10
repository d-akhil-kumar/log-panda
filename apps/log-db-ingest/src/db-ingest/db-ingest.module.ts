import { Module, Global } from '@nestjs/common';
import { KafkaConsumerService } from './domain/services/kafka-consumer.service';
import { LogBatchService } from './domain/services/log-batch.service';
import { LogRepository } from './domain/repositories/log.repository';
import { DatabaseService } from '../config/database.service';

@Global()
@Module({
  providers: [DatabaseService, KafkaConsumerService, LogBatchService, LogRepository],
  controllers: [],
  exports: [DatabaseService], // Export so other modules can use it
})
export class DbIngestModule {}
