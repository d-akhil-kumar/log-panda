import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';
import { LogBatchService } from './log-batch.service';
import { IngestLogRequest } from '../interfaces/log.interface';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private static readonly CLIENT_ID = 'log-db-ingest-app';
  private static readonly BROKERS = ['log-ingest-kafka:9092'];
  private static readonly CONSUMER_GROUP_ID = 'log-db-ingest-consumer-group-id';
  private static readonly TOPIC = 'log-ingest-topic';

  private readonly kafka: Kafka;
  private readonly consumer: Consumer;

  constructor(private readonly logBatchService: LogBatchService) {
    this.kafka = new Kafka({
      clientId: KafkaConsumerService.CLIENT_ID,
      brokers: KafkaConsumerService.BROKERS,
    });

    this.consumer = this.kafka.consumer({
      //we dont have to mention this before hand to kafka
      //this will get resgistered for a unique groupId from the consumer side
      groupId: KafkaConsumerService.CONSUMER_GROUP_ID,
      allowAutoTopicCreation: false,
    });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({
        topic: KafkaConsumerService.TOPIC,

        //kafka marks the offset for a groupId
        //for an existing group, if below is set true then start consuming them
        //if set to false, then only consume the new message that will come from the start of this log-db-ingest app
        //and dont consume those which we present earlier
        fromBeginning: true,
      });

      await this.consumer.run({
        eachMessage: async ({ partition, message }) => {
          try {
            const msg = message.value?.toString();
            this.logger.debug(`Received message (p${partition}): ${msg}`);
            
            if (msg) {
              const logData: IngestLogRequest = JSON.parse(msg);
              await this.logBatchService.addLogToBatch(logData);
            }
          } catch (error) {
            this.logger.error(`Error processing message (p${partition}):`, error.message);
          }
        },
      });

      this.logger.log('✅ Kafka connected');
    } catch (err) {
      this.logger.error('❌ Kafka connection failed:', err.message);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    try {
      await this.consumer.disconnect();
      this.logger.log('🛑 Disconnected from Kafka');
    } catch (error) {
      this.logger.error('⚠️ Error during Kafka disconnect:', error.message);
    }
  }
}
