import { Injectable } from '@nestjs/common';
import { IngestLogRequestDto } from 'src/ingest/application/dtos/ingest-log-request.dto';
import { KafkaService } from 'src/kafka/domain/kafka.service';

@Injectable()
export class IngestService {
  private static readonly TOPIC = 'log-ingest-topic';
  constructor(private readonly kafkaService: KafkaService) {}

  async ingestLog(log: IngestLogRequestDto): Promise<void> {
    const timestamp = log.timestamp || new Date().toISOString();

    const logEntry: IngestLogRequestDto = {
      ...log,
      timestamp,
    };

    await this.kafkaService.produce(IngestService.TOPIC, logEntry);
  }
}
