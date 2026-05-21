import { getUserRepos, getRepoReadme } from "../services/github.js";
import { summarizeRepo } from "../services/groq.js";
export default function summaryCommand(bot) {
    bot.command("summary", async (ctx) => {
        const args = ctx.message?.text?.split(" ") || [];
        const username = args[1];
        const repoName = args[2];
        if (!username || !repoName) {
            return ctx.reply("❗ Usage: /summary <github-username> <repo-name>");
        }
        try {
            await ctx.sendChatAction("typing");
            const readme = await getRepoReadme(username, repoName);
            let content = readme;
            if (!content) {
                // fallback to repo description
                const repos = await getUserRepos(username);
                const repo = repos.find((r) => r.name.toLowerCase() === repoName.toLowerCase());
                if (!repo)
                    return ctx.reply("❗ Repo not found.");
                content = repo.description || "No description available.";
            }
            const summary = await summarizeRepo(content);
            ctx.reply(`📖 Summary for *${repoName}*:\n\n${summary}`, {
                parse_mode: "Markdown",
            });
        }
        catch (error) {
            console.error(error);
            ctx.reply("❗ Unable to generate summary.");
        }
    });
}
