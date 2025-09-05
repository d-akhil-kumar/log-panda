import { Injectable, Logger } from '@nestjs/common';
import { IngestLogRequestDto } from 'src/ingest/application/dtos/ingest-log-request.dto';

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);
  constructor() {}

  async ingestLog(log: IngestLogRequestDto): Promise<void> {
    const timestamp = log.timestamp || new Date().toISOString();

    const logEntry = {
      ...log,
      timestamp,
    };

    //TODO: For now, just print to console
    this.logger.log(JSON.stringify(logEntry));
  }
}
