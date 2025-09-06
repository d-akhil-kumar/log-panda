const axios = require("axios");
const INGEST_API_URL =
    process.env.INGEST_API_URL || "http://localhost:3003/ingest";

module.exports = async (log) => {
    try {
        const response = await axios.post(INGEST_API_URL, log, {
            headers: { "Content-Type": "application/json" },
        });

        console.log(`✅ Log sent to ingest API:`, response.data);
    } catch (error) {
        console.error("❌ Failed to send log:", error.message);
    }
};
