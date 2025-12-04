# T-Git

T-Git is a Telegram-integrated developer assistant that allows you to view your GitHub repositories, fetch summaries of repo contents, and interact with an AI-powered assistant for questions related to your code. The project consists of:

1. **Telegram Bot** (Node.js + Telegraf)
2. **Mini App Backend** (Node.js/Express)
3. **Mini App Frontend** (HTML/JS/CSS)

---

## Features

- Fetch GitHub user repositories and summaries.
- Ask AI questions about a repository’s content.
- Skeleton loading states for the web interface.
- Telegram typing indicator while fetching AI responses.
- Dark/light theme detection for Telegram WebApp.

---

## Project Structure

```

T-Git/
├─ src/
│   ├─ bot.js             # Telegram bot entry
│   ├─ miniapp/
│   │   ├─ server.js      # Mini app backend
│   │   └─ public/        # Mini app frontend (index.html, main.js, styles.css)
│   └─ services/          # Shared services (GitHub, Groq, summaries)
├─ package.json
├─ .env                   # Environment variables
└─ README.md

```

---

## Setup

1. Clone the repo:

```bash
git clone https://github.com/<your-username>/T-Git.git
cd T-Git
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with your credentials:

```
GITHUB_TOKEN=<your_github_token>
TELEGRAM_BOT_TOKEN=<your_telegram_bot_token>
GROQ_TOKEN=<your_groq_token>
PORT=4000
```

---

## Running

### Mini App (Frontend + Backend)

```bash
npm run mini
```

- Access in browser: `http://localhost:4000`

### Telegram Bot

```bash
npm start
```

### Run Both Together

```bash
npm run start:all
```

---

### Telegram Bot Usage

1. Start the bot on Telegram: `/start`
2. The bot will greet you and provide a button to open the Mini App.
3. Use commands like:
   - `/summary <github-username> <repo-name>` – get a summary of a GitHub repo.
4. While fetching AI responses, the bot will show the typing indicator in the chat.

---

### Mini App Usage

1. Open via the Telegram button or directly in your browser.
2. Enter a GitHub username to load repositories.
3. Click **Ask AI** on a repo card to ask questions about the repo.
4. Skeleton loaders will display while fetching data.

---

## Deployment on Render

1. Push the repo to GitHub.
2. Create a new Web Service on Render.
3. Connect your GitHub repo.
4. Node environment:

   - Build Command: `npm install`
   - Start Command: `npm run start:all`

5. Add environment variables in Render Dashboard.
6. Deploy and test both the bot and the mini app frontend.

---

## Notes

- Telegram typing indicator is used to improve UX while fetching AI responses.
- Mini app frontend uses skeleton loaders while fetching summaries.
- AI requests use Groq’s LLM; rate limits may apply.
- Dark/light theme is automatically detected in Telegram WebApp.
