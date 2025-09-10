import { LogLevel } from '../enums/log-level.enum';

export interface IngestLogRequest {
  appName: string;
  level: LogLevel;
  message: string;
  timestamp?: string;
  context?: Record<string, any>;
}
