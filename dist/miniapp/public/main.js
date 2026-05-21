import { fetchRepos, fetchSummary } from "./api.js";
const tg = window.Telegram.WebApp;
tg.expand();
// Set Telegram theme dynamically
if (tg.colorScheme === "dark") {
  document.documentElement.style.setProperty("--tg-bg", "#1c1c1c");
  document.documentElement.style.setProperty("--tg-card-bg", "#2a2a2a");
  document.documentElement.style.setProperty("--tg-text", "#ffffff");
  document.documentElement.style.setProperty("--tg-border", "#3a3a3a");
  document.documentElement.style.setProperty("--tg-accent", "#0088cc");
}
async function renderRepos(username) {
  const container = document.getElementById("repo-container");
  if (!container) return;
  container.innerHTML = "";
  const repos = await fetchRepos(username);
  for (const repo of repos) {
    const div = document.createElement("div");
    div.className = "repo-card";
    // Skeleton placeholders while fetching summary
    div.innerHTML = `
      <h2 class="skeleton" style="width: 50%; margin-bottom: 30px">&nbsp;</h2>
      <p class="summary skeleton" style="width: 90%; margin-bottom: 10px">&nbsp;</p>
      <p class="summary skeleton" style="width: 90%; margin-bottom: 10px">&nbsp;</p>
      <p class="summary skeleton" style="width: 50%; margin-bottom: 20px">&nbsp;</p>
      <button disabled>Ask AI</button>
    `;
    container.appendChild(div);
    // Fetch summary asynchronously
    const summary = await fetchSummary(username, repo.name);
    // Replace skeleton with actual content
    div.innerHTML = `
      <h2>${repo.name} ⭐${repo.stargazers_count}</h2>
      <p class="summary">${summary}</p>
      <button onclick="askAI('${username}', '${repo.name}', this)">Ask AI</button>
    `;
  }
}
window.askAI = async function (userName, repoName, button) {
  const question = prompt(`Ask AI about ${repoName}:`);
  if (!question) return;
  button.disabled = true;
  button.classList.add("loading");
  try {
    const answer = await fetchSummary(userName, repoName, question);
    alert(answer);
  } finally {
    button.disabled = false;
    button.classList.remove("loading");
  }
};

const username = prompt("Enter the GitHub username to fetch repos for:");
if (username) {
  renderRepos(username);
} else {
  const container = document.getElementById("repo-container");
  if (container) container.innerHTML = "<p>No username provided.</p>";
}
