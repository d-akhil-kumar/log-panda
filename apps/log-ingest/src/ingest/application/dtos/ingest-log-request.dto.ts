import {
  IsString,
  IsOptional,
  IsISO8601,
  IsObject,
  IsEnum,
} from 'class-validator';
import { LogLevel } from 'src/ingest/domain/enums/log-level.enum';

export class IngestLogRequestDto {
  @IsString()
  appName: string;

  @IsEnum(LogLevel)
  level: LogLevel;

  @IsString()
  message: string;

  @IsISO8601({}, { message: 'timestamp must be a valid ISO8601 date string' })
  @IsOptional()
  timestamp?: string;

  @IsObject()
  @IsOptional()
  context?: Record<string, any>;
}
