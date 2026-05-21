export async function fetchRepos(username, miniAppUrl) {
  console.log("fetching from: ", miniAppUrl);
  const res = await fetch(`${miniAppUrl}/api/repos?username=${username}`);
  return res.json();
}
export async function fetchSummary(username, repo, question) {
  const res = await fetch(
    `${miniAppUrl}/api/summary?username=${username}&repo=${repo}&question=${
      question || ""
    }`,
  );
  const data = await res.json();
  return data.summary;
}
