import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import { randomLog } from "./random-log.util";
import { LogService } from "./log.service";

const app = express();

const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || "App2";
const GENERATE_LOGS_TIME_SECONDS =
  process.env.GENERATE_LOGS_TIME_SECONDS || "1";

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

setInterval(async () => {
  const log = randomLog(APP_NAME);
  await LogService(log);
}, parseInt(GENERATE_LOGS_TIME_SECONDS) * 1000);

app.listen(PORT, (): void => {
  console.log(`Server is running on port: ${PORT}`);
});
