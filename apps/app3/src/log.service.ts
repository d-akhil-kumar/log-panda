import axios from "axios";
import { LogObject } from "./log.interface";

const INGEST_API_URL =
  process.env.INGEST_API_URL || "http://localhost:3000/ingest";

export async function LogService(log: LogObject): Promise<void> {
  try {
    const response = await axios.post(INGEST_API_URL, log, {
      headers: { "Content-Type": "application/json" },
    });

    console.log(`✅ Log sent to ingest API:`, response.data);
  } catch (error: any) {
    console.error("❌ Failed to send log:", error.message);
  }
}
