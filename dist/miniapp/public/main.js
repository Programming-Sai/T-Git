import { fetchRepos, fetchSummary } from "./api.js";

// ============================================
// Telegram WebApp Integration
// ============================================
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Set header color
tg.setHeaderColor("#0F0F0F");

// Apply Telegram theme colors dynamically
if (tg.themeParams) {
  const root = document.documentElement;

  if (tg.colorScheme === "dark") {
    root.style.setProperty(
      "--bg-primary",
      tg.themeParams.bg_color || "#0F0F0F",
    );
    root.style.setProperty(
      "--bg-secondary",
      tg.themeParams.secondary_bg_color || "#1C1C1E",
    );
    root.style.setProperty(
      "--text-primary",
      tg.themeParams.text_color || "#FFFFFF",
    );
    root.style.setProperty(
      "--accent-primary",
      tg.themeParams.button_color || "#33A6E0",
    );
  }
}

// ============================================
// State Management
// ============================================
const state = {
  currentUsername: null,
  currentRepo: null,
  repos: [],
  isLoading: false,
};

// ============================================
// DOM Elements
// ============================================
const elements = {
  usernameInput: document.getElementById("usernameInput"),
  clearBtn: document.getElementById("clearBtn"),
  searchBtn: document.getElementById("searchBtn"),
  errorMessage: document.getElementById("errorMessage"),
  searchSection: document.getElementById("searchSection"),
  resultsSection: document.getElementById("resultsSection"),
  emptyState: document.getElementById("emptyState"),
  repoContainer: document.getElementById("repoContainer"),
  userInfo: document.getElementById("userInfo"),
  newSearchBtn: document.getElementById("newSearchBtn"),
  aiModal: document.getElementById("aiModal"),
  modalBackdrop: document.getElementById("modalBackdrop"),
  modalClose: document.getElementById("modalClose"),
  modalTitle: document.getElementById("modalTitle"),
  aiQuestion: document.getElementById("aiQuestion"),
  aiResponse: document.getElementById("aiResponse"),
  responseContent: document.getElementById("responseContent"),
  cancelBtn: document.getElementById("cancelBtn"),
  submitQuestion: document.getElementById("submitQuestion"),
  loadingOverlay: document.getElementById("loadingOverlay"),
  loadingText: document.getElementById("loadingText"),
};

// ============================================
// Utility Functions
// ============================================
function showLoading(text = "Loading...") {
  state.isLoading = true;
  elements.loadingOverlay.classList.add("show");
  elements.loadingText.textContent = text;
}

function hideLoading() {
  state.isLoading = false;
  elements.loadingOverlay.classList.remove("show");
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorMessage.classList.add("show");
  setTimeout(() => {
    elements.errorMessage.classList.remove("show");
  }, 5000);
}

function validateUsername(username) {
  if (!username || username.trim() === "") {
    return { valid: false, error: "Please enter a username" };
  }
  if (!/^[a-zA-Z0-9-]+$/.test(username)) {
    return { valid: false, error: "Invalid username format" };
  }
  return { valid: true };
}

function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

// ============================================
// UI Rendering Functions
// ============================================
function createSkeletonCard() {
  const card = document.createElement("div");
  card.className = "repo-card skeleton-card";
  card.innerHTML = `
    <h2>
      <span class="skeleton" style="width: 60%; display: inline-block;"></span>
    </h2>
    <p class="summary">
      <span class="skeleton" style="width: 100%; display: block; margin-bottom: 8px;"></span>
      <span class="skeleton" style="width: 90%; display: block; margin-bottom: 8px;"></span>
      <span class="skeleton" style="width: 70%; display: block;"></span>
    </p>
    <div class="card-footer">
      <button disabled style="opacity: 0.3;">
        <i class="fas fa-robot"></i>
        Ask AI
      </button>
    </div>
  `;
  return card;
}

function createRepoCard(repo, username) {
  const card = document.createElement("div");
  card.className = "repo-card";
  const description = repo.description || "No description available";
  const stars = formatNumber(repo.stargazers_count || 0);

  card.innerHTML = `
    <h2>
      <span>${repo.name}</span>
      <span class="star-count">
        <i class="fas fa-star"></i>
        ${stars}
      </span>
    </h2>
    <p class="description">${description}</p>
    <p class="summary" id="summary-${repo.name}">
      <span class="skeleton" style="width: 100%; display: block; margin-bottom: 6px;"></span>
      <span class="skeleton" style="width: 85%; display: block;"></span>
    </p>
    <div class="card-footer">
      <button onclick="window.openAIModal('${username}', '${repo.name}')" id="btn-${repo.name}">
        <i class="fas fa-robot"></i>
        Ask AI
      </button>
      <a href='https://github.com/${username}/${repo.name}' id="btn-${repo.name}">
        <button class=".btn-tertiary">  
          <i class="fas fa-link"></i>
          View Repo
        </button>
      </a>
    </div>
  `;

  return card;
}

async function loadRepoSummary(
  username,
  repoName,
  summaryElement,
  buttonElement,
) {
  try {
    const summary = await fetchSummary(username, repoName);
    summaryElement.innerHTML = summary || "No summary available";
    buttonElement.disabled = false;
  } catch (error) {
    summaryElement.innerHTML = "Failed to load summary";
    console.error("Error loading summary:", error);
  }
}

