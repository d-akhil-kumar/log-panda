import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private static readonly CLIENT_ID = 'log-ingest-app';
  private static readonly BROKERS = ['log-ingest-kafka:9092'];

  private readonly logger = new Logger(KafkaService.name);
  private readonly kafka: Kafka;
  private readonly producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: KafkaService.CLIENT_ID,
      brokers: KafkaService.BROKERS,
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('✅ Kafka connected');
    } catch (err) {
      this.logger.error('❌ Kafka connection failed:', err.message);
      process.exit(1);
    }
  }

  async produce(topic: string, message: any) {
    const record: ProducerRecord = {
      topic,
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    };

    await this.producer.send(record);
    this.logger.debug(
      `Produced message to ${topic}: ${JSON.stringify(message)}`,
    );
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      this.logger.log('🛑 Disconnected from Kafka');
    } catch (error) {
      this.logger.error('⚠️ Error during Kafka disconnect:', error.message);
    }
  }
}
