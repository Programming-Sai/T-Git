import { Telegraf, Context } from "telegraf";
import { getUserRepos } from "../services/github.js";

function escapeHTML(text: string) {
  return text.replace(/[&<>]/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
    }
    return char;
  });
}

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

      let msg = `<b>📦 Public Repositories for ${escapeHTML(
        username
      )}:</b>\n\n`;

      repos.forEach((repo) => {
        msg += `• ${escapeHTML(repo.name)} ⭐${repo.stargazers_count}\n`;
      });

      ctx.reply(msg + `\n\nRepos Count: ${repos.length}`, {
        parse_mode: "HTML",
      });
    } catch (error) {
      ctx.reply("❗ Unable to fetch repositories.");
    }
  });
}
