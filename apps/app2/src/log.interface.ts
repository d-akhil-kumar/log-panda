import { LogLevel } from "./log-level.type";

export interface LogObject {
  appName: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  context: Record<string, any>;
}
