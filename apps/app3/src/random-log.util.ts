import { LogLevel } from "./log-level.type";
import { LogObject } from "./log.interface";

export function randomLog(appName: string): LogObject {
  const levels: LogLevel[] = ["INFO", "WARN", "ERROR"];
  const notificationTypes = ["Email", "SMS", "Push"];
  const userNames = ["Silvy", "Akku", "Rohan", "Kuldeep"];
  const templateIds = ["#n101", "#n204", "#n309"];

  const level = getRandomValue(levels) as LogLevel;
  const templateId = getRandomValue(templateIds);
  const userName = getRandomValue(userNames);

  const messages = {
    INFO: [
      `${getRandomValue(notificationTypes)} notification sent successfully`,
      `Notification template ${templateId} delivered`,
      `User ${getRandomValue(userNames)} received a notification`,
    ],
    WARN: [
      `${getRandomValue(notificationTypes)} notification delayed`,
      `High queue length for sending notifications`,
      `Retrying notification delivery`,
    ],
    ERROR: [
      `${getRandomValue(notificationTypes)} notification failed`,
      `Failed to deliver notification to user ${getRandomValue(userNames)}`,
      `Template ${templateId} missing content`,
    ],
  };

  const message = getRandomValue(messages[level]) as string;
  const timestamp = new Date().toISOString();

  const context = {
    userName,
    templateId,
  };

  return {
    appName,
    level,
    message,
    timestamp,
    context,
  };
}

function getRandomValue(
  arr: number[] | string[] | LogLevel[]
): number | string | LogLevel {
  return arr[Math.floor(Math.random() * arr.length)];
}
