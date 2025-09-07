import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IngestModule } from './ingest/ingest.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [IngestModule, KafkaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
