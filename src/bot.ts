import express from "express";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

import startCommand from "./commands/start.js";
import reposCommand from "./commands/repos.js";

const TOKEN = process.env.BOT_TOKEN!;
const bot = new Telegraf(TOKEN);

// Register commands
startCommand(bot);
reposCommand(bot);

const app = express();
app.use(express.json());

const WEBHOOK_PATH = `/webhook/${TOKEN}`;
const WEBHOOK_URL = `https://t-git.onrender.com${WEBHOOK_PATH}`;

// Optional logging
app.use(WEBHOOK_PATH, (req, _res, next) => {
  console.log("Incoming update:", req.body);
  next();
});

// Telegram webhook endpoint
app.post(WEBHOOK_PATH, bot.webhookCallback("express"));

// Health check
app.get("/", (_req, res) => res.send("Bot alive"));

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);

  try {
    await bot.telegram.setWebhook(WEBHOOK_URL);
    console.log("Webhook set to:", WEBHOOK_URL);
  } catch (err) {
    console.error("Failed to set webhook:", err);
  }
});
