import { Telegraf, Context } from "telegraf";
import { getUserRepos } from "../services/github.js";

export default function reposCommand(bot: Telegraf<Context>): void {
  bot.command("repos", async (ctx: Context) => {
    const username = (ctx.message as any)?.text?.split(" ")[1];

    if (!username) {
      return ctx.reply("❗ Usage: /repos <github-username>");
    }

    try {
      await ctx.sendChatAction("typing");

      const repos = await getUserRepos(username);

      if (repos.length === 0) {
        return ctx.reply("ℹ️ No public repositories found.");
      }

      let msg = `📦 *Public Repositories for ${username}:*\n\n`;

      //   repos
      //     .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      //     .forEach((repo) => {
      repos.forEach((repo) => {
        //   repos.slice(0, 10).forEach((repo) => {
        msg += `• ${repo.name} ⭐${repo.stargazers_count}\n`;
      });

      ctx.reply(msg + `\n\nRepos Count: ${repos.length}`, {
        parse_mode: "Markdown",
      });
    } catch (error) {
      ctx.reply("❗ Unable to fetch repositories.");
    }
  });
}
