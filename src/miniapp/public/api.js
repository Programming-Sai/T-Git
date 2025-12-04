export async function fetchRepos(username) {
  const res = await fetch(
    `http://localhost:4000/api/repos?username=${username}`
  );
  return res.json();
}
export async function fetchSummary(username, repo, question) {
  const res = await fetch(
    `http://localhost:4000/api/summary?username=${username}&repo=${repo}&question=${
      question || ""
    }`
  );
  const data = await res.json();
  return data.summary;
}
