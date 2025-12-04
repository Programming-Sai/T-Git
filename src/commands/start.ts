import { Telegraf, Context } from "telegraf";

export default function startCommand(bot: Telegraf<Context>): void {
  bot.start((ctx: Context) => {
    ctx.reply("Welcome to T-Git! Click below to open the Mini App:", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Open Mini App",
              url: "https://your-deployed-miniapp-url.com", // link to your hosted frontend
            },
          ],
        ],
      },
    });
  });
}
