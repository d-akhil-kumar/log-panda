import { Module } from '@nestjs/common';
import { IngestService } from './domain/services/ingest.service';
import { IngestController } from './application/controllers/ingest.controller';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [IngestController],
  providers: [IngestService],
})
export class IngestModule {}