async function renderRepos(username) {
  try {
    showLoading("Fetching repositories...");

    const repos = await fetchRepos(username);

    if (!Array.isArray(repos) || repos.length === 0) {
      throw new Error("No repositories found");
    }

    state.repos = repos;
    state.currentUsername = username;

    // Hide search section and empty state
    elements.searchSection.style.display = "none";
    elements.emptyState.style.display = "none";
    elements.resultsSection.style.display = "block";

    // Update user info
    elements.userInfo.innerHTML = `
      <i class="fab fa-github"></i>
      <strong>${username}</strong>
      <span>•</span>
      <span>${repos.length} repositories</span>
    `;

    // Clear container and add skeleton cards
    elements.repoContainer.innerHTML = "";

    // Create cards
    repos.forEach((repo) => {
      const card = createRepoCard(repo, username);
      elements.repoContainer.appendChild(card);
      // Load summary asynchronously
      const summaryElement = document.getElementById(`summary-${repo.name}`);
      const buttonElement = document.getElementById(`btn-${repo.name}`);
      buttonElement.disabled = true;

      loadRepoSummary(username, repo.name, summaryElement, buttonElement);
    });

    hideLoading();

    // Setup Telegram back button
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      resetToSearch();
      tg.BackButton.hide();
    });
  } catch (error) {
    hideLoading();
    showError(error.message || "Failed to fetch repositories");
    console.error("Error fetching repos:", error);
  }
}

function resetToSearch() {
  elements.resultsSection.style.display = "none";
  elements.searchSection.style.display = "block";
  elements.emptyState.style.display = "block";
  elements.usernameInput.value = "";
  elements.repoContainer.innerHTML = "";
  state.currentUsername = null;
  state.repos = [];
}

// ============================================
// Modal Functions
// ============================================
function openModal(username, repoName) {
  state.currentRepo = repoName;
  elements.modalTitle.textContent = `Ask AI about ${repoName}`;
  elements.aiQuestion.value = "";
  elements.aiResponse.style.display = "none";
  elements.responseContent.textContent = "";
  elements.aiModal.classList.add("show");

  // Focus on textarea
  setTimeout(() => {
    elements.aiQuestion.focus();
  }, 300);
}

function closeModal() {
  elements.aiModal.classList.remove("show");
  state.currentRepo = null;
}

async function submitAIQuestion() {
  const question = elements.aiQuestion.value.trim();

  if (!question) {
    showError("Please enter a question");
    return;
  }

  if (!state.currentUsername || !state.currentRepo) {
    showError("Something went wrong. Please try again.");
    return;
  }

  try {
    // Disable submit button and show loading
    elements.submitQuestion.disabled = true;
    elements.submitQuestion.classList.add("btn-loading");

    const answer = await fetchSummary(
      state.currentUsername,
      state.currentRepo,
      question,
    );

    // Show response
    elements.responseContent.textContent = answer || "No response received";
    elements.aiResponse.style.display = "block";

    // Re-enable button
    elements.submitQuestion.disabled = false;
    elements.submitQuestion.classList.remove("btn-loading");

    // Provide haptic feedback if available
    if (tg.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred("success");
    }
  } catch (error) {
    elements.submitQuestion.disabled = false;
    elements.submitQuestion.classList.remove("btn-loading");
    showError("Failed to get AI response");
    console.error("Error getting AI response:", error);

    if (tg.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred("error");
    }
  }
}

// ============================================
// Event Listeners
// ============================================

// Username input
elements.usernameInput.addEventListener("input", (e) => {
  const value = e.target.value;
  elements.clearBtn.style.display = value ? "flex" : "none";
});

elements.usernameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
});

// Clear button
elements.clearBtn.addEventListener("click", () => {
  elements.usernameInput.value = "";
  elements.clearBtn.style.display = "none";
  elements.usernameInput.focus();
});

// Search button
elements.searchBtn.addEventListener("click", handleSearch);

async function handleSearch() {
  const username = elements.usernameInput.value.trim();

  const validation = validateUsername(username);
  if (!validation.valid) {
    showError(validation.error);
    if (tg.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred("error");
    }
    return;
  }

  if (tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred("light");
  }

  await renderRepos(username);
}

// New search button
elements.newSearchBtn.addEventListener("click", () => {
  resetToSearch();
  if (tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred("light");
  }
});

// Modal controls
elements.modalBackdrop.addEventListener("click", closeModal);
elements.modalClose.addEventListener("click", closeModal);
elements.cancelBtn.addEventListener("click", closeModal);
elements.submitQuestion.addEventListener("click", submitAIQuestion);

// Allow Enter to submit question (Shift+Enter for new line)
elements.aiQuestion.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    submitAIQuestion();
  }
});

// ============================================
// Global Functions (for inline onclick handlers)
// ============================================
window.openAIModal = openModal;

// ============================================
// Initialize App
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  // Show empty state on load
  elements.emptyState.style.display = "block";

  // Auto-focus on username input
  setTimeout(() => {
    elements.usernameInput.focus();
  }, 300);

  // Notify Telegram that the app is ready
  tg.ready();
});
