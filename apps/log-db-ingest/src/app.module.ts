import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbIngestModule } from './db-ingest/db-ingest.module';

@Module({
  imports: [DbIngestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
