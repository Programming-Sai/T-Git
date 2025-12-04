// src/bot.ts  — webhook mode
import express from "express";
import { Telegraf } from "telegraf";
// import the package object so we can access webhookCallback at runtime
import * as telegrafPkg from "telegraf";
// runtime-safe access to webhookCallback (avoids TS typing issues)
const webhookCallback = (telegrafPkg as any).webhookCallback;
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

// register commands/handlers (same as before)
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

// mount telegraf webhook callback at /webhook/:token
app.post(`/webhook/${TOKEN}`, (req, res) => {
  webhookCallback(bot, "http")(req as any, res as any);
});

// health endpoint
app.get("/", (_req, res) => res.send("T-Git Bot (webhook) alive"));

const PORT = Number(process.env.PORT || 3000);
const WEBHOOK_URL =
  process.env.WEBHOOK_URL || `http://localhost:${PORT}/webhook/${TOKEN}`; // set this to https://<your-host>/webhook/<TOKEN> on Render

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Webhook server listening on http://0.0.0.0:${PORT}`);
  if (WEBHOOK_URL) {
    try {
      await bot.telegram.setWebhook(WEBHOOK_URL);
      console.log("Webhook set to:", WEBHOOK_URL);
    } catch (err) {
      console.error("Failed to set webhook automatically:", err);
    }
  } else {
    console.log(
      "WEBHOOK_URL not set — remember to set Telegram webhook to /webhook/<TOKEN>"
    );
  }
});

// no bot.launch() — webhook mode only
