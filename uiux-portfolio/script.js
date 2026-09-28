const projects = {
  business: {
    type: "UI/UX CASE STUDY · BUSINESS SAAS",
    title: "Business Dashboard",
    problem: "Business owners may need to switch between finance, sales, customer, product, and cash flow information to understand their business performance. Scattered information can make daily monitoring less convenient.",
    solution: "Design a centralized business dashboard that presents key performance indicators first, then provides clear navigation to detailed business modules.",
    built: "Dashboard layout, KPI cards, finance and revenue views, expense tracking, cash flow, sales, customer and product sections, global search, responsive components, and light/dark themes.",
    evidence: "An interactive portfolio prototype using illustrative sample data. The project demonstrates interface structure and navigation concepts; it does not represent a deployed business system or verified business results.",
    demo: "projects/business-dashboard/index.html"
  },
  web3: {
    type: "UI/UX CASE STUDY · WEB3",
    title: "Web3 Token Tracker",
    problem: "Token discovery interfaces can present too much information at once. Users may need to scan launch details, trading volume, market capitalization, and token status before deciding which items deserve attention.",
    solution: "Create a focused tracker concept that organizes token information into scannable cards, clear status indicators, and filtering controls.",
    built: "Token listing cards, volume and market-cap displays, launch information, token status, filtering interactions, visual hierarchy, responsive layouts, and interface states.",
    evidence: "An interactive tracker prototype with fictional sample market data. It is not connected to live blockchain data and does not provide investment signals.",
    demo: "projects/web3-tracker/index.html"
  },
  game: {
    type: "UI/UX CASE STUDY · GAME INTERFACE",
    title: "Fantasy RPG Game Interface",
    problem: "Players need to access character information, inventory, quests, and gameplay controls without losing track of important information or navigating unnecessarily complex menus.",
    solution: "Structure a fantasy RPG interface around clear information hierarchy, distinct panels, and accessible navigation for common player actions.",
    built: "Game HUD concept, character selection, inventory panel, character information, quest interface, navigation, interactive states, and responsive presentation.",
    evidence: "An interactive fantasy RPG UI concept with simulated actions. It demonstrates interface and interaction design, not a fully developed game or tested gameplay experience.",
    demo: "projects/game-interface/index.html"
  }
};

const modal = document.getElementById("projectModal");
const body = document.body;

function openProject(key) {
  const p = projects[key];
  if (!p || !modal) return;

  document.getElementById("modalType").textContent = p.type;
  document.getElementById("modalTitle").textContent = p.title;
  document.getElementById("modalProblem").textContent = p.problem;
  document.getElementById("modalSolution").textContent = p.solution;
  document.getElementById("modalBuilt").textContent = p.built;
  document.getElementById("modalEvidence").textContent = p.evidence;

  const demoButton = document.getElementById("modalDemo");
  demoButton.href = p.demo;
  demoButton.style.display =
    p.demo && p.demo !== "#" ? "inline-flex" : "none";

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  body.style.overflow = "hidden";
}

function closeProject() {
  if (!modal) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  body.style.overflow = "";
}

document.querySelectorAll(".project-open").forEach((button) => {
  button.addEventListener("click", () => {
    openProject(button.dataset.project);
  });
});

document.querySelectorAll("[data-close]").forEach((element) => {
  element.addEventListener("click", closeProject);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeProject();
});

const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("wandiPortfolioTheme");

if (savedTheme === "dark") {
  body.classList.add("dark");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark");

    localStorage.setItem(
      "wandiPortfolioTheme",
      body.classList.contains("dark") ? "dark" : "light"
    );
  });
}
