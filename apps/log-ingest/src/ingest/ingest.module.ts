import { Module } from '@nestjs/common';
import { IngestService } from './domain/services/ingest.service';
import { IngestController } from './application/controllers/ingest.controller';

@Module({
  controllers: [IngestController],
  providers: [IngestService],
})
export class IngestModule {}
