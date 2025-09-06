module.exports = (appName) => {
    const levels = ["INFO", "WARN", "ERROR"];
    const messages = [
        "User logged in",
        "Payment processed",
        "Database connection failed",
        "Cache miss",
        "Request timed out",
        "Order placed successfully"
    ];
    const transactionIds = ["#t1001", "#t2401", "#t4091"];
    const userNames = ["Ajay", "Anusha", "Abhilash"];

    const level = getRandomValue(levels);
    const message = getRandomValue(messages);
    const timestamp = new Date().toISOString();
    const transactionId = getRandomValue(transactionIds);
    const userName = getRandomValue(userNames);

    const context = {
        transactionId,
        userName
    };

    return {
        appName,
        level,
        message,
        timestamp,
        context
    };
};

function getRandomValue(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}