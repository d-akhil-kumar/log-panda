import { Module } from '@nestjs/common';
import { KafkaConsumerService } from './domain/services/kafka-consumer.service';

@Module({
  providers: [KafkaConsumerService],
  controllers: [],
})
export class DbIngestModule {}
