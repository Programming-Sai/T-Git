import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

import startCommand from "./commands/start.js";
import profileCommand from "./commands/profile.js";
import reposCommand from "./commands/repos.js";
import summaryCommand from "./services/summary.js";

const bot = new Telegraf(process.env.BOT_TOKEN!);

// register commands
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

bot.launch();
console.log("🤖 T-Git Bot running...");
