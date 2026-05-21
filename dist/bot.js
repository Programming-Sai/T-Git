import express from "express";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";
dotenv.config();
import startCommand from "./commands/start.js";
import reposCommand from "./commands/repos.js";
const TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(TOKEN);
// Register commands
startCommand(bot);
reposCommand(bot);
const app = express();
app.use(express.json());
const PORT = Number(process.env.PORT || 3000);
const USE_WEBHOOK = process.env.USE_WEBHOOK === "true";
console.log("Using Webhook?: ", USE_WEBHOOK);
if (USE_WEBHOOK) {
    // Webhook mode (for production with public URL)
    const WEBHOOK_PATH = `/webhook/${TOKEN}`;
    const WEBHOOK_URL = process.env.WEBHOOK_URL; // e.g., https://your-domain.com
    app.use(WEBHOOK_PATH, (req, _res, next) => {
        console.log("Incoming webhook update:", req.body);
        next();
    });
    app.post(WEBHOOK_PATH, bot.webhookCallback("express"));
    app.listen(PORT, async () => {
        console.log(`Webhook server listening on port ${PORT}`);
        try {
            await bot.telegram.setWebhook(`${WEBHOOK_URL}${WEBHOOK_PATH}`);
            console.log("Webhook set to:", `${WEBHOOK_URL}${WEBHOOK_PATH}`);
        }
        catch (err) {
            console.error("Failed to set webhook:", err);
        }
    });
}
else {
    // Long polling mode (for local dev or simpler deployment)
    app.get("/", (_req, res) => res.send("Bot is running (long polling mode)"));
    app.listen(PORT, () => console.log(`Health check on port ${PORT}`));
    bot
        .launch()
        .then(() => console.log("Bot started with long polling"))
        .catch((err) => console.error("Bot failed to start:", err));
    // Graceful stop for long polling
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
}
