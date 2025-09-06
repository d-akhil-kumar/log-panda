import { LogLevel } from "./log-level.type";
import { LogObject } from "./log.interface";

export function randomLog(appName: string): LogObject {
  const levels: LogLevel[] = ["INFO", "WARN", "ERROR"];
  const amounts = [12000, 7000, 5600];
  const transactionIds = ["#t1001", "#t2401", "#t4091"];
  const userNames = ["akhil", "swarup", "ishaan", "sammed"];

  const level = getRandomValue(levels) as LogLevel;
  const transactionId = getRandomValue(transactionIds);
  const userName = getRandomValue(userNames);

  const messages = {
    INFO: [
      `Payment of $${getRandomValue(amounts)} processed`,
      `Transaction ID: ${transactionId}`,
      `Refund issued successfully`,
    ],
    WARN: [
      `Payment gateway took too long to respond`,
      `Suspicious transaction detected`,
      `Retrying failed payment`,
    ],
    ERROR: [
      `Payment declined due to insufficient funds`,
      `Transaction failed for user ${userName}`,
    ],
  };

  const message = getRandomValue(messages[level]) as string;
  const timestamp = new Date().toISOString();

  const context = {
    transactionId,
    userName,
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
