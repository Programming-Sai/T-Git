import { Telegraf, Context } from "telegraf";
import { getUserProfile } from "../services/github.js";

export default function profileCommand(bot: Telegraf<Context>): void {
  bot.command("profile", async (ctx: Context) => {
    const username = (ctx.message as any)?.text?.split(" ")[1];

    if (!username) {
      return ctx.reply("❗ Usage: /profile <github-username>");
    }

    try {
      const profile = await getUserProfile(username);

      const msg =
        `👤 *GitHub User*: ${profile.login}\n` +
        `📍 ${profile.location ?? "No location"}\n` +
        `📦 Public Repos: ${profile.public_repos}\n` +
        `👥 Followers: ${profile.followers}`;

      ctx.reply(msg, { parse_mode: "Markdown" });
    } catch (error) {
      ctx.reply("❗ User not found or error fetching data.");
    }
  });
}
