const express = require('express')
const randomLog = require('./random-log.util')

const app = express()
const PORT = process.env.PORT || 3000
const GENERATE_LOGS_TIME_SECONDS = process.env.GENERATE_LOGS_TIME_SECONDS || 1
const APP_NAME = process.env.APP_NAME || 'app1'

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' })
})


setInterval(() => {
    const logMessage = randomLog(APP_NAME);

    //TODO: publish this log to kafka
    console.log(logMessage);
}, GENERATE_LOGS_TIME_SECONDS * 1000);



app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`)
})