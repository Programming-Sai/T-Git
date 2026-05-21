import { getUserProfile } from "../services/github.js";
export default function profileCommand(bot) {
    bot.command("profile", async (ctx) => {
        const username = ctx.message?.text?.split(" ")[1];
        if (!username) {
            return ctx.reply("❗ Usage: /profile <github-username>");
        }
        try {
            const profile = await getUserProfile(username);
            const msg = `👤 *GitHub User*: ${profile.login}\n` +
                `📍 ${profile.location ?? "No location"}\n` +
                `📦 Public Repos: ${profile.public_repos}\n` +
                `👥 Followers: ${profile.followers}`;
            ctx.reply(msg, { parse_mode: "Markdown" });
        }
        catch (error) {
            ctx.reply("❗ User not found or error fetching data.");
        }
    });
}
