import { Body, Controller, Post } from '@nestjs/common';
import { IngestService } from '../../domain/services/ingest.service';
import { IngestLogRequestDto } from '../dtos/ingest-log-request.dto';
import { IngestLogResponseDto } from '../dtos/ingest-log-response.dto';

@Controller('/ingest')
export class IngestController {
  constructor(private readonly ingestService: IngestService) {}

  @Post()
  async ingestLog(
    @Body() ingestLogRequestDto: IngestLogRequestDto,
  ): Promise<IngestLogResponseDto> {
    this.ingestService.ingestLog(ingestLogRequestDto);
    return { status: 'OK', receivedAt: new Date().toISOString() };
  }
}
