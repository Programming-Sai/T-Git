// src/bot.ts — webhook mode
import express from "express";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

import startCommand from "./commands/start.js";
import profileCommand from "./commands/profile.js";
import reposCommand from "./commands/repos.js";
import summaryCommand from "./services/summary.js";

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  console.error("Missing BOT_TOKEN in env — aborting");
  process.exit(1);
}

const bot = new Telegraf(TOKEN);

// register commands/handlers
startCommand(bot);
profileCommand(bot);
reposCommand(bot);
summaryCommand(bot);

bot.command("miniapp", (ctx) => {
  ctx.reply("Open Mini App", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open T-Git Mini App",
            web_app: { url: `https://513ce3ec168b.ngrok-free.app` },
          },
        ],
      ],
    },
  });
});

// --- WEBHOOK SERVER ---
const app = express();
app.use(express.json());

const WEBHOOK_PATH = `/webhook/${TOKEN}`;

// mount telegraf webhook callback correctly
app.use(
  WEBHOOK_PATH,
  (req, res, next) => {
    console.log("Incoming Telegram update:", req.body);
    next();
  },
  bot.webhookCallback("express")
);

// health endpoint
app.get("/", (_req, res) => res.send("T-Git Bot (webhook) alive"));

const PORT = Number(process.env.PORT || 3000);
const WEBHOOK_URL =
  process.env.WEBHOOK_URL || `https://t-git.onrender.com${WEBHOOK_PATH}`;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Webhook server listening on http://0.0.0.0:${PORT}`);

  try {
    await bot.telegram.setWebhook(WEBHOOK_URL);
    console.log("Webhook set to:", WEBHOOK_URL);
  } catch (err) {
    console.error("Failed to set webhook automatically:", err);
  }
});

// no bot.launch() — webhook mode only
