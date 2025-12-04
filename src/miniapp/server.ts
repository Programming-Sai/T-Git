// src/miniapp/server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { getRepoReadme, getUserRepos } from "../services/github.js";
import { summarizeRepo } from "../services/groq.js";

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from dist/miniapp/public
app.use(express.static(path.resolve(__dirname, "../../dist/miniapp/public")));

interface ReposQuery {
  username?: string;
}

interface SummaryQuery {
  username?: string;
  repo?: string;
  question?: string;
}

// Fetch repos
app.get(
  "/api/repos",
  async (req: Request<{}, {}, {}, ReposQuery>, res: Response) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: "Username required" });

    try {
      const repos = await getUserRepos(username);
      res.json(repos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: errorMessage });
    }
  }
);

// Fetch summary
app.get(
  "/api/summary",
  async (req: Request<{}, {}, {}, SummaryQuery>, res: Response) => {
    const { username, repo, question } = req.query;
    if (!username || !repo)
      return res.status(400).json({ error: "Username & repo required" });

    try {
      // get readme or fallback description
      const readme = await getRepoReadme(username, repo);
      const repos = await getUserRepos(username);
      const repoData = repos.find((r) => r.name === repo);
      const content = readme || repoData?.description || "No description";
      const summary = await summarizeRepo(content, question);
      res.json({ summary });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: errorMessage });
    }
  }
);

// Serve index.html for root path and all non-API routes
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, "../../dist/miniapp/public/index.html"));
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Mini App API running on http://0.0.0.0:${port}`);
});
