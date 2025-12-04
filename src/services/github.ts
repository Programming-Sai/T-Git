const BASE = "https://api.github.com";

interface GitHubUser {
  login: string;
  location?: string;
  public_repos: number;
  followers: number;
  [key: string]: any;
}

interface GitHubRepo {
  name: string;
  stargazers_count: number;
  updated_at: string;
  description?: string;
  [key: string]: any;
}

export async function getUserProfile(username: string): Promise<GitHubUser> {
  const res = await fetch(`${BASE}/users/${username}`, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      "User-Agent": "T-Git-Bot",
    },
  });
  if (!res.ok) throw new Error("User not found");
  return res.json();
}

export async function getUserRepos(username: string): Promise<GitHubRepo[]> {
  const res = await fetch(
    `${BASE}/users/${username}/repos?sort=updated&per_page=100`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        "User-Agent": "T-Git-Bot",
      },
    }
  );
  if (!res.ok) throw new Error("Repos not found");
  return res.json();
}

export async function getRepoReadme(
  username: string,
  repo: string
): Promise<string | null> {
  // Try to fetch the README
  const res = await fetch(
    `https://api.github.com/repos/${username}/${repo}/readme`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        "User-Agent": "T-Git-Bot",
        Accept: "application/vnd.github.v3.raw", // raw content
      },
    }
  );

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

  if (!repoRes.ok) return null;

  const repoData = await repoRes.json();
  return repoData.description || "No description available.";
}
