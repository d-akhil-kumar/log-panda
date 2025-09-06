require("dotenv").config();

const express = require("express");
const randomLog = require("./random-log.util");
const ingestLog = require("./log.service")

const app = express();
const PORT = process.env.PORT || 3000;
const GENERATE_LOGS_TIME_SECONDS = process.env.GENERATE_LOGS_TIME_SECONDS || 1;
const APP_NAME = process.env.APP_NAME || "app1";


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

setInterval(async () => {
    const log = randomLog(APP_NAME);
    await ingestLog(log)
}, GENERATE_LOGS_TIME_SECONDS * 1000);

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
