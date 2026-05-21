const BASE = "https://api.github.com";
export async function getUserProfile(username) {
    const res = await fetch(`${BASE}/users/${username}`, {
        headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            "User-Agent": "T-Git-Bot",
        },
    });
    if (!res.ok)
        throw new Error("User not found");
    return res.json();
}
export async function getUserRepos(username) {
    const res = await fetch(`${BASE}/users/${username}/repos?sort=updated&per_page=100`, {
        headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            "User-Agent": "T-Git-Bot",
        },
    });
    if (!res.ok)
        throw new Error("Repos not found");
    return res.json();
}
export async function getRepoReadme(username, repo) {
    // Try to fetch the README
    const res = await fetch(`https://api.github.com/repos/${username}/${repo}/readme`, {
        headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            "User-Agent": "T-Git-Bot",
            Accept: "application/vnd.github.v3.raw", // raw content
        },
    });
    if (res.ok) {
        return await res.text();
    }
    // Fallback: fetch the repo info and use description
    const repoRes = await fetch(`${BASE}/repos/${username}/${repo}`, {
        headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            "User-Agent": "T-Git-Bot",
        },
    });
    if (!repoRes.ok)
        return null;
    const repoData = await repoRes.json();
    return repoData.description || "No description available.";
}
