type LogLevel = "INFO" | "WARN" | "ERROR";

export function randomLog(appName: string): string {
  const levels: LogLevel[] = ["INFO", "WARN", "ERROR"];
  const amounts = [12000, 7000, 5600];
  const transactionIds = ["#t1001", "#t2401", "#t4091"];
  const userNames = ["akhil", "swarup", "ishaan", "sammed"];

  const level = levels[Math.floor(Math.random() * levels.length)];

  const messages = {
    INFO: [
      `Payment of $${getRandomValue(amounts)} processed`,
      `Transaction ID: ${getRandomValue(transactionIds)}`,
      `Refund issued successfully`,
    ],
    WARN: [
      `Payment gateway took too long to respond`,
      `Suspicious transaction detected`,
      `Retrying failed payment`,
    ],
    ERROR: [
      `Payment declined due to insufficient funds`,
      `Transaction failed for user ${getRandomValue(userNames)}`,
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
