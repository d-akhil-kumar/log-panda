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

    const level = levels[Math.floor(Math.random() * levels.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const timestamp = new Date().toISOString();

    return `[${timestamp}] [${appName}] [${level}] ${message}`;
}

