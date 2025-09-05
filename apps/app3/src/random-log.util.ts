type LogLevel = "INFO" | "WARN" | "ERROR";

export function randomLog(appName: string): string {
  const levels: LogLevel[] = ["INFO", "WARN", "ERROR"];
  const notificationTypes = ["Email", "SMS", "Push"];
  const userNames = ["Silvy", "Akku", "Rohan", "Kuldeep"];
  const templateIds = ["#n101", "#n204", "#n309"];

  const level = levels[Math.floor(Math.random() * levels.length)];

  const messages = {
    INFO: [
      `${getRandomValue(notificationTypes)} notification sent successfully`,
      `Notification template ${getRandomValue(templateIds)} delivered`,
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
      `Template ${getRandomValue(templateIds)} missing content`,
    ],
  };

  const msgList = messages[level];
  const message = msgList[Math.floor(Math.random() * msgList.length)];
  const timestamp = new Date().toISOString();

  return `[${timestamp}] [${appName}] [${level}] ${message}`;
}

function getRandomValue(arr: number[] | string[]): number | string {
  return arr[Math.floor(Math.random() * arr.length)];
}
