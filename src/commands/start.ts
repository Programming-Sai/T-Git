import { Telegraf, Context } from "telegraf";

export default function startCommand(bot: Telegraf<Context>): void {
  bot.start((ctx: Context) => {
    const miniAppUrl = process.env.MINI_APP_URL;

    if (!miniAppUrl) {
      ctx.reply(
        "Welcome to T-Git! The Mini App is currently being set up. Please check back later.",
      );
      return;
    }

    ctx.reply("Welcome to T-Git! Click below to open the Mini App:", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Open Mini App",
              url: miniAppUrl,
            },
          ],
        ],
      },
    });
  });
}
