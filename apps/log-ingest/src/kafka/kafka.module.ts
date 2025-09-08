import { Module } from '@nestjs/common';
import { KafkaService } from './domain/services/kafka.service';

@Module({
  controllers: [],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule {}
