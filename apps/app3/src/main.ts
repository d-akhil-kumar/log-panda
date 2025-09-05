import express, { Request, Response } from "express";
import { randomLog } from "./random-log.util";

const app = express();

const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || "App3";
const GENERATE_LOGS_TIME_SECONDS =
  process.env.GENERATE_LOGS_TIME_SECONDS || "2";

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

setInterval(() => {
  const logMessage = randomLog(APP_NAME);

  //TODO: publish this log to kafka
  console.log(logMessage);
}, parseInt(GENERATE_LOGS_TIME_SECONDS) * 1000);

app.listen(PORT, (): void => {
  console.log(`Server is running on port: ${PORT}`);
});
