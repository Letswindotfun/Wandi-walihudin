document.addEventListener("DOMContentLoaded", () => {

  const sidebar = document.getElementById("sidebar");
  const mobileMenu = document.getElementById("mobileMenu");
  const content = document.querySelector(".content");

  const navItems = document.querySelectorAll(".nav-item[data-page]");

  /* Dashboard HTML asli dari index.html — disimpan sebagai template */
  const dashboardTemplate = content ? content.innerHTML : "";

  function restoreDashboardTemplate() {
    if (!content) return;
    content.innerHTML = dashboardTemplate;
  }

  /* =========================================================
     PORTOFOLIO WANDI — SETTINGS PAGE V1
     ========================================================= */

  function renderSettingsPage() {
    if (!content) return;

    content.innerHTML = `
      <div id="pwSettingsPageV1" class="pw-settings-page">

        <div class="page-header">
          <div>
            <h1>Settings</h1>
            <p>Manage your portfolio dashboard preferences.</p>
          </div>
        </div>

        <section class="pw-theme-setting">
          <div class="pw-theme-setting-title">
            Appearance
          </div>

          <div class="pw-theme-setting-desc">
            Pilih tampilan aplikasi untuk dashboard portfolio.
            Pilihan akan tersimpan otomatis di browser.
          </div>

          <div class="pw-theme-switch">

            <button
              type="button"
              class="pw-theme-option"
              data-theme="white">
              ☀️ White
            </button>

            <button
              type="button"
              class="pw-theme-option"
              data-theme="black">
              🌙 Black
            </button>

          </div>
        </section>

      </div>
    `;

    if (typeof window.applyPortfolioTheme === "function") {
      window.applyPortfolioTheme(
        localStorage.getItem("pwThemeSettingsV1") || "white"
      );
    }

    content
      .querySelectorAll(".pw-theme-option")
      .forEach(function (button) {
        button.addEventListener("click", function () {
          if (typeof window.applyPortfolioTheme === "function") {
            window.applyPortfolioTheme(button.dataset.theme);
          }
        });
      });
  }

  function openSettingsPage() {
    
  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      if (item.dataset.page === "settings") {
        openSettingsPage();
      }
    });
  });

navItems.forEach(function (item) {
      item.classList.remove("active");
    });

    const settingsNav = document.querySelector(
      '[data-page="settings"]'
    );

    if (settingsNav) {
      settingsNav.classList.add("active");
    }

    renderSettingsPage();
  }


  const modalOverlay = document.getElementById("modalOverlay");
  const modalClose = document.getElementById("modalClose");
  const modalCancel = document.getElementById("modalCancel");
  const modalSave = document.getElementById("modalSave");

  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");

  const periodSelect = document.getElementById("periodSelect");
  const quickActionButton = document.getElementById("quickActionButton");

  /*
   * ---------------------------------------------------------
   * DATA
   * ---------------------------------------------------------
   */

  const defaultTransactions = [
    {
      id: 1,
      date: "2026-09-23",
      type: "income",
      category: "Sales",
      description: "PT Nusantara",
      amount: 18400000
    },
    {
      id: 2,
      date: "2026-09-22",
      type: "expense",
      category: "Marketing",
      description: "Digital Campaign",
      amount: 4200000
    },
    {
      id: 3,
      date: "2026-09-21",
      type: "income",
      category: "Enterprise",
      description: "Enterprise Contract",
      amount: 32500000
    },
    {
      id: 4,
      date: "2026-09-20",
      type: "expense",
      category: "Operations",
      description: "Office Operations",
      amount: 8700000
    },
    {
      id: 5,
      date: "2026-09-18",
      type: "income",
      category: "Sales",
      description: "Customer Payment",
      amount: 12600000
    },
    {
      id: 6,
      date: "2026-09-17",
      type: "expense",
      category: "Payroll",
      description: "Monthly Payroll",
      amount: 18500000
    }
  ];

  let transactions =
    JSON.parse(localStorage.getItem("businessHubTransactions")) ||
    defaultTransactions;

  function saveTransactions() {
    localStorage.setItem(
      "businessHubTransactions",
      JSON.stringify(transactions)
    );
  }

  /*
   * ---------------------------------------------------------
   * MOBILE SIDEBAR
   * ---------------------------------------------------------
   */

  mobileMenu?.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  /*
   * ---------------------------------------------------------
   * NAVIGATION
   * ---------------------------------------------------------
   */

  function updateDashboardExtrasVisibility(page) {
  const extras = document.getElementById("dashboardExtras");
  if (!extras) return;

  extras.classList.toggle("pw-page-hidden", page !== "dashboard");
}

navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(nav => nav.classList.remove("active"));
      item.classList.add("active");

      const page = item.dataset.page;

    updateDashboardExtrasVisibility(page);

      if (page === "settings") {
        if (content) content.innerHTML = "";
        renderSettingsPage();
        updateBreadcrumb("Settings");
      } else if (page === "dashboard") {
        if (content) content.innerHTML = dashboardTemplate;

        if (typeof window.renderDashboard === "function") {
          window.renderDashboard();
        } else if (typeof window.renderLiveDashboard === "function") {
          window.renderLiveDashboard();
        }
      } else {
        if (content) content.innerHTML = "";
        renderModule(page);
      }

      if (window.innerWidth <= 900) {
        sidebar.classList.remove("open");
      }
    });
  });

  /*
   * ---------------------------------------------------------
   * PERIOD
   * ---------------------------------------------------------
   */

  periodSelect?.addEventListener("change", event => {

    const labels = {
      7: "Last 7 days",
      30: "Last 30 days",
      90: "Last 3 months",
      365: "Last year"
    };

    showToast(
      `Dashboard period changed to ${labels[event.target.value]}.`
    );

  });

  /*
   * ---------------------------------------------------------
   * QUICK ACTION
   * ---------------------------------------------------------
   */

  quickActionButton?.addEventListener("click", () => {
    openTransactionModal();
  });

  /*
   * ---------------------------------------------------------
   * MODULE ROUTER
   * ---------------------------------------------------------
   */

  function renderModule(page) {
    if (page === "dashboard") {
      restoreDashboardTemplate();
      if (typeof window.renderDashboard === "function") {
        window.renderDashboard();
      }
      updateBreadcrumb("Dashboard");
      return;
    }

    if (page === "settings") {
      renderSettingsPage();
      updateBreadcrumb("Settings");
      return;
    }


    const modules = {
      finance: renderFinance,
      revenue: renderRevenue,
      expenses: renderExpenses,
      cashflow: renderCashFlow
    };

    if (modules[page]) {
      modules[page]();
      updateBreadcrumb(formatPageName(page));
      return;
    }

    showToast(
      `${formatPageName(page)} module is ready for the next build stage.`
    );

  }

  /*
   * ---------------------------------------------------------
   * FINANCE OVERVIEW
   * ---------------------------------------------------------
   */

  function renderFinance() {

    const totals = calculateTotals();

    content.innerHTML = `
      <div class="page-header">
        <div>
          <p class="eyebrow">FINANCE</p>
          <h1>Financial Overview</h1>
          <p class="subtitle">
            Monitor your business financial performance and transactions.
          </p>
        </div>

        <div class="header-actions">
          <button class="primary-button" id="addIncomeButton">
            ＋ Income
          </button>

          <button class="secondary-button" id="addExpenseButton">
            ＋ Expense
          </button>
        </div>
      </div>

      <div class="kpi-grid">

        ${financeKpi(
          "Revenue",
          formatMoney(totals.income),
          "+18.4%",
          "positive",
          "↗"
        )}

        ${financeKpi(
          "Expenses",
          formatMoney(totals.expense),
          "+4.8%",
          "negative",
          "↘"
        )}

        ${financeKpi(
          "Net Profit",
          formatMoney(totals.profit),
          totals.profit >= 0 ? "+27.2%" : "-12.4%",
          totals.profit >= 0 ? "positive" : "negative",
          "✦"
        )}

        ${financeKpi(
          "Cash Balance",
          formatMoney(1240000000 + totals.profit),
          "+12.1%",
          "positive",
          "◉"
        )}

      </div>

      <div class="dashboard-grid">

        <section class="panel">

          <div class="panel-header">
            <div>
              <h2>Financial Performance</h2>
              <p>Income, expenses and net profit</p>
            </div>
          </div>

          <div class="finance-bars">

            <div class="finance-bar-row">
              <span>Revenue</span>
              <div class="finance-bar">
                <i style="width:100%"></i>
              </div>
              <strong>${formatMoney(totals.income)}</strong>
            </div>

            <div class="finance-bar-row">
              <span>Expenses</span>
              <div class="finance-bar">
                <i style="width:${expensePercent(totals)}%"></i>
              </div>
              <strong>${formatMoney(totals.expense)}</strong>
            </div>

            <div class="finance-bar-row">
              <span>Net Profit</span>
              <div class="finance-bar">
                <i style="width:${profitPercent(totals)}%"></i>
              </div>
              <strong>${formatMoney(totals.profit)}</strong>
            </div>

          </div>

        </section>

        <section class="panel">

          <div class="panel-header">
            <div>
              <h2>Financial Health</h2>
              <p>Current financial condition</p>
            </div>

            <span class="pill green">Healthy</span>
          </div>

          <div class="health-list">

            <div>
              <span>Profitability</span>
              <b class="status-good">Strong</b>
            </div>

            <div>
              <span>Cash Flow</span>
              <b class="status-good">Positive</b>
            </div>

            <div>
              <span>Expense Control</span>
              <b class="status-warning">Watch</b>
            </div>

            <div>
              <span>Budget Usage</span>
              <b class="status-good">On Track</b>
            </div>

          </div>

        </section>

      </div>

      <section class="panel finance-transactions-panel">

        <div class="panel-header">

          <div>
            <h2>Recent Transactions</h2>
            <p>Latest financial records</p>
          </div>

          <button class="link-button" id="viewTransactionsButton">
            View all →
          </button>

        </div>

        ${transactionTable(transactions.slice(0, 6))}

      </section>

      <div class="lower-grid">

        <section class="panel">

          <div class="panel-header">
            <div>
              <h2>Expense Breakdown</h2>
              <p>Where your money is going</p>
            </div>
          </div>

          ${expenseBreakdown()}

        </section>

        <section class="panel">

          <div class="panel-header">
            <div>
              <h2>Financial Alerts</h2>
              <p>Items requiring attention</p>
            </div>

            <span class="count-badge">2</span>
          </div>

          <div class="action-list">

            <div class="action-item warning">
              <div class="action-icon">!</div>

              <div class="action-content">
                <strong>Operating expenses increased</strong>
                <p>Operations are above the current budget.</p>
                <span>Today</span>
              </div>

              <button class="text-button">
                Investigate
              </button>
            </div>

            <div class="action-item opportunity">
              <div class="action-icon">✦</div>

              <div class="action-content">
                <strong>Revenue opportunity</strong>
                <p>Enterprise revenue is showing strong growth.</p>
                <span>Today</span>
              </div>

              <button class="text-button">
                Analyze
              </button>
            </div>

          </div>

        </section>

      </div>
    `;

    document
      .getElementById("addIncomeButton")
      ?.addEventListener("click", () => openTransactionModal("income"));

    document
      .getElementById("addExpenseButton")
      ?.addEventListener("click", () => openTransactionModal("expense"));

    document
      .getElementById("viewTransactionsButton")
      ?.addEventListener("click", renderTransactions);

    bindTextButtons();

  }

  /*
   * ---------------------------------------------------------
   * REVENUE
   * ---------------------------------------------------------
   */

  function renderRevenue() {

    const income = transactions.filter(
      item => item.type === "income"
    );

    const total = income.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    content.innerHTML = `
      <div class="page-header">

        <div>
          <p class="eyebrow">FINANCE / REVENUE</p>
          <h1>Revenue</h1>
          <p class="subtitle">
            Track revenue sources and business income.
          </p>
        </div>

        <button class="primary-button" id="revenueAddButton">
          ＋ Record Revenue
        </button>

      </div>

      <div class="kpi-grid">

        ${financeKpi(
          "Total Revenue",
          formatMoney(total),
          "+18.4%",
          "positive",
          "↗"
        )}

        ${financeKpi(
          "Transactions",
          income.length,
          "Active",
          "positive",
          "▣"
        )}

        ${financeKpi(
          "Average Revenue",
          formatMoney(income.length ? total / income.length : 0),
          "Per transaction",
          "positive",
          "◉"
        )}

        ${financeKpi(
          "Growth",
          "18.4%",
          "vs previous period",
          "positive",
          "✦"
        )}

      </div>

      <section class="panel">

        <div class="panel-header">

          <div>
            <h2>Revenue Transactions</h2>
            <p>All recorded income</p>
          </div>

        </div>

        ${transactionTable(income)}

      </section>
    `;

    document
      .getElementById("revenueAddButton")
      ?.addEventListener("click", () => openTransactionModal("income"));

    bindTransactionDelete();

  }

  /*
   * ---------------------------------------------------------
   * EXPENSES
   * ---------------------------------------------------------
   */

  function renderExpenses() {

    const expenses = transactions.filter(
      item => item.type === "expense"
    );

    const total = expenses.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    content.innerHTML = `
      <div class="page-header">

        <div>
          <p class="eyebrow">FINANCE / EXPENSES</p>
          <h1>Expenses</h1>
          <p class="subtitle">
            Monitor operating costs and spending categories.
          </p>
        </div>

        <button class="primary-button" id="expenseAddButton">
          ＋ Record Expense
        </button>

      </div>

      <div class="kpi-grid">

        ${financeKpi(
          "Total Expenses",
          formatMoney(total),
          "+4.8%",
          "negative",
          "↘"
        )}

        ${financeKpi(
          "Transactions",
          expenses.length,
          "Recorded",
          "positive",
          "▣"
        )}

        ${financeKpi(
          "Average Expense",
          formatMoney(expenses.length ? total / expenses.length : 0),
          "Per transaction",
          "negative",
          "◉"
        )}

        ${financeKpi(
          "Budget Usage",
          "72%",
          "Within target",
          "positive",
          "◌"
        )}

      </div>

      <div class="dashboard-grid">

        <section class="panel">

          <div class="panel-header">
            <div>
              <h2>Expense Categories</h2>
              <p>Spending distribution</p>
            </div>
          </div>

          ${expenseBreakdown()}

        </section>

        <section class="panel">

          <div class="panel-header">
            <div>
              <h2>Expense Control</h2>
              <p>Budget monitoring</p>
            </div>
          </div>

          <div class="health-list">

            <div>
              <span>Marketing</span>
              <b class="status-warning">Watch</b>
            </div>

            <div>
              <span>Operations</span>
              <b class="status-warning">Above budget</b>
            </div>

            <div>
              <span>Payroll</span>
              <b class="status-good">On track</b>
            </div>

            <div>
              <span>Technology</span>
              <b class="status-good">Healthy</b>
            </div>

          </div>

        </section>

      </div>

      <section class="panel">

        <div class="panel-header">

          <div>
            <h2>Expense Transactions</h2>
            <p>Recorded business expenses</p>
          </div>

        </div>

        ${transactionTable(expenses)}

      </section>
    `;

    document
      .getElementById("expenseAddButton")
      ?.addEventListener("click", () => openTransactionModal("expense"));

    bindTransactionDelete();

  }

  /*
   * ---------------------------------------------------------
   * CASH FLOW
   * ---------------------------------------------------------
   */

  function renderCashFlow() {

    const totals = calculateTotals();

    const net = totals.income - totals.expense;

    content.innerHTML = `
      <div class="page-header">

        <div>
          <p class="eyebrow">FINANCE / CASH FLOW</p>
          <h1>Cash Flow</h1>
          <p class="subtitle">
            Monitor cash entering and leaving the business.
          </p>
        </div>

        <button class="primary-button" id="cashAddButton">
          ＋ Transaction
        </button>

      </div>

      <div class="kpi-grid">

        ${financeKpi(
          "Cash In",
          formatMoney(totals.income),
          "+18.4%",
          "positive",
          "↗"
        )}

        ${financeKpi(
          "Cash Out",
          formatMoney(totals.expense),
          "+4.8%",
          "negative",
          "↘"
        )}

        ${financeKpi(
          "Net Cash Flow",
          formatMoney(net),
          net >= 0 ? "Positive" : "Negative",
          net >= 0 ? "positive" : "negative",
          "◉"
        )}

        ${financeKpi(
          "Cash Coverage",
          "4.2 months",
          "Estimated",
          "positive",
          "◌"
        )}

      </div>

      <section class="panel">

        <div class="panel-header">

          <div>
            <h2>Cash Flow Summary</h2>
            <p>Current period movement</p>
          </div>

          <span class="pill green">
            ${net >= 0 ? "Positive" : "Negative"}
          </span>

        </div>

        <div class="cash-flow-summary">

          <div class="cash-flow-card">
            <span>Cash In</span>
            <strong>${formatMoney(totals.income)}</strong>
            <small>Incoming cash</small>
          </div>

          <div class="cash-flow-card">
            <span>Cash Out</span>
            <strong>${formatMoney(totals.expense)}</strong>
            <small>Outgoing cash</small>
          </div>

          <div class="cash-flow-card">
            <span>Net Flow</span>
            <strong>${formatMoney(net)}</strong>
            <small>Cash movement</small>
          </div>

        </div>

      </section>

      <section class="panel">

        <div class="panel-header">
          <div>
            <h2>Cash Flow Transactions</h2>
            <p>Latest cash movements</p>
          </div>
        </div>

        ${transactionTable(transactions)}

      </section>
    `;

    document
      .getElementById("cashAddButton")
      ?.addEventListener("click", openTransactionModal);

    bindTransactionDelete();

  }

  /*
   * ---------------------------------------------------------
   * TRANSACTIONS
   * ---------------------------------------------------------
   */

  function renderTransactions() {

    content.innerHTML = `
      <div class="page-header">

        <div>
          <p class="eyebrow">FINANCE / TRANSACTIONS</p>
          <h1>Transactions</h1>
          <p class="subtitle">
            Manage all financial records in one place.
          </p>
        </div>

        <button class="primary-button" id="transactionAddButton">
          ＋ Add Transaction
        </button>

      </div>

      <section class="panel">

        <div class="transaction-toolbar">

          <input
            class="finance-search"
            id="transactionSearch"
            type="search"
            placeholder="Search transactions..."
          />

          <select id="transactionFilter">
            <option value="all">All transactions</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select id="categoryFilter">
            <option value="all">All categories</option>
            ${getCategories()
              .map(category => `<option>${category}</option>`)
              .join("")}
          </select>

        </div>

        <div id="transactionTableContainer">
          ${transactionTable(transactions)}
        </div>

      </section>
    `;

    document
      .getElementById("transactionAddButton")
      ?.addEventListener("click", openTransactionModal);

    document
      .getElementById("transactionSearch")
      ?.addEventListener("input", filterTransactions);

    document
      .getElementById("transactionFilter")
      ?.addEventListener("change", filterTransactions);

    document
      .getElementById("categoryFilter")
      ?.addEventListener("change", filterTransactions);

    bindTransactionDelete();

  }

  /*
   * ---------------------------------------------------------
   * TRANSACTION TABLE
   * ---------------------------------------------------------
   */

  function transactionTable(data) {

    if (!data.length) {

      return `
        <div class="empty-state">
          <strong>No transactions found</strong>
          <p>Add your first financial transaction to get started.</p>
        </div>
      `;

    }

    return `
      <div class="finance-table-wrapper">

        <div class="finance-table">

          <div class="finance-table-row finance-table-head">
            <span>Date</span>
            <span>Description</span>
            <span>Category</span>
            <span>Type</span>
            <span>Amount</span>
            <span>Action</span>
          </div>

          ${data.map(transaction => `

            <div class="finance-table-row">

              <span>${formatDate(transaction.date)}</span>

              <strong>${escapeHTML(transaction.description)}</strong>

              <span>${escapeHTML(transaction.category)}</span>

              <span>
                <b class="transaction-type ${transaction.type}">
                  ${transaction.type === "income" ? "Income" : "Expense"}
                </b>
              </span>

              <strong class="${transaction.type === "income" ? "amount-income" : "amount-expense"}">
                ${transaction.type === "income" ? "+" : "-"}
                ${formatMoney(transaction.amount)}
              </strong>

              <button
                class="delete-transaction"
                data-id="${transaction.id}">
                ×
              </button>

            </div>

          `).join("")}

        </div>

      </div>
    `;

  }

  /*
   * ---------------------------------------------------------
   * FILTER
   * ---------------------------------------------------------
   */

  function filterTransactions() {

    const search =
      document
        .getElementById("transactionSearch")
        ?.value
        .toLowerCase() || "";

    const type =
      document
        .getElementById("transactionFilter")
        ?.value || "all";

    const category =
      document
        .getElementById("categoryFilter")
        ?.value || "all";

    const filtered = transactions.filter(item => {

      const matchesSearch =
        item.description.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search);

      const matchesType =
        type === "all" || item.type === type;

      const matchesCategory =
        category === "all" || item.category === category;

      return matchesSearch && matchesType && matchesCategory;

    });

    const container =
      document.getElementById("transactionTableContainer");

    if (container) {
      container.innerHTML = transactionTable(filtered);
      bindTransactionDelete();
    }

  }

  /*
   * ---------------------------------------------------------
   * DELETE TRANSACTION
   * ---------------------------------------------------------
   */

  function bindTransactionDelete() {

    document
      .querySelectorAll(".delete-transaction")
      .forEach(button => {

        button.addEventListener("click", () => {

          const id = Number(button.dataset.id);

          transactions = transactions.filter(
            item => item.id !== id
          );

          saveTransactions();

          showToast("Transaction deleted.");

          const activePage =
            document.querySelector(".nav-item.active")
              ?.dataset.page;

          if (activePage === "finance") {
            renderFinance();
          } else if (activePage === "revenue") {
            renderRevenue();
          } else if (activePage === "expenses") {
            renderExpenses();
          } else if (activePage === "cashflow") {
            renderCashFlow();
          } else {
            renderTransactions();
          }

        });

      });

  }

  /*
   * ---------------------------------------------------------
   * TRANSACTION MODAL
   * ---------------------------------------------------------
   */

  function openTransactionModal(type = "income") {

    modalTitle.textContent =
      type === "expense"
        ? "Add Expense"
        : "Add Income";

    modalDescription.textContent =
      type === "expense"
        ? "Record a new business expense."
        : "Record a new business income.";

    const modalForm = document.querySelector(".modal-form");

    modalForm.innerHTML = `

      <label>
        Description
        <input id="modalDescriptionInput"
          type="text"
          placeholder="e.g. Customer payment">
      </label>

      <label>
        Amount
        <input id="modalAmountInput"
          type="number"
          min="0"
          placeholder="0">
      </label>

      <label>
        Category
        <select id="modalCategoryInput">

          ${
            type === "expense"
              ? `
                <option>Operations</option>
                <option>Marketing</option>
                <option>Payroll</option>
                <option>Technology</option>
                <option>Rent</option>
                <option>Other</option>
              `
              : `
                <option>Sales</option>
                <option>Enterprise</option>
                <option>Services</option>
                <option>Other</option>
              `
          }

        </select>
      </label>

      <label>
        Date
        <input id="modalDateInput"
          type="date"
          value="${new Date().toISOString().split("T")[0]}">
      </label>

      <input type="hidden"
        id="modalTransactionType"
        value="${type}">

    `;

    modalOverlay.classList.add("show");

  }

  modalClose?.addEventListener("click", closeModal);
  modalCancel?.addEventListener("click", closeModal);

  modalOverlay?.addEventListener("click", event => {

    if (event.target === modalOverlay) {
      closeModal();
    }

  });

  modalSave?.addEventListener("click", saveTransactionFromModal);

  function saveTransactionFromModal() {

    const description =
      document.getElementById("modalDescriptionInput")?.value.trim();

    const amount =
      Number(document.getElementById("modalAmountInput")?.value);

    const category =
      document.getElementById("modalCategoryInput")?.value;

    const date =
      document.getElementById("modalDateInput")?.value;

    const type =
      document.getElementById("modalTransactionType")?.value || "income";

    if (!description) {
      showToast("Please enter a description.");
      return;
    }

    if (!amount || amount <= 0) {
      showToast("Please enter a valid amount.");
      return;
    }

    transactions.unshift({
      id: Date.now(),
      date,
      type,
      category,
      description,
      amount
    });

    saveTransactions();

    closeModal();

    showToast(
      type === "expense"
        ? "Expense recorded successfully."
        : "Income recorded successfully."
    );

    const activePage =
      document.querySelector(".nav-item.active")
        ?.dataset.page;

    if (activePage === "finance") {
      renderFinance();
    }

    if (activePage === "revenue") {
      renderRevenue();
    }

    if (activePage === "expenses") {
      renderExpenses();
    }

    if (activePage === "cashflow") {
      renderCashFlow();
    }

  }

  function closeModal() {
    modalOverlay?.classList.remove("show");
  }

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  function calculateTotals() {

    const income = transactions
      .filter(item => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const expense = transactions
      .filter(item => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      income,
      expense,
      profit: income - expense
    };

  }

  function getCategories() {

    return [
      ...new Set(
        transactions.map(item => item.category)
      )
    ];

  }

  function expenseBreakdown() {

    const expenses =
      transactions.filter(item => item.type === "expense");

    const total =
      expenses.reduce(
        (sum, item) => sum + Number(item.amount),
        0
      );

    const grouped = {};

    expenses.forEach(item => {

      grouped[item.category] =
        (grouped[item.category] || 0) +
        Number(item.amount);

    });

    const entries =
      Object.entries(grouped)
        .sort((a, b) => b[1] - a[1]);

    if (!entries.length) {
      return `
        <div class="empty-state">
          No expense data available.
        </div>
      `;
    }

    return `
      <div class="expense-breakdown">

        ${entries.map(([category, amount]) => {

          const percentage =
            total ? Math.round((amount / total) * 100) : 0;

          return `
            <div class="expense-breakdown-row">

              <div class="expense-breakdown-info">
                <span>${escapeHTML(category)}</span>
                <strong>${formatMoney(amount)}</strong>
              </div>

              <div class="finance-bar">
                <i style="width:${percentage}%"></i>
              </div>

              <small>${percentage}%</small>

            </div>
          `;

        }).join("")}

      </div>
    `;

  }

  function expensePercent(totals) {

    if (!totals.income) return 0;

    return Math.min(
      100,
      Math.round((totals.expense / totals.income) * 100)
    );

  }

  function profitPercent(totals) {

    if (!totals.income) return 0;

    return Math.min(
      100,
      Math.max(
        0,
        Math.round((totals.profit / totals.income) * 100)
      )
    );

  }

  function financeKpi(
    label,
    value,
    trend,
    trendClass,
    icon
  ) {

    return `
      <article class="kpi-card">

        <div class="kpi-top">
          <div class="kpi-icon revenue">${icon}</div>
          <span class="trend ${trendClass}">
            ${trend}
          </span>
        </div>

        <span class="kpi-label">${label}</span>

        <div class="kpi-value">
          ${value}
        </div>

        <p>Current period</p>

        <div class="mini-progress">
          <span style="width:72%"></span>
        </div>

      </article>
    `;

  }

  function formatMoney(value) {

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(value);

  }

  function formatDate(value) {

    return new Date(value).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  }

  function formatPageName(value) {

    return value
      .replace(/-/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase());

  }

  function updateBreadcrumb(page) {

    const breadcrumb =
      document.querySelector(".breadcrumb");

    if (!breadcrumb) return;

    breadcrumb.innerHTML = `
      <span>Portofolio Wandi</span>
      <b>/</b>
      <strong>${page}</strong>
    `;

  }

  function bindTextButtons() {

    document
      .querySelectorAll(".text-button")
      .forEach(button => {

        button.addEventListener("click", () => {
          showToast(`${button.textContent.trim()} action selected.`);
        });

      });

  }

  function escapeHTML(value) {

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }

  function showToast(message) {

    document.querySelector(".toast")?.remove();

    const toast =
      document.createElement("div");

    toast.className = "toast";
    toast.textContent = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {

      toast.classList.remove("show");

      setTimeout(() => {
        toast.remove();
      }, 250);

    }, 2600);

  }

});

/* =========================================================
   SALES V2 — SAFE PATCH
========================================================= */

(function () {
  const salesData = [
    {
      date: "23 Sep 2026",
      customer: "PT Nusantara",
      product: "Business Starter",
      qty: 3,
      amount: 7500000
    },
    {
      date: "22 Sep 2026",
      customer: "CV Maju Bersama",
      product: "Business Pro",
      qty: 2,
      amount: 11000000
    },
    {
      date: "20 Sep 2026",
      customer: "Andi Retail",
      product: "Analytics Add-on",
      qty: 2,
      amount: 3500000
    }
  ];

  function renderSalesSafe() {
    const total = salesData.reduce((sum, item) => sum + item.amount, 0);

    const main = document.querySelector(".content");
    if (!main) return;

    main.innerHTML = `
      <div class="module-header">
        <div>
          <div class="module-eyebrow">PORTOFOLIO WANDI</div>
          <h1>Sales</h1>
          <p>Monitor sales performance and recent orders.</p>
        </div>
      </div>

      <div class="business-kpi-grid">

        <div class="business-kpi">
          <div class="business-kpi-top">
            <span>Total Sales</span>
            <div class="business-kpi-icon">↗</div>
          </div>
          <strong>Rp ${total.toLocaleString("id-ID")}</strong>
          <small>Current sales value</small>
        </div>

        <div class="business-kpi">
          <div class="business-kpi-top">
            <span>Orders</span>
            <div class="business-kpi-icon">▣</div>
          </div>
          <strong>${salesData.length}</strong>
          <small>Completed orders</small>
        </div>

        <div class="business-kpi">
          <div class="business-kpi-top">
            <span>Average Order</span>
            <div class="business-kpi-icon">◉</div>
          </div>
          <strong>Rp ${Math.round(total / salesData.length).toLocaleString("id-ID")}</strong>
          <small>Average order value</small>
        </div>

      </div>

      <div class="business-panel">

        <div class="panel-heading">
          <div>
            <h3>Recent Sales</h3>
            <span>Latest business transactions</span>
          </div>
        </div>

        <div class="business-table-wrap">
          <table class="business-table">

            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              ${salesData.map(item => `
                <tr>
                  <td>${item.date}</td>
                  <td><strong>${item.customer}</strong></td>
                  <td>${item.product}</td>
                  <td>${item.qty}</td>
                  <td><strong>Rp ${item.amount.toLocaleString("id-ID")}</strong></td>
                  <td>
                    <span class="status-badge success">Completed</span>
                  </td>
                </tr>
              `).join("")}
            </tbody>

          </table>
        </div>

      </div>
    `;
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('[data-page="sales"]').forEach(function (button) {
      button.addEventListener("click", function () {
        setTimeout(renderSalesSafe, 0);
      });
    });
  });
})();

/* =========================================================
   CUSTOMERS V1 — SAFE PATCH
========================================================= */

(function () {

  const customersData = [
    {
      name: "PT Nusantara",
      company: "PT Nusantara",
      segment: "Enterprise",
      revenue: 18400000,
      status: "Active"
    },
    {
      name: "CV Maju Bersama",
      company: "CV Maju Bersama",
      segment: "Business",
      revenue: 12600000,
      status: "Active"
    },
    {
      name: "Andi Retail",
      company: "Andi Retail",
      segment: "Retail",
      revenue: 7800000,
      status: "Active"
    }
  ];

  function renderCustomersSafe() {

    const totalValue = customersData.reduce(
      (sum, customer) => sum + customer.revenue,
      0
    );

    const active = customersData.filter(
      customer => customer.status === "Active"
    ).length;

    const main = document.querySelector(".content");

    if (!main) return;

    main.innerHTML = `
      <div class="module-header">

        <div>
          <div class="module-eyebrow">PORTOFOLIO WANDI</div>
          <h1>Customers</h1>
          <p>Manage customers, customer value, and relationships.</p>
        </div>

        <button
          class="primary-btn"
          onclick="showToast('Add Customer siap dikembangkan')">
          + Add Customer
        </button>

      </div>


      <div class="business-kpi-grid">

        <div class="business-kpi">
          <div class="business-kpi-top">
            <span>Total Customers</span>
            <div class="business-kpi-icon">♙</div>
          </div>

          <strong>${customersData.length}</strong>

          <small>Registered customers</small>
        </div>


        <div class="business-kpi">
          <div class="business-kpi-top">
            <span>Active</span>
            <div class="business-kpi-icon">✓</div>
          </div>

          <strong>${active}</strong>

          <small>Active customers</small>
        </div>


        <div class="business-kpi">
          <div class="business-kpi-top">
            <span>Customer Value</span>
            <div class="business-kpi-icon">◈</div>
          </div>

          <strong>
            Rp ${totalValue.toLocaleString("id-ID")}
          </strong>

          <small>Total recorded revenue</small>
        </div>


        <div class="business-kpi">
          <div class="business-kpi-top">
            <span>Average Value</span>
            <div class="business-kpi-icon">◉</div>
          </div>

          <strong>
            Rp ${Math.round(
              totalValue / customersData.length
            ).toLocaleString("id-ID")}
          </strong>

          <small>Average customer value</small>
        </div>

      </div>


      <div class="business-panel">

        <div class="panel-heading">

          <div>
            <h3>Customer Directory</h3>
            <span>Current customer portfolio</span>
          </div>

        </div>


        <div class="business-toolbar">

          <input
            class="business-search"
            id="customerSearchSafe"
            type="text"
            placeholder="Search customer..."
          >

          <select
            class="business-select"
            id="customerSegmentSafe">

            <option value="all">All Segments</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Business">Business</option>
            <option value="Retail">Retail</option>

          </select>

        </div>


        <div class="business-table-wrap">

          <table class="business-table">

            <thead>

              <tr>
                <th>Customer</th>
                <th>Company</th>
                <th>Segment</th>
                <th>Revenue</th>
                <th>Status</th>
              </tr>

            </thead>


            <tbody id="customersSafeTable">

              ${customersData.map(customer => `

                <tr>

                  <td>
                    <strong>${customer.name}</strong>
                  </td>

                  <td>
                    ${customer.company}
                  </td>

                  <td>
                    ${customer.segment}
                  </td>

                  <td>
                    <strong>
                      Rp ${customer.revenue.toLocaleString("id-ID")}
                    </strong>
                  </td>

                  <td>
                    <span class="status-badge success">
                      ${customer.status}
                    </span>
                  </td>

                </tr>

              `).join("")}

            </tbody>

          </table>

        </div>

      </div>


      <div class="business-grid-2">

        <div class="business-panel">

          <div class="panel-heading">

            <div>
              <h3>Top Customer</h3>
              <span>Highest recorded customer value</span>
            </div>

          </div>

          <div class="opportunity-box">

            <strong>PT Nusantara</strong>

            <p>
              Customer value:
              Rp 18.4M
            </p>

            <button
              class="secondary-btn"
              onclick="showToast('Customer detail dibuka')">

              View Customer

            </button>

          </div>

        </div>


        <div class="business-panel">

          <div class="panel-heading">

            <div>
              <h3>Opportunity</h3>
              <span>Customer growth opportunity</span>
            </div>

          </div>

          <div class="opportunity-box">

            <strong>Expand existing accounts</strong>

            <p>
              Focus on customers with existing revenue
              and potential for additional products.
            </p>

            <button
              class="secondary-btn"
              onclick="showToast('Opportunity dibuka')">

              View Opportunity

            </button>

          </div>

        </div>

      </div>
    `;


    const search =
      document.getElementById("customerSearchSafe");

    const segment =
      document.getElementById("customerSegmentSafe");

    const table =
      document.getElementById("customersSafeTable");


    function filterCustomers() {

      const keyword =
        search.value.toLowerCase().trim();

      const selected =
        segment.value;


      const filtered =
        customersData.filter(customer => {

          const matchesSearch =
            customer.name.toLowerCase().includes(keyword) ||
            customer.company.toLowerCase().includes(keyword);

          const matchesSegment =
            selected === "all" ||
            customer.segment === selected;

          return matchesSearch && matchesSegment;

        });


      table.innerHTML = filtered.map(customer => `

        <tr>

          <td>
            <strong>${customer.name}</strong>
          </td>

          <td>
            ${customer.company}
          </td>

          <td>
            ${customer.segment}
          </td>

          <td>
            <strong>
              Rp ${customer.revenue.toLocaleString("id-ID")}
            </strong>
          </td>

          <td>
            <span class="status-badge success">
              ${customer.status}
            </span>
          </td>

        </tr>

      `).join("");

    }


    search.addEventListener("input", filterCustomers);

    segment.addEventListener("change", filterCustomers);

  }


  document.addEventListener(
    "DOMContentLoaded",
    function () {

      document
        .querySelectorAll('[data-page="customers"]')
        .forEach(function (button) {

          button.addEventListener(
            "click",
            function () {

              setTimeout(
                renderCustomersSafe,
                0
              );

            }
          );

        });

    }
  );

})();


/* =========================================================
   PRODUCTS V2 — SAFE STANDALONE
   Tidak mengubah router / Finance / Sales / Customers
   ========================================================= */
(function () {
  "use strict";

  const productsData = [
    {
      id: 1,
      name: "Business Starter",
      sku: "BS-001",
      category: "Software",
      price: 2500000,
      cost: 850000,
      stock: 42,
      targetStock: 20,
      sold: 38
    },
    {
      id: 2,
      name: "Business Pro",
      sku: "BP-001",
      category: "Software",
      price: 5500000,
      cost: 1900000,
      stock: 18,
      targetStock: 15,
      sold: 27
    },
    {
      id: 3,
      name: "Enterprise Package",
      sku: "EP-001",
      category: "Enterprise",
      price: 12500000,
      cost: 5200000,
      stock: 7,
      targetStock: 12,
      sold: 14
    },
    {
      id: 4,
      name: "Analytics Add-on",
      sku: "AN-001",
      category: "Add-on",
      price: 1750000,
      cost: 450000,
      stock: 31,
      targetStock: 15,
      sold: 22
    }
  ];

  function money(value) {
    return "Rp " + Number(value || 0).toLocaleString("id-ID");
  }

  function renderProductsSafe() {
    const content =
      document.querySelector(".content") ||
      document.querySelector("main");

    if (!content) {
      console.error("Products: container tidak ditemukan");
      return;
    }

    const totalValue = productsData.reduce(
      (sum, p) => sum + (p.price * p.stock),
      0
    );

    const lowStock = productsData.filter(
      p => p.stock < p.targetStock
    ).length;

    const totalSold = productsData.reduce(
      (sum, p) => sum + p.sold,
      0
    );

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Products</h1>
          <p>Product & Inventory Management</p>
        </div>

        <button class="btn-primary" id="productsAddBtn">
          + Add Product
        </button>
      </div>

      <div class="kpi-grid">

        <div class="kpi-card">
          <span>Total Products</span>
          <strong>${productsData.length}</strong>
        </div>

        <div class="kpi-card">
          <span>Inventory Value</span>
          <strong>${money(totalValue)}</strong>
        </div>

        <div class="kpi-card">
          <span>Total Sold</span>
          <strong>${totalSold}</strong>
        </div>

        <div class="kpi-card">
          <span>Low Stock</span>
          <strong>${lowStock}</strong>
        </div>

      </div>

      <div class="card" style="margin-top:20px">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          margin-bottom:18px;
          flex-wrap:wrap;
        ">

          <div>
            <h2>Product Catalog</h2>
            <p>Products, pricing and inventory status</p>
          </div>

          <input
            id="productSearch"
            type="text"
            placeholder="Search product..."
            style="
              padding:10px 14px;
              border:1px solid #ddd;
              border-radius:8px;
              min-width:220px;
            "
          >

        </div>

        <div style="overflow-x:auto">

          <table class="data-table">

            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Cost</th>
                <th>Margin</th>
                <th>Stock</th>
                <th>Sold</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody id="productsTableBody"></tbody>

          </table>

        </div>

      </div>

      <div class="card" style="margin-top:20px">

        <h2>Inventory Alert</h2>

        ${
          lowStock > 0
            ? `
              <div style="
                margin-top:12px;
                padding:14px;
                border-radius:8px;
                background:#fff7ed;
              ">
                ${productsData
                  .filter(p => p.stock < p.targetStock)
                  .map(p => `
                    <div style="margin-bottom:8px">
                      <strong>${p.name}</strong>
                      —
                      Stock ${p.stock},
                      target ${p.targetStock}
                    </div>
                  `)
                  .join("")}
              </div>
            `
            : `
              <p style="margin-top:12px">
                Semua stok berada di atas target.
              </p>
            `
        }

      </div>
    `;

    const tbody = document.getElementById("productsTableBody");
    const search = document.getElementById("productSearch");

    function drawTable(keyword) {
      keyword = String(keyword || "").toLowerCase();

      const filtered = productsData.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        p.sku.toLowerCase().includes(keyword) ||
        p.category.toLowerCase().includes(keyword)
      );

      tbody.innerHTML = filtered.map(p => {

        const margin = p.price > 0
          ? Math.round(((p.price - p.cost) / p.price) * 100)
          : 0;

        const low = p.stock < p.targetStock;

        return `
          <tr>

            <td>
              <strong>${p.name}</strong>
            </td>

            <td>${p.sku}</td>

            <td>${p.category}</td>

            <td>${money(p.price)}</td>

            <td>${money(p.cost)}</td>

            <td>${margin}%</td>

            <td>
              <strong>${p.stock}</strong>
            </td>

            <td>${p.sold}</td>

            <td>
              ${
                low
                  ? `<span class="status-badge warning">Low Stock</span>`
                  : `<span class="status-badge success">Healthy</span>`
              }
            </td>

          </tr>
        `;

      }).join("");
    }

    drawTable("");

    if (search) {
      search.addEventListener("input", function () {
        drawTable(this.value);
      });
    }

    const addBtn = document.getElementById("productsAddBtn");

    if (addBtn) {
      addBtn.addEventListener("click", function () {
        if (typeof showToast === "function") {
          showToast("Form Add Product akan ditambahkan pada tahap berikutnya");
        } else {
          alert("Add Product akan ditambahkan pada tahap berikutnya");
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {

    document
      .querySelectorAll('[data-page="products"]')
      .forEach(function (button) {

        button.addEventListener("click", function () {

          setTimeout(function () {
            renderProductsSafe();
          }, 0);

        });

      });

  });

})();

/* =========================================================
   PRODUCTS UI POLISH V1
   Hanya memperbaiki tampilan Products
   ========================================================= */
(function () {
  "use strict";

  function polishProductsUI() {

    const content = document.querySelector(".content");
    if (!content) return;

    const title = content.querySelector("h1");
    if (!title || title.textContent.trim() !== "Products") return;

    /* ---------- PAGE HEADER ---------- */
    const header = content.querySelector(".page-header");

    if (header) {
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "center";
      header.style.gap = "20px";
      header.style.marginBottom = "24px";
    }

    /* ---------- KPI GRID ---------- */
    const kpiGrid = content.querySelector(".kpi-grid");

    if (kpiGrid) {
      kpiGrid.style.display = "grid";
      kpiGrid.style.gridTemplateColumns =
        "repeat(4, minmax(0, 1fr))";
      kpiGrid.style.gap = "16px";
      kpiGrid.style.marginBottom = "24px";
    }

    content.querySelectorAll(".kpi-card").forEach(function (card) {

      card.style.background = "#ffffff";
      card.style.border = "1px solid #e5e7eb";
      card.style.borderRadius = "14px";
      card.style.padding = "20px";
      card.style.boxShadow =
        "0 2px 8px rgba(16,24,40,.05)";

      const spans = card.querySelectorAll("span");

      spans.forEach(function (span) {
        span.style.display = "block";
        span.style.fontSize = "13px";
        span.style.color = "#667085";
        span.style.marginBottom = "8px";
      });

      const strong = card.querySelector("strong");

      if (strong) {
        strong.style.display = "block";
        strong.style.fontSize = "24px";
        strong.style.fontWeight = "700";
        strong.style.color = "#101828";
      }

    });

    /* ---------- CARD ---------- */
    content.querySelectorAll(".card").forEach(function (card) {

      card.style.background = "#ffffff";
      card.style.border = "1px solid #e5e7eb";
      card.style.borderRadius = "14px";
      card.style.boxShadow =
        "0 2px 8px rgba(16,24,40,.04)";
      card.style.padding = "22px";

    });

    /* ---------- HEADINGS ---------- */
    content.querySelectorAll(".card h2").forEach(function (h2) {

      h2.style.margin = "0";
      h2.style.fontSize = "17px";
      h2.style.fontWeight = "700";
      h2.style.color = "#101828";

    });

    content.querySelectorAll(".card p").forEach(function (p) {

      if (!p.closest("div[style*='background']")) {
        p.style.color = "#667085";
        p.style.fontSize = "13px";
      }

    });

    /* ---------- SEARCH ---------- */
    const search = document.getElementById("productSearch");

    if (search) {

      search.style.height = "42px";
      search.style.padding = "0 14px";
      search.style.border = "1px solid #d0d5dd";
      search.style.borderRadius = "8px";
      search.style.background = "#ffffff";
      search.style.color = "#101828";
      search.style.fontSize = "14px";
      search.style.outline = "none";
      search.style.minWidth = "240px";
      search.style.boxSizing = "border-box";

    }

    /* ---------- TABLE ---------- */
    const table = content.querySelector(".data-table");

    if (table) {

      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.fontSize = "14px";

      table.querySelectorAll("thead th").forEach(function (th) {

        th.style.textAlign = "left";
        th.style.padding = "13px 14px";
        th.style.background = "#f9fafb";
        th.style.borderBottom = "1px solid #eaecf0";
        th.style.color = "#667085";
        th.style.fontSize = "12px";
        th.style.fontWeight = "600";
        th.style.whiteSpace = "nowrap";

      });

      table.querySelectorAll("tbody tr").forEach(function (tr) {

        tr.style.borderBottom = "1px solid #f2f4f7";

        tr.addEventListener("mouseenter", function () {
          tr.style.background = "#f9fafb";
        });

        tr.addEventListener("mouseleave", function () {
          tr.style.background = "";
        });

      });

      table.querySelectorAll("tbody td").forEach(function (td) {

        td.style.padding = "15px 14px";
        td.style.color = "#344054";
        td.style.verticalAlign = "middle";
        td.style.whiteSpace = "nowrap";

      });

    }

    /* ---------- STATUS BADGES ---------- */
    content.querySelectorAll(".status-badge").forEach(function (badge) {

      badge.style.display = "inline-flex";
      badge.style.alignItems = "center";
      badge.style.padding = "5px 9px";
      badge.style.borderRadius = "999px";
      badge.style.fontSize = "12px";
      badge.style.fontWeight = "600";

      if (badge.textContent.includes("Low")) {

        badge.style.background = "#fef3f2";
        badge.style.color = "#b42318";

      } else {

        badge.style.background = "#ecfdf3";
        badge.style.color = "#027a48";

      }

    });

    /* ---------- INVENTORY ALERT ---------- */
    content.querySelectorAll(".card").forEach(function (card) {

      if (
        card.querySelector("h2") &&
        card.querySelector("h2").textContent.trim() === "Inventory Alert"
      ) {

        const alertBox = card.querySelector(
          "div[style*='background']"
        );

        if (alertBox) {

          alertBox.style.background = "#fffaeb";
          alertBox.style.border = "1px solid #fedf89";
          alertBox.style.borderRadius = "10px";
          alertBox.style.color = "#7a2e0e";
          alertBox.style.padding = "14px 16px";

        }

      }

    });

    /* ---------- RESPONSIVE ---------- */
    if (window.innerWidth <= 900 && kpiGrid) {

      kpiGrid.style.gridTemplateColumns =
        "repeat(2, minmax(0, 1fr))";

    }

    if (window.innerWidth <= 600 && kpiGrid) {

      kpiGrid.style.gridTemplateColumns = "1fr";

    }

  }

  document.addEventListener("click", function (event) {

    const productButton =
      event.target.closest('[data-page="products"]');

    if (!productButton) return;

    setTimeout(polishProductsUI, 20);

  });

  window.addEventListener("resize", function () {

    const title = document.querySelector(".content h1");

    if (
      title &&
      title.textContent.trim() === "Products"
    ) {
      polishProductsUI();
    }

  });

})();

/* =========================================================
   PRODUCTS UI V2 — BUSINESS CLIENT STYLE
   ========================================================= */
(function () {
  "use strict";

  function styleProducts() {

    const content = document.querySelector(".content");
    if (!content) return;

    const title = content.querySelector("h1");

    if (!title || title.textContent.trim() !== "Products") {
      return;
    }

    /* =========================
       PAGE HEADER
       ========================= */

    const header = content.querySelector(".page-header");

    if (header) {

      header.style.marginBottom = "28px";

      const subtitle = header.querySelector("p");

      if (subtitle) {
        subtitle.style.marginTop = "6px";
        subtitle.style.color = "#667085";
        subtitle.style.fontSize = "14px";
      }

    }

    /* =========================
       KPI CARDS
       ========================= */

    const grid = content.querySelector(".kpi-grid");

    if (grid) {

      grid.style.display = "grid";
      grid.style.gridTemplateColumns =
        "repeat(4,minmax(0,1fr))";
      grid.style.gap = "16px";
      grid.style.marginBottom = "24px";

      grid.querySelectorAll(".kpi-card").forEach(function(card) {

        card.style.position = "relative";
        card.style.minHeight = "110px";
        card.style.boxSizing = "border-box";
        card.style.padding = "20px";
        card.style.borderRadius = "14px";
        card.style.border = "1px solid #eaecf0";
        card.style.background = "#ffffff";
        card.style.boxShadow =
          "0 1px 3px rgba(16,24,40,.06)";
        card.style.transition =
          "transform .15s ease, box-shadow .15s ease";

        card.onmouseenter = function () {

          card.style.transform = "translateY(-2px)";
          card.style.boxShadow =
            "0 6px 18px rgba(16,24,40,.08)";

        };

        card.onmouseleave = function () {

          card.style.transform = "";
          card.style.boxShadow =
            "0 1px 3px rgba(16,24,40,.06)";

        };

        const label = card.querySelector("span");

        if (label) {

          label.style.display = "block";
          label.style.fontSize = "12px";
          label.style.fontWeight = "600";
          label.style.color = "#667085";
          label.style.marginBottom = "10px";
          label.style.textTransform = "uppercase";
          label.style.letterSpacing = ".03em";

        }

        const value = card.querySelector("strong");

        if (value) {

          value.style.fontSize = "25px";
          value.style.fontWeight = "700";
          value.style.color = "#101828";
          value.style.lineHeight = "1.2";

        }

      });

    }

    /* =========================
       ALL CARDS
       ========================= */

    content.querySelectorAll(".card").forEach(function(card) {

      card.style.background = "#ffffff";
      card.style.border = "1px solid #eaecf0";
      card.style.borderRadius = "14px";
      card.style.boxShadow =
        "0 1px 3px rgba(16,24,40,.05)";
      card.style.padding = "22px";
      card.style.boxSizing = "border-box";

    });

    /* =========================
       PRODUCT CATALOG HEADER
       ========================= */

    content.querySelectorAll(".card").forEach(function(card) {

      const h2 = card.querySelector("h2");

      if (!h2) return;

      if (h2.textContent.trim() === "Product Catalog") {

        h2.style.fontSize = "18px";
        h2.style.marginBottom = "4px";

      }

    });

    /* =========================
       SEARCH
       ========================= */

    const search = document.getElementById("productSearch");

    if (search) {

      search.style.width = "260px";
      search.style.height = "42px";
      search.style.padding = "0 14px";
      search.style.border = "1px solid #d0d5dd";
      search.style.borderRadius = "8px";
      search.style.background = "#ffffff";
      search.style.fontSize = "14px";
      search.style.color = "#101828";
      search.style.boxSizing = "border-box";
      search.style.outline = "none";

    }

    /* =========================
       TABLE CONTAINER
       ========================= */

    const table = content.querySelector(".data-table");

    if (table) {

      table.style.width = "100%";
      table.style.borderCollapse = "separate";
      table.style.borderSpacing = "0";
      table.style.fontSize = "13px";

      table.querySelectorAll("thead th").forEach(function(th) {

        th.style.height = "44px";
        th.style.padding = "0 14px";
        th.style.background = "#f9fafb";
        th.style.color = "#667085";
        th.style.fontSize = "11px";
        th.style.fontWeight = "700";
        th.style.textTransform = "uppercase";
        th.style.letterSpacing = ".04em";
        th.style.borderBottom = "1px solid #eaecf0";
        th.style.whiteSpace = "nowrap";

      });

      table.querySelectorAll("tbody tr").forEach(function(tr) {

        tr.style.transition = "background .12s ease";

        tr.onmouseenter = function() {
          tr.style.background = "#f9fafb";
        };

        tr.onmouseleave = function() {
          tr.style.background = "";
        };

      });

      table.querySelectorAll("tbody td").forEach(function(td) {

        td.style.height = "58px";
        td.style.padding = "0 14px";
        td.style.borderBottom = "1px solid #f2f4f7";
        td.style.color = "#344054";
        td.style.verticalAlign = "middle";
        td.style.whiteSpace = "nowrap";

      });

      table.querySelectorAll("tbody td:first-child")
        .forEach(function(td) {

          td.style.color = "#101828";
          td.style.fontWeight = "600";

        });

    }

    /* =========================
       STATUS BADGES
       ========================= */

    content.querySelectorAll(".status-badge").forEach(function(badge) {

      badge.style.display = "inline-flex";
      badge.style.alignItems = "center";
      badge.style.justifyContent = "center";
      badge.style.minWidth = "72px";
      badge.style.padding = "5px 10px";
      badge.style.borderRadius = "999px";
      badge.style.fontSize = "11px";
      badge.style.fontWeight = "700";

      if (
        badge.textContent
          .toLowerCase()
          .includes("low")
      ) {

        badge.style.background = "#fef3f2";
        badge.style.color = "#b42318";

      } else {

        badge.style.background = "#ecfdf3";
        badge.style.color = "#027a48";

      }

    });

    /* =========================
       INVENTORY ALERT
       ========================= */

    content.querySelectorAll(".card").forEach(function(card) {

      const h2 = card.querySelector("h2");

      if (!h2) return;

      if (
        h2.textContent.trim() ===
        "Inventory Alert"
      ) {

        h2.style.fontSize = "17px";

        const box = card.querySelector(
          "div[style*='background']"
        );

        if (box) {

          box.style.marginTop = "14px";
          box.style.padding = "16px";
          box.style.borderRadius = "10px";
          box.style.background = "#fffaeb";
          box.style.border = "1px solid #fedf89";
          box.style.color = "#7a2e0e";

        }

      }

    });

    /* =========================
       BUTTON
       ========================= */

    const addButton =
      document.getElementById("productsAddBtn");

    if (addButton) {

      addButton.style.height = "42px";
      addButton.style.padding = "0 18px";
      addButton.style.borderRadius = "8px";
      addButton.style.fontSize = "14px";
      addButton.style.fontWeight = "600";
      addButton.style.cursor = "pointer";

    }

    /* =========================
       MOBILE
       ========================= */

    function responsive() {

      if (!grid) return;

      if (window.innerWidth <= 1000) {

        grid.style.gridTemplateColumns =
          "repeat(2,minmax(0,1fr))";

      }

      if (window.innerWidth <= 600) {

        grid.style.gridTemplateColumns = "1fr";

        if (search) {
          search.style.width = "100%";
        }

        if (header) {

          header.style.flexDirection = "column";
          header.style.alignItems = "stretch";

        }

        if (addButton) {
          addButton.style.width = "100%";
        }

      }

    }

    responsive();

  }

  document.addEventListener(
    "click",
    function(event) {

      const button =
        event.target.closest(
          '[data-page="products"]'
        );

      if (!button) return;

      setTimeout(styleProducts, 30);

    }
  );

  window.addEventListener(
    "resize",
    function() {

      const title =
        document.querySelector(".content h1");

      if (
        title &&
        title.textContent.trim() === "Products"
      ) {

        styleProducts();

      }

    }
  );

})();

/* =========================================================
   PRODUCTS V3 — FUNCTIONAL
   Add / Edit / Delete / Stock / Search / Category
   LocalStorage persistence
   ========================================================= */
(function () {
  "use strict";

  const STORAGE_KEY = "businessHubProductsV3";

  const defaultProducts = [
    {
      id: 1,
      name: "Business Starter",
      sku: "BS-001",
      category: "Software",
      price: 2500000,
      cost: 850000,
      stock: 42,
      targetStock: 20,
      sold: 38
    },
    {
      id: 2,
      name: "Business Pro",
      sku: "BP-001",
      category: "Software",
      price: 5500000,
      cost: 1900000,
      stock: 18,
      targetStock: 15,
      sold: 27
    },
    {
      id: 3,
      name: "Enterprise Package",
      sku: "EP-001",
      category: "Enterprise",
      price: 12500000,
      cost: 5200000,
      stock: 7,
      targetStock: 12,
      sold: 14
    },
    {
      id: 4,
      name: "Analytics Add-on",
      sku: "AN-001",
      category: "Add-on",
      price: 1750000,
      cost: 450000,
      stock: 31,
      targetStock: 15,
      sold: 22
    }
  ];

  function getProducts() {

    try {

      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (saved) {

        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          return parsed;
        }

      }

    } catch (error) {
      console.error("Products storage error:", error);
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultProducts)
    );

    return JSON.parse(
      JSON.stringify(defaultProducts)
    );
  }

  function saveProducts(products) {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(products)
    );

  }

  function money(value) {

    return "Rp " +
      Number(value || 0).toLocaleString("id-ID");

  }

  function escapeHTML(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }

  function notify(message) {

    if (typeof showToast === "function") {
      showToast(message);
    } else {
      alert(message);
    }

  }

  function renderProductsFunctional() {

    const content =
      document.querySelector(".content");

    if (!content) return;

    let products = getProducts();

    const totalValue = products.reduce(
      (sum, p) =>
        sum + Number(p.price || 0) * Number(p.stock || 0),
      0
    );

    const totalSold = products.reduce(
      (sum, p) =>
        sum + Number(p.sold || 0),
      0
    );

    const lowStock = products.filter(
      p =>
        Number(p.stock || 0) <
        Number(p.targetStock || 0)
    ).length;

    const categories = [
      ...new Set(
        products.map(p => p.category).filter(Boolean)
      )
    ];

    content.innerHTML = `

      <div class="page-header">

        <div>
          <h1>Products</h1>
          <p>Product & Inventory Management</p>
        </div>

        <button
          class="btn-primary"
          id="productsAddBtnV3">
          + Add Product
        </button>

      </div>

      <div class="kpi-grid">

        <div class="kpi-card">
          <span>Total Products</span>
          <strong>${products.length}</strong>
        </div>

        <div class="kpi-card">
          <span>Inventory Value</span>
          <strong>${money(totalValue)}</strong>
        </div>

        <div class="kpi-card">
          <span>Total Sold</span>
          <strong>${totalSold}</strong>
        </div>

        <div class="kpi-card">
          <span>Low Stock</span>
          <strong>${lowStock}</strong>
        </div>

      </div>

      <div
        class="card"
        style="margin-top:20px">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          flex-wrap:wrap;
          margin-bottom:18px;
        ">

          <div>
            <h2>Product Catalog</h2>
            <p>Manage products, pricing and inventory</p>
          </div>

          <div style="
            display:flex;
            gap:10px;
            flex-wrap:wrap;
          ">

            <input
              id="productsSearchV3"
              type="text"
              placeholder="Search product..."
              style="
                height:42px;
                padding:0 13px;
                border:1px solid #d0d5dd;
                border-radius:8px;
                min-width:220px;
                box-sizing:border-box;
              "
            >

            <select
              id="productsCategoryV3"
              style="
                height:42px;
                padding:0 12px;
                border:1px solid #d0d5dd;
                border-radius:8px;
                background:#fff;
              "
            >

              <option value="all">
                All Categories
              </option>

              ${categories.map(c => `
                <option value="${escapeHTML(c)}">
                  ${escapeHTML(c)}
                </option>
              `).join("")}

            </select>

          </div>

        </div>

        <div style="overflow-x:auto">

          <table
            class="data-table"
            style="width:100%;border-collapse:collapse">

            <thead>

              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Margin</th>
                <th>Stock</th>
                <th>Sold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody id="productsBodyV3"></tbody>

          </table>

        </div>

      </div>

      <div
        class="card"
        style="margin-top:20px">

        <h2>Inventory Alert</h2>

        <div id="inventoryAlertV3"></div>

      </div>

    `;

    const body =
      document.getElementById("productsBodyV3");

    const search =
      document.getElementById("productsSearchV3");

    const category =
      document.getElementById("productsCategoryV3");

    function draw() {

      const keyword =
        String(search.value || "").toLowerCase();

      const selectedCategory =
        category.value;

      const filtered =
        products.filter(function (p) {

          const textMatch =
            String(p.name).toLowerCase().includes(keyword) ||
            String(p.sku).toLowerCase().includes(keyword) ||
            String(p.category).toLowerCase().includes(keyword);

          const categoryMatch =
            selectedCategory === "all" ||
            p.category === selectedCategory;

          return textMatch && categoryMatch;

        });

      body.innerHTML =
        filtered.map(function (p) {

          const price =
            Number(p.price || 0);

          const cost =
            Number(p.cost || 0);

          const margin =
            price > 0
              ? Math.round(
                  ((price - cost) / price) * 100
                )
              : 0;

          const low =
            Number(p.stock || 0) <
            Number(p.targetStock || 0);

          return `

            <tr>

              <td>
                <strong>
                  ${escapeHTML(p.name)}
                </strong>
              </td>

              <td>
                ${escapeHTML(p.sku)}
              </td>

              <td>
                ${escapeHTML(p.category)}
              </td>

              <td>
                ${money(price)}
              </td>

              <td>
                <strong>
                  ${margin}%
                </strong>
              </td>

              <td>
                <strong>
                  ${Number(p.stock || 0)}
                </strong>
                /
                ${Number(p.targetStock || 0)}
              </td>

              <td>
                ${Number(p.sold || 0)}
              </td>

              <td>

                <span
                  class="status-badge ${
                    low ? "warning" : "success"
                  }">

                  ${low ? "Low Stock" : "Healthy"}

                </span>

              </td>

              <td>

                <div style="
                  display:flex;
                  gap:6px;
                  flex-wrap:wrap;
                ">

                  <button
                    class="product-action-btn"
                    data-action="stock"
                    data-id="${p.id}"
                    title="Update Stock">
                    Stock
                  </button>

                  <button
                    class="product-action-btn"
                    data-action="edit"
                    data-id="${p.id}">
                    Edit
                  </button>

                  <button
                    class="product-action-btn danger"
                    data-action="delete"
                    data-id="${p.id}">
                    Delete
                  </button>

                </div>

              </td>

            </tr>

          `;

        }).join("");

      const alerts =
        products.filter(function (p) {

          return Number(p.stock || 0) <
            Number(p.targetStock || 0);

        });

      const alertBox =
        document.getElementById(
          "inventoryAlertV3"
        );

      if (!alerts.length) {

        alertBox.innerHTML = `
          <div style="
            margin-top:14px;
            padding:15px;
            border-radius:10px;
            background:#ecfdf3;
            border:1px solid #abefc6;
            color:#027a48;
          ">
            All inventory levels are healthy.
          </div>
        `;

      } else {

        alertBox.innerHTML = `

          <div style="
            margin-top:14px;
            padding:15px;
            border-radius:10px;
            background:#fffaeb;
            border:1px solid #fedf89;
          ">

            ${alerts.map(function (p) {

              return `
                <div style="
                  display:flex;
                  justify-content:space-between;
                  gap:10px;
                  padding:8px 0;
                  border-bottom:1px solid #f9e7b5;
                ">

                  <strong>
                    ${escapeHTML(p.name)}
                  </strong>

                  <span>
                    ${p.stock} / target ${p.targetStock}
                  </span>

                </div>
              `;

            }).join("")}

          </div>

        `;

      }

    }

    draw();

    search.addEventListener(
      "input",
      draw
    );

    category.addEventListener(
      "change",
      draw
    );

    body.addEventListener(
      "click",
      function(event) {

        const button =
          event.target.closest(
            ".product-action-btn"
          );

        if (!button) return;

        const id =
          Number(button.dataset.id);

        const action =
          button.dataset.action;

        const index =
          products.findIndex(
            p => Number(p.id) === id
          );

        if (index === -1) return;

        const product =
          products[index];

        /* STOCK */

        if (action === "stock") {

          const value =
            prompt(
              "Masukkan stok baru untuk " +
              product.name,
              product.stock
            );

          if (value === null) return;

          const stock =
            Number(value);

          if (
            !Number.isFinite(stock) ||
            stock < 0
          ) {

            notify("Stock tidak valid");

            return;

          }

          product.stock = Math.floor(stock);

          saveProducts(products);

          renderProductsFunctional();

          notify("Stock berhasil diperbarui");

          return;

        }

        /* EDIT */

        if (action === "edit") {

          const name =
            prompt(
              "Nama produk:",
              product.name
            );

          if (name === null) return;

          const price =
            prompt(
              "Harga:",
              product.price
            );

          if (price === null) return;

          const cost =
            prompt(
              "Cost:",
              product.cost
            );

          if (cost === null) return;

          const target =
            prompt(
              "Target stock:",
              product.targetStock
            );

          if (target === null) return;

          if (!name.trim()) {

            notify("Nama produk wajib diisi");

            return;

          }

          product.name =
            name.trim();

          product.price =
            Number(price) || 0;

          product.cost =
            Number(cost) || 0;

          product.targetStock =
            Math.max(
              0,
              Number(target) || 0
            );

          saveProducts(products);

          renderProductsFunctional();

          notify("Produk berhasil diperbarui");

          return;

        }

        /* DELETE */

        if (action === "delete") {

          const confirmed =
            confirm(
              "Hapus produk " +
              product.name +
              "?"
            );

          if (!confirmed) return;

          products.splice(index, 1);

          saveProducts(products);

          renderProductsFunctional();

          notify("Produk berhasil dihapus");

        }

      }
    );

    /* ADD PRODUCT */

    document
      .getElementById("productsAddBtnV3")
      .addEventListener(
        "click",
        function() {

          const name =
            prompt("Nama produk:");

          if (name === null) return;

          if (!name.trim()) {

            notify("Nama produk wajib diisi");

            return;

          }

          const sku =
            prompt("SKU:", "NEW-" + Date.now());

          if (sku === null) return;

          const categoryValue =
            prompt(
              "Category:",
              "Software"
            );

          if (categoryValue === null) return;

          const price =
            prompt(
              "Harga:",
              "0"
            );

          if (price === null) return;

          const cost =
            prompt(
              "Cost:",
              "0"
            );

          if (cost === null) return;

          const stock =
            prompt(
              "Stock awal:",
              "0"
            );

          if (stock === null) return;

          const target =
            prompt(
              "Target stock:",
              "10"
            );

          if (target === null) return;

          const newProduct = {

            id:
              Date.now(),

            name:
              name.trim(),

            sku:
              sku.trim(),

            category:
              categoryValue.trim() ||
              "Other",

            price:
              Number(price) || 0,

            cost:
              Number(cost) || 0,

            stock:
              Math.max(
                0,
                Number(stock) || 0
              ),

            targetStock:
              Math.max(
                0,
                Number(target) || 0
              ),

            sold:
              0

          };

          products.push(newProduct);

          saveProducts(products);

          renderProductsFunctional();

          notify("Produk berhasil ditambahkan");

        }
      );

  }

  /* Last Products click handler wins.
     Existing UI handlers remain untouched. */

  document.addEventListener(
    "click",
    function(event) {

      const button =
        event.target.closest(
          '[data-page="products"]'
        );

      if (!button) return;

      setTimeout(
        renderProductsFunctional,
        60
      );

    }
  );

})();

/* =========================================================
   PRODUCTS V4 — PROFESSIONAL UI + MODAL ACTIONS
   ========================================================= */
(function () {
  "use strict";

  const STORAGE_KEY = "businessHubProductsV3";

  const defaults = [
    {
      id: 1,
      name: "Business Starter",
      sku: "BS-001",
      category: "Software",
      price: 2500000,
      cost: 850000,
      stock: 42,
      targetStock: 20,
      sold: 38
    },
    {
      id: 2,
      name: "Business Pro",
      sku: "BP-001",
      category: "Software",
      price: 5500000,
      cost: 1900000,
      stock: 18,
      targetStock: 15,
      sold: 27
    },
    {
      id: 3,
      name: "Enterprise Package",
      sku: "EP-001",
      category: "Enterprise",
      price: 12500000,
      cost: 5200000,
      stock: 7,
      targetStock: 12,
      sold: 14
    },
    {
      id: 4,
      name: "Analytics Add-on",
      sku: "AN-001",
      category: "Add-on",
      price: 1750000,
      cost: 450000,
      stock: 31,
      targetStock: 15,
      sold: 22
    }
  ];

  function getProducts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) return data;
      }
    } catch (e) {}

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaults)
    );

    return JSON.parse(JSON.stringify(defaults));
  }

  function saveProducts(data) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  }

  function money(value) {
    return "Rp " +
      Number(value || 0).toLocaleString("id-ID");
  }

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function ensureStyles() {

    if (document.getElementById("productsV4Styles")) return;

    const style = document.createElement("style");

    style.id = "productsV4Styles";

    style.textContent = `
      .p4-page {
        animation: p4Fade .18s ease;
      }

      @keyframes p4Fade {
        from { opacity:0; transform:translateY(4px); }
        to { opacity:1; transform:translateY(0); }
      }

      .p4-header {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:20px;
        margin-bottom:24px;
      }

      .p4-title h1 {
        margin:0;
        font-size:26px;
        color:#101828;
      }

      .p4-title p {
        margin:6px 0 0;
        color:#667085;
        font-size:14px;
      }

      .p4-primary {
        border:0;
        background:#101828;
        color:#fff;
        height:42px;
        padding:0 18px;
        border-radius:9px;
        font-weight:600;
        cursor:pointer;
        transition:.15s;
      }

      .p4-primary:hover {
        background:#344054;
        transform:translateY(-1px);
      }

      .p4-kpis {
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:16px;
        margin-bottom:20px;
      }

      .p4-kpi {
        background:#fff;
        border:1px solid #eaecf0;
        border-radius:14px;
        padding:18px;
        box-shadow:0 1px 3px rgba(16,24,40,.05);
      }

      .p4-kpi-label {
        font-size:12px;
        color:#667085;
        font-weight:600;
        text-transform:uppercase;
        letter-spacing:.03em;
      }

      .p4-kpi-value {
        margin-top:8px;
        font-size:23px;
        font-weight:700;
        color:#101828;
      }

      .p4-card {
        background:#fff;
        border:1px solid #eaecf0;
        border-radius:14px;
        padding:20px;
        box-shadow:0 1px 3px rgba(16,24,40,.05);
        margin-bottom:20px;
      }

      .p4-toolbar {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:14px;
        margin-bottom:18px;
        flex-wrap:wrap;
      }

      .p4-toolbar h2 {
        margin:0;
        font-size:17px;
        color:#101828;
      }

      .p4-toolbar p {
        margin:5px 0 0;
        color:#667085;
        font-size:13px;
      }

      .p4-filters {
        display:flex;
        gap:8px;
        flex-wrap:wrap;
      }

      .p4-input,
      .p4-select {
        height:40px;
        border:1px solid #d0d5dd;
        border-radius:8px;
        padding:0 12px;
        background:#fff;
        color:#101828;
        font-size:13px;
        outline:none;
        box-sizing:border-box;
      }

      .p4-input {
        width:230px;
      }

      .p4-input:focus,
      .p4-select:focus {
        border-color:#98a2b3;
        box-shadow:0 0 0 3px rgba(16,24,40,.05);
      }

      .p4-table-wrap {
        overflow-x:auto;
      }

      .p4-table {
        width:100%;
        border-collapse:collapse;
        min-width:900px;
      }

      .p4-table th {
        text-align:left;
        padding:12px 12px;
        background:#f9fafb;
        color:#667085;
        font-size:11px;
        text-transform:uppercase;
        letter-spacing:.04em;
        border-bottom:1px solid #eaecf0;
      }

      .p4-table td {
        padding:14px 12px;
        border-bottom:1px solid #f2f4f7;
        color:#344054;
        font-size:13px;
        vertical-align:middle;
      }

      .p4-table tr:hover td {
        background:#f9fafb;
      }

      .p4-product-name {
        font-weight:600;
        color:#101828;
      }

      .p4-product-sku {
        font-size:11px;
        color:#98a2b3;
        margin-top:3px;
      }

      .p4-badge {
        display:inline-flex;
        align-items:center;
        padding:5px 9px;
        border-radius:999px;
        font-size:11px;
        font-weight:700;
      }

      .p4-good {
        background:#ecfdf3;
        color:#027a48;
      }

      .p4-low {
        background:#fef3f2;
        color:#b42318;
      }

      .p4-actions {
        display:flex;
        gap:6px;
      }

      .p4-action {
        height:32px;
        padding:0 9px;
        border:1px solid #d0d5dd;
        background:#fff;
        color:#344054;
        border-radius:7px;
        font-size:11px;
        font-weight:600;
        cursor:pointer;
      }

      .p4-action:hover {
        background:#f9fafb;
      }

      .p4-action-danger {
        color:#b42318;
      }

      .p4-alert {
        padding:14px 16px;
        border-radius:10px;
        border:1px solid #fedf89;
        background:#fffaeb;
      }

      .p4-alert-item {
        display:flex;
        justify-content:space-between;
        gap:15px;
        padding:9px 0;
        border-bottom:1px solid #f8e7b0;
        font-size:13px;
      }

      .p4-alert-item:last-child {
        border-bottom:0;
      }

      .p4-alert-name {
        font-weight:600;
        color:#7a2e0e;
      }

      .p4-alert-stock {
        color:#92400e;
      }

      .p4-modal-overlay {
        position:fixed;
        inset:0;
        z-index:9999;
        display:none;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:rgba(16,24,40,.55);
        backdrop-filter:blur(3px);
      }

      .p4-modal-overlay.show {
        display:flex;
      }

      .p4-modal {
        width:100%;
        max-width:520px;
        background:#fff;
        border-radius:16px;
        box-shadow:0 24px 60px rgba(16,24,40,.22);
        overflow:hidden;
        animation:p4Modal .18s ease;
      }

      @keyframes p4Modal {
        from {
          opacity:0;
          transform:translateY(10px) scale(.98);
        }
        to {
          opacity:1;
          transform:translateY(0) scale(1);
        }
      }

      .p4-modal-head {
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:20px 22px;
        border-bottom:1px solid #eaecf0;
      }

      .p4-modal-head h3 {
        margin:0;
        font-size:18px;
        color:#101828;
      }

      .p4-close {
        border:0;
        background:transparent;
        font-size:24px;
        line-height:1;
        color:#667085;
        cursor:pointer;
      }

      .p4-modal-body {
        padding:22px;
      }

      .p4-field {
        margin-bottom:15px;
      }

      .p4-field label {
        display:block;
        margin-bottom:6px;
        font-size:12px;
        font-weight:600;
        color:#344054;
      }

      .p4-field input,
      .p4-field select {
        width:100%;
        height:42px;
        box-sizing:border-box;
        padding:0 12px;
        border:1px solid #d0d5dd;
        border-radius:8px;
        outline:none;
        color:#101828;
        background:#fff;
      }

      .p4-field input:focus,
      .p4-field select:focus {
        border-color:#98a2b3;
        box-shadow:0 0 0 3px rgba(16,24,40,.05);
      }

      .p4-form-grid {
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:14px;
      }

      .p4-modal-foot {
        display:flex;
        justify-content:flex-end;
        gap:9px;
        padding:16px 22px;
        border-top:1px solid #eaecf0;
      }

      .p4-btn-secondary {
        height:40px;
        padding:0 15px;
        border:1px solid #d0d5dd;
        border-radius:8px;
        background:#fff;
        color:#344054;
        font-weight:600;
        cursor:pointer;
      }

      .p4-btn-primary {
        height:40px;
        padding:0 16px;
        border:0;
        border-radius:8px;
        background:#101828;
        color:#fff;
        font-weight:600;
        cursor:pointer;
      }

      .p4-confirm {
        text-align:center;
      }

      .p4-confirm-icon {
        width:48px;
        height:48px;
        margin:0 auto 14px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#fef3f2;
        color:#b42318;
        font-size:22px;
        font-weight:700;
      }

      .p4-confirm p {
        margin:7px 0 0;
        color:#667085;
        font-size:13px;
        line-height:1.5;
      }

      @media(max-width:1000px) {
        .p4-kpis {
          grid-template-columns:repeat(2,minmax(0,1fr));
        }
      }

      @media(max-width:600px) {
        .p4-header {
          align-items:stretch;
          flex-direction:column;
        }

        .p4-primary {
          width:100%;
        }

        .p4-kpis {
          grid-template-columns:1fr;
        }

        .p4-input {
          width:100%;
        }

        .p4-select {
          width:100%;
        }

        .p4-filters {
          width:100%;
        }

        .p4-modal {
          max-height:90vh;
          overflow:auto;
        }

        .p4-form-grid {
          grid-template-columns:1fr;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function closeModal() {

    const overlay =
      document.getElementById("productsV4Modal");

    if (overlay) {
      overlay.classList.remove("show");
    }

  }

  function openModal(title, body, footer) {

    let overlay =
      document.getElementById("productsV4Modal");

    if (!overlay) {

      overlay = document.createElement("div");

      overlay.id = "productsV4Modal";
      overlay.className = "p4-modal-overlay";

      document.body.appendChild(overlay);

    }

    overlay.innerHTML = `
      <div class="p4-modal">

        <div class="p4-modal-head">

          <h3>${title}</h3>

          <button
            class="p4-close"
            id="p4CloseModal">
            ×
          </button>

        </div>

        <div class="p4-modal-body">
          ${body}
        </div>

        <div class="p4-modal-foot">
          ${footer}
        </div>

      </div>
    `;

    overlay.classList.add("show");

    document
      .getElementById("p4CloseModal")
      .onclick = closeModal;

    overlay.onclick = function(e) {

      if (e.target === overlay) {
        closeModal();
      }

    };

  }

  function showProductForm(product) {

    const editing = !!product;

    openModal(
      editing ? "Edit Product" : "Add Product",

      `
        <div class="p4-form-grid">

          <div class="p4-field">
            <label>Product Name</label>
            <input
              id="p4Name"
              value="${esc(product?.name || "")}"
              placeholder="Business Starter">
          </div>

          <div class="p4-field">
            <label>SKU</label>
            <input
              id="p4Sku"
              value="${esc(product?.sku || "")}"
              placeholder="BS-001">
          </div>

        </div>

        <div class="p4-field">

          <label>Category</label>

          <select id="p4Category">

            <option ${
              product?.category === "Software"
                ? "selected"
                : ""
            }>Software</option>

            <option ${
              product?.category === "Enterprise"
                ? "selected"
                : ""
            }>Enterprise</option>

            <option ${
              product?.category === "Add-on"
                ? "selected"
                : ""
            }>Add-on</option>

            <option ${
              product?.category === "Service"
                ? "selected"
                : ""
            }>Service</option>

            <option ${
              product?.category === "Other"
                ? "selected"
                : ""
            }>Other</option>

          </select>

        </div>

        <div class="p4-form-grid">

          <div class="p4-field">
            <label>Selling Price</label>
            <input
              id="p4Price"
              type="number"
              min="0"
              value="${Number(product?.price || 0)}">
          </div>

          <div class="p4-field">
            <label>Cost</label>
            <input
              id="p4Cost"
              type="number"
              min="0"
              value="${Number(product?.cost || 0)}">
          </div>

        </div>

        <div class="p4-form-grid">

          <div class="p4-field">
            <label>Stock</label>
            <input
              id="p4Stock"
              type="number"
              min="0"
              value="${Number(product?.stock || 0)}">
          </div>

          <div class="p4-field">
            <label>Target Stock</label>
            <input
              id="p4Target"
              type="number"
              min="0"
              value="${Number(product?.targetStock || 0)}">
          </div>

        </div>
      `,

      `
        <button
          class="p4-btn-secondary"
          id="p4Cancel">
          Cancel
        </button>

        <button
          class="p4-btn-primary"
          id="p4Save">
          ${editing ? "Save Changes" : "Add Product"}
        </button>
      `
    );

    document
      .getElementById("p4Cancel")
      .onclick = closeModal;

    document
      .getElementById("p4Save")
      .onclick = function() {

        const name =
          document.getElementById("p4Name").value.trim();

        const sku =
          document.getElementById("p4Sku").value.trim();

        const category =
          document.getElementById("p4Category").value;

        const price =
          Number(document.getElementById("p4Price").value);

        const cost =
          Number(document.getElementById("p4Cost").value);

        const stock =
          Number(document.getElementById("p4Stock").value);

        const target =
          Number(document.getElementById("p4Target").value);

        if (!name) {
          alert("Product Name wajib diisi.");
          return;
        }

        if (!sku) {
          alert("SKU wajib diisi.");
          return;
        }

        if (
          !Number.isFinite(price) ||
          price < 0 ||
          !Number.isFinite(cost) ||
          cost < 0 ||
          !Number.isFinite(stock) ||
          stock < 0 ||
          !Number.isFinite(target) ||
          target < 0
        ) {
          alert("Periksa kembali angka yang dimasukkan.");
          return;
        }

        const products = getProducts();

        if (editing) {

          const index =
            products.findIndex(
              p => Number(p.id) === Number(product.id)
            );

          if (index === -1) return;

          products[index] = {
            ...products[index],
            name,
            sku,
            category,
            price,
            cost,
            stock,
            targetStock: target
          };

        } else {

          products.push({
            id: Date.now(),
            name,
            sku,
            category,
            price,
            cost,
            stock,
            targetStock: target,
            sold: 0
          });

        }

        saveProducts(products);
        closeModal();
        renderV4();

      };

  }

  function showStockForm(product) {

    openModal(
      "Update Stock",

      `
        <div style="
          padding:12px 14px;
          background:#f9fafb;
          border:1px solid #eaecf0;
          border-radius:9px;
          margin-bottom:18px;
        ">

          <strong style="
            display:block;
            color:#101828;
            margin-bottom:4px;
          ">
            ${esc(product.name)}
          </strong>

          <span style="
            color:#667085;
            font-size:12px;
          ">
            Current stock: ${product.stock}
          </span>

        </div>

        <div class="p4-field">

          <label>New Stock Quantity</label>

          <input
            id="p4NewStock"
            type="number"
            min="0"
            value="${Number(product.stock || 0)}">

        </div>

        <div class="p4-field">

          <label>Target Stock</label>

          <input
            id="p4NewTarget"
            type="number"
            min="0"
            value="${Number(product.targetStock || 0)}">

        </div>
      `,

      `
        <button
          class="p4-btn-secondary"
          id="p4Cancel">
          Cancel
        </button>

        <button
          class="p4-btn-primary"
          id="p4Save">
          Update Stock
        </button>
      `
    );

    document
      .getElementById("p4Cancel")
      .onclick = closeModal;

    document
      .getElementById("p4Save")
      .onclick = function() {

        const stock =
          Number(
            document.getElementById(
              "p4NewStock"
            ).value
          );

        const target =
          Number(
            document.getElementById(
              "p4NewTarget"
            ).value
          );

        if (
          !Number.isFinite(stock) ||
          stock < 0 ||
          !Number.isFinite(target) ||
          target < 0
        ) {
          alert("Nilai stock tidak valid.");
          return;
        }

        const products = getProducts();

        const item =
          products.find(
            p => Number(p.id) === Number(product.id)
          );

        if (!item) return;

        item.stock = stock;
        item.targetStock = target;

        saveProducts(products);

        closeModal();
        renderV4();

      };

  }

  function showDeleteConfirm(product) {

    openModal(
      "Delete Product",

      `
        <div class="p4-confirm">

          <div class="p4-confirm-icon">
            !
          </div>

          <strong style="
            color:#101828;
            font-size:16px;
          ">
            Delete ${esc(product.name)}?
          </strong>

          <p>
            Product ini akan dihapus dari daftar
            Products. Tindakan ini tidak dapat
            dibatalkan.
          </p>

        </div>
      `,

      `
        <button
          class="p4-btn-secondary"
          id="p4Cancel">
          Cancel
        </button>

        <button
          class="p4-btn-primary"
          id="p4Delete"
          style="background:#b42318">
          Delete Product
        </button>
      `
    );

    document
      .getElementById("p4Cancel")
      .onclick = closeModal;

    document
      .getElementById("p4Delete")
      .onclick = function() {

        const products =
          getProducts().filter(
            p =>
              Number(p.id) !==
              Number(product.id)
          );

        saveProducts(products);

        closeModal();
        renderV4();

      };

  }

  function renderV4() {

    const content =
      document.querySelector(".content");

    if (!content) return;

    const title =
      content.querySelector("h1");

    if (
      title &&
      title.textContent.trim() !== "Products"
    ) {
      return;
    }

    ensureStyles();

    const products = getProducts();

    const totalValue =
      products.reduce(
        (sum, p) =>
          sum +
          Number(p.price || 0) *
          Number(p.stock || 0),
        0
      );

    const totalSold =
      products.reduce(
        (sum, p) =>
          sum +
          Number(p.sold || 0),
        0
      );

    const low =
      products.filter(
        p =>
          Number(p.stock || 0) <
          Number(p.targetStock || 0)
      );

    const categories =
      [...new Set(
        products.map(p => p.category)
      )];

    content.innerHTML = `

      <div class="p4-page">

        <div class="p4-header">

          <div class="p4-title">
            <h1>Products</h1>
            <p>
              Manage products, pricing and inventory
              from one place
            </p>
          </div>

          <button
            class="p4-primary"
            id="p4Add">
            + Add Product
          </button>

        </div>

        <div class="p4-kpis">

          <div class="p4-kpi">
            <div class="p4-kpi-label">
              Total Products
            </div>
            <div class="p4-kpi-value">
              ${products.length}
            </div>
          </div>

          <div class="p4-kpi">
            <div class="p4-kpi-label">
              Inventory Value
            </div>
            <div class="p4-kpi-value">
              ${money(totalValue)}
            </div>
          </div>

          <div class="p4-kpi">
            <div class="p4-kpi-label">
              Units Sold
            </div>
            <div class="p4-kpi-value">
              ${totalSold}
            </div>
          </div>

          <div class="p4-kpi">
            <div class="p4-kpi-label">
              Low Stock
            </div>
            <div class="p4-kpi-value">
              ${low.length}
            </div>
          </div>

        </div>

        <div class="p4-card">

          <div class="p4-toolbar">

            <div>
              <h2>Product Catalog</h2>
              <p>
                View and manage your complete product list
              </p>
            </div>

            <div class="p4-filters">

              <input
                class="p4-input"
                id="p4Search"
                placeholder="Search product, SKU...">

              <select
                class="p4-select"
                id="p4Category">

                <option value="all">
                  All Categories
                </option>

                ${categories.map(c => `
                  <option value="${esc(c)}">
                    ${esc(c)}
                  </option>
                `).join("")}

              </select>

            </div>

          </div>

          <div class="p4-table-wrap">

            <table class="p4-table">

              <thead>

                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Margin</th>
                  <th>Stock</th>
                  <th>Sold</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody id="p4Body"></tbody>

            </table>

          </div>

        </div>

        <div class="p4-card">

          <div class="p4-toolbar">

            <div>
              <h2>Inventory Alert</h2>
              <p>
                Products that require stock attention
              </p>
            </div>

          </div>

          ${
            low.length
              ? `
                <div class="p4-alert">

                  ${low.map(p => `
                    <div class="p4-alert-item">

                      <span class="p4-alert-name">
                        ${esc(p.name)}
                      </span>

                      <span class="p4-alert-stock">
                        ${p.stock} / target ${p.targetStock}
                      </span>

                    </div>
                  `).join("")}

                </div>
              `
              : `
                <div style="
                  padding:15px;
                  border-radius:10px;
                  background:#ecfdf3;
                  border:1px solid #abefc6;
                  color:#027a48;
                  font-size:13px;
                ">
                  ✓ Semua inventory berada pada level sehat.
                </div>
              `
          }

        </div>

      </div>

    `;

    const body =
      document.getElementById("p4Body");

    const search =
      document.getElementById("p4Search");

    const category =
      document.getElementById("p4Category");

    function draw() {

      const keyword =
        String(search.value || "").toLowerCase();

      const selected =
        category.value;

      const filtered =
        products.filter(function(p) {

          const matchesText =
            String(p.name)
              .toLowerCase()
              .includes(keyword) ||
            String(p.sku)
              .toLowerCase()
              .includes(keyword);

          const matchesCategory =
            selected === "all" ||
            p.category === selected;

          return matchesText &&
            matchesCategory;

        });

      body.innerHTML =
        filtered.map(function(p) {

          const margin =
            Number(p.price) > 0
              ? Math.round(
                  (
                    (Number(p.price) -
                    Number(p.cost)) /
                    Number(p.price)
                  ) * 100
                )
              : 0;

          const isLow =
            Number(p.stock) <
            Number(p.targetStock);

          return `

            <tr>

              <td>

                <div class="p4-product-name">
                  ${esc(p.name)}
                </div>

                <div class="p4-product-sku">
                  ${esc(p.sku)}
                </div>

              </td>

              <td>
                ${esc(p.category)}
              </td>

              <td>
                ${money(p.price)}
              </td>

              <td>
                <strong>${margin}%</strong>
              </td>

              <td>
                <strong>${p.stock}</strong>
                / ${p.targetStock}
              </td>

              <td>
                ${p.sold || 0}
              </td>

              <td>

                <span class="
                  p4-badge
                  ${isLow ? "p4-low" : "p4-good"}
                ">
                  ${isLow ? "Low Stock" : "Healthy"}
                </span>

              </td>

              <td>

                <div class="p4-actions">

                  <button
                    class="p4-action"
                    data-p4-action="stock"
                    data-id="${p.id}">
                    Stock
                  </button>

                  <button
                    class="p4-action"
                    data-p4-action="edit"
                    data-id="${p.id}">
                    Edit
                  </button>

                  <button
                    class="
                      p4-action
                      p4-action-danger
                    "
                    data-p4-action="delete"
                    data-id="${p.id}">
                    Delete
                  </button>

                </div>

              </td>

            </tr>

          `;

        }).join("");

    }

    draw();

    search.addEventListener(
      "input",
      draw
    );

    category.addEventListener(
      "change",
      draw
    );

    document
      .getElementById("p4Add")
      .onclick = function() {
        showProductForm(null);
      };

    body.addEventListener(
      "click",
      function(event) {

        const button =
          event.target.closest(
            "[data-p4-action]"
          );

        if (!button) return;

        const id =
          Number(button.dataset.id);

        const product =
          getProducts().find(
            p => Number(p.id) === id
          );

        if (!product) return;

        const action =
          button.dataset.p4Action;

        if (action === "edit") {
          showProductForm(product);
        }

        if (action === "stock") {
          showStockForm(product);
        }

        if (action === "delete") {
          showDeleteConfirm(product);
        }

      }
    );

  }

  document.addEventListener(
    "click",
    function(event) {

      const button =
        event.target.closest(
          '[data-page="products"]'
        );

      if (!button) return;

      /*
       * Existing Products renderers finish first.
       * V4 becomes the final renderer.
       */
      setTimeout(
        renderV4,
        150
      );

    }
  );

})();




/* =========================================================
   DASHBOARD UI V4 — PREMIUM BUSINESS CONTROL CENTER
   UI ONLY / SAFE REPLACEMENT
   ========================================================= */
(function () {
  "use strict";

  const TX_KEY = "businessHubTransactions";
  const SALES_KEY = "businessHubSalesSafe";
  const PRODUCT_KEY = "businessHubProductsV3";
  const CUSTOMER_KEY = "businessHubCustomersSafe";
  const TARGET_KEY = "businessHubSalesTargetsV1";

  const money = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
  const num = (n) => Number(n || 0);

  function read(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v == null ? fallback : v;
    } catch {
      return fallback;
    }
  }

  function monthKey() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  }

  function formatDate(v) {
    if (!v) return "-";
    const d = new Date(v);
    if (isNaN(d)) return v;
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function renderDashboard() {
    const activePage = document.querySelector(".nav-item.active[data-page]");
    if (activePage && activePage.dataset.page !== "dashboard") {
      return;
    }

    const content = document.querySelector(".content");
    if (!content) return;

    const transactions = read(TX_KEY, []);
    const sales = read(SALES_KEY, []);
    const products = read(PRODUCT_KEY, []);
    const customers = read(CUSTOMER_KEY, []);
    const targetData = read(TARGET_KEY, {});

    const currentMonth = monthKey();

    const monthTx = transactions.filter(t => {
      const d = String(t.date || "");
      return d.startsWith(currentMonth);
    });

    const revenue = monthTx
      .filter(t => String(t.type).toLowerCase() === "income")
      .reduce((a, t) => a + num(t.amount), 0);

    const expenses = monthTx
      .filter(t => String(t.type).toLowerCase() === "expense")
      .reduce((a, t) => a + num(t.amount), 0);

    const profit = revenue - expenses;
    const margin = revenue ? (profit / revenue) * 100 : 0;

    const salesMonth = sales.filter(s => {
      const d = String(s.date || "");
      return d.includes("Sep 2026") || d.startsWith(currentMonth);
    });

    const salesRevenue = salesMonth.reduce((a, s) => a + num(s.amount), 0);

    const inventoryValue = products.reduce(
      (a, p) => a + (num(p.stock) * num(p.cost || p.price)),
      0
    );

    const lowStock = products.filter(p =>
      num(p.stock) <= num(p.target || 10)
    );

    const target = num(targetData.revenueTarget || 100000000);
    const targetPct = target ? Math.min((salesRevenue / target) * 100, 100) : 0;

    const topProducts = [...products]
      .sort((a, b) => num(b.sold) - num(a.sold))
      .slice(0, 5);

    const topCustomers = [...customers]
      .sort((a, b) => num(b.revenue) - num(a.revenue))
      .slice(0, 5);

    const opportunities = [];

    if (profit < 0) {
      opportunities.push({
        level: "critical",
        title: "Profit bulan ini negatif",
        text: "Pengeluaran lebih besar dari revenue.",
        action: "expenses"
      });
    }

    if (revenue && expenses / revenue >= 0.6) {
      opportunities.push({
        level: "high",
        title: "Expense ratio tinggi",
        text: "Pengeluaran sudah lebih dari 60% revenue.",
        action: "expenses"
      });
    }

    if (targetPct < 70) {
      opportunities.push({
        level: "high",
        title: "Target sales masih tertinggal",
        text: "Pencapaian target revenue di bawah 70%.",
        action: "sales"
      });
    }

    if (lowStock.length) {
      opportunities.push({
        level: "medium",
        title: lowStock.length + " produk perlu perhatian",
        text: "Beberapa produk berada di level stock rendah.",
        action: "products"
      });
    }

    if (!opportunities.length) {
      opportunities.push({
        level: "positive",
        title: "Operasional terlihat stabil",
        text: "Tidak ada alert utama yang terdeteksi.",
        action: "sales"
      });
    }

    const recent = [...transactions]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 6);

    const maxProductSold = Math.max(
      1,
      ...topProducts.map(p => num(p.sold))
    );

    const maxCustomerRevenue = Math.max(
      1,
      ...topCustomers.map(c => num(c.revenue))
    );

    const css = `
      <style>
        .bh4 {
          --ink:#182230;
          --muted:#7b8798;
          --line:#e8edf3;
          --soft:#f6f8fb;
          --card:#ffffff;
          --accent:#2563eb;
          --green:#159570;
          --red:#dc4b5a;
          --orange:#d98216;
          max-width:1500px;
          margin:0 auto;
          color:var(--ink);
          font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        }

        .bh4 * { box-sizing:border-box; }

        .bh4-head {
          display:flex;
          justify-content:space-between;
          align-items:flex-end;
          gap:24px;
          margin-bottom:26px;
        }

        .bh4-eyebrow {
          font-size:11px;
          font-weight:800;
          letter-spacing:.14em;
          text-transform:uppercase;
          color:var(--accent);
          margin-bottom:7px;
        }

        .bh4-title {
          margin:0;
          font-size:30px;
          line-height:1.15;
          letter-spacing:-.04em;
          font-weight:800;
        }

        .bh4-sub {
          margin:8px 0 0;
          color:var(--muted);
          font-size:14px;
        }

        .bh4-head-actions {
          display:flex;
          align-items:center;
          gap:10px;
        }

        .bh4-select,
        .bh4-btn {
          height:42px;
          border:1px solid var(--line);
          background:#fff;
          border-radius:11px;
          padding:0 14px;
          font-size:13px;
          font-weight:700;
          color:var(--ink);
          cursor:pointer;
        }

        .bh4-btn {
          background:var(--ink);
          color:#fff;
          border-color:var(--ink);
        }

        .bh4-btn:hover { opacity:.9; }

        .bh4-kpis {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:14px;
          margin-bottom:16px;
        }

        .bh4-kpi {
          background:var(--card);
          border:1px solid var(--line);
          border-radius:16px;
          padding:20px;
          min-height:145px;
          box-shadow:0 5px 20px rgba(20,30,45,.035);
        }

        .bh4-kpi-top {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
        }

        .bh4-kpi-label {
          color:var(--muted);
          font-size:12px;
          font-weight:700;
        }

        .bh4-icon {
          width:34px;
          height:34px;
          border-radius:10px;
          display:grid;
          place-items:center;
          background:var(--soft);
          font-size:15px;
        }

        .bh4-kpi-value {
          margin-top:18px;
          font-size:25px;
          line-height:1;
          font-weight:800;
          letter-spacing:-.035em;
        }

        .bh4-kpi-foot {
          margin-top:12px;
          color:var(--muted);
          font-size:11px;
        }

        .bh4-positive { color:var(--green); }
        .bh4-negative { color:var(--red); }

        .bh4-grid-main {
          display:grid;
          grid-template-columns:minmax(0,1.65fr) minmax(300px,.85fr);
          gap:16px;
          margin-bottom:16px;
        }

        .bh4-card {
          background:#fff;
          border:1px solid var(--line);
          border-radius:16px;
          box-shadow:0 5px 20px rgba(20,30,45,.035);
          overflow:hidden;
        }

        .bh4-card-head {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          padding:20px 20px 12px;
        }

        .bh4-card-title {
          margin:0;
          font-size:15px;
          font-weight:800;
        }

        .bh4-card-desc {
          margin:4px 0 0;
          font-size:11px;
          color:var(--muted);
        }

        .bh4-chart {
          height:250px;
          padding:18px 20px 20px;
          display:flex;
          align-items:flex-end;
          gap:9px;
        }

        .bh4-bar-day {
          flex:1;
          min-width:0;
          height:100%;
          display:flex;
          flex-direction:column;
          justify-content:flex-end;
          gap:5px;
        }

        .bh4-bars {
          height:205px;
          display:flex;
          align-items:flex-end;
          justify-content:center;
          gap:4px;
        }

        .bh4-bar {
          width:42%;
          min-height:3px;
          border-radius:5px 5px 2px 2px;
        }

        .bh4-bar.rev { background:#2563eb; }
        .bh4-bar.exp { background:#d9dee7; }

        .bh4-day-label {
          text-align:center;
          color:#9aa4b2;
          font-size:9px;
        }

        .bh4-legend {
          display:flex;
          gap:15px;
          padding:0 20px 16px;
          font-size:10px;
          color:var(--muted);
        }

        .bh4-dot {
          width:8px;
          height:8px;
          display:inline-block;
          border-radius:50%;
          margin-right:5px;
        }

        .bh4-progress-wrap {
          padding:4px 20px 22px;
        }

        .bh4-progress-label {
          display:flex;
          justify-content:space-between;
          margin-bottom:9px;
          font-size:12px;
          font-weight:700;
        }

        .bh4-progress {
          height:9px;
          background:#edf1f5;
          border-radius:99px;
          overflow:hidden;
        }

        .bh4-progress > span {
          display:block;
          height:100%;
          background:#2563eb;
          border-radius:inherit;
        }

        .bh4-margin {
          text-align:center;
          padding:12px 20px 25px;
        }

        .bh4-margin-value {
          font-size:46px;
          font-weight:850;
          letter-spacing:-.06em;
          line-height:1;
        }

        .bh4-margin-label {
          margin-top:8px;
          color:var(--muted);
          font-size:12px;
        }

        .bh4-op {
          display:flex;
          align-items:flex-start;
          gap:11px;
          padding:12px 20px;
          border-top:1px solid #f0f2f5;
        }

        .bh4-op:first-of-type { border-top:0; }

        .bh4-severity {
          width:8px;
          min-width:8px;
          height:8px;
          border-radius:50%;
          margin-top:5px;
          background:#94a3b8;
        }

        .bh4-severity.critical,
        .bh4-severity.high { background:#dc4b5a; }

        .bh4-severity.medium { background:#d98216; }
        .bh4-severity.positive { background:#159570; }

        .bh4-op-body { flex:1; min-width:0; }

        .bh4-op-title {
          font-size:12px;
          font-weight:800;
        }

        .bh4-op-text {
          margin-top:3px;
          font-size:10px;
          line-height:1.45;
          color:var(--muted);
        }

        .bh4-op-link {
          border:0;
          background:none;
          padding:0;
          color:var(--accent);
          font-size:10px;
          font-weight:800;
          cursor:pointer;
          white-space:nowrap;
        }

        .bh4-two {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:16px;
          margin-bottom:16px;
        }

        .bh4-list {
          padding:4px 20px 16px;
        }

        .bh4-product {
          display:grid;
          grid-template-columns:28px 1fr auto;
          gap:10px;
          align-items:center;
          padding:11px 0;
          border-bottom:1px solid #f0f2f5;
        }

        .bh4-rank {
          width:28px;
          height:28px;
          border-radius:8px;
          display:grid;
          place-items:center;
          background:var(--soft);
          font-size:10px;
          font-weight:800;
          color:#667085;
        }

        .bh4-name {
          font-size:12px;
          font-weight:750;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }

        .bh4-mini {
          margin-top:6px;
          height:5px;
          background:#edf1f5;
          border-radius:99px;
          overflow:hidden;
        }

        .bh4-mini span {
          display:block;
          height:100%;
          background:#2563eb;
          border-radius:99px;
        }

        .bh4-value {
          text-align:right;
          font-size:11px;
          font-weight:800;
        }

        .bh4-table {
          width:100%;
          border-collapse:collapse;
          font-size:11px;
        }

        .bh4-table th {
          padding:10px 20px;
          text-align:left;
          color:#9aa4b2;
          font-size:9px;
          font-weight:800;
          text-transform:uppercase;
          letter-spacing:.08em;
          border-bottom:1px solid var(--line);
        }

        .bh4-table td {
          padding:12px 20px;
          border-bottom:1px solid #f0f2f5;
        }

        .bh4-type {
          font-weight:800;
        }

        .bh4-type.income { color:var(--green); }
        .bh4-type.expense { color:var(--red); }

        .bh4-actions {
          display:grid;
          grid-template-columns:repeat(5,1fr);
          gap:10px;
          padding:0 0 20px;
        }

        .bh4-action {
          border:1px solid var(--line);
          background:#fff;
          border-radius:13px;
          padding:14px 12px;
          cursor:pointer;
          text-align:left;
          transition:.15s ease;
        }

        .bh4-action:hover {
          border-color:#c9d5e5;
          transform:translateY(-1px);
        }

        .bh4-action-icon {
          font-size:16px;
          margin-bottom:10px;
        }

        .bh4-action-title {
          font-size:11px;
          font-weight:800;
        }

        .bh4-action-desc {
          margin-top:3px;
          font-size:9px;
          color:var(--muted);
        }

        .bh4-empty {
          padding:25px 20px;
          text-align:center;
          color:var(--muted);
          font-size:11px;
        }

        @media(max-width:1050px) {
          .bh4-kpis { grid-template-columns:repeat(2,1fr); }
          .bh4-grid-main { grid-template-columns:1fr; }
          .bh4-actions { grid-template-columns:repeat(3,1fr); }
        }

        @media(max-width:720px) {
          .bh4-head {
            align-items:flex-start;
            flex-direction:column;
          }

          .bh4-head-actions {
            width:100%;
          }

          .bh4-select,
          .bh4-btn {
            flex:1;
          }

          .bh4-title { font-size:24px; }

          .bh4-kpis {
            grid-template-columns:1fr 1fr;
            gap:9px;
          }

          .bh4-kpi {
            min-height:125px;
            padding:15px;
          }

          .bh4-kpi-value {
            font-size:19px;
            margin-top:14px;
          }

          .bh4-two {
            grid-template-columns:1fr;
          }

          .bh4-actions {
            grid-template-columns:1fr 1fr;
          }

          .bh4-card-head {
            padding-left:15px;
            padding-right:15px;
          }

          .bh4-chart {
            padding-left:12px;
            padding-right:12px;
          }

          .bh4-table th,
          .bh4-table td {
            padding-left:12px;
            padding-right:12px;
          }

          .bh4-table th:nth-child(3),
          .bh4-table td:nth-child(3) {
            display:none;
          }
        }
      </style>
    `;

    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);

      const rev = transactions
        .filter(t => String(t.date || "").slice(0,10) === key && String(t.type).toLowerCase() === "income")
        .reduce((a,t) => a + num(t.amount), 0);

      const exp = transactions
        .filter(t => String(t.date || "").slice(0,10) === key && String(t.type).toLowerCase() === "expense")
        .reduce((a,t) => a + num(t.amount), 0);

      last7.push({ d, rev, exp });
    }

    const maxChart = Math.max(
      1,
      ...last7.flatMap(x => [x.rev, x.exp])
    );

    const chart = last7.map(x => `
      <div class="bh4-bar-day">
        <div class="bh4-bars">
          <span class="bh4-bar rev" style="height:${Math.max(3,(x.rev/maxChart)*100)}%"></span>
          <span class="bh4-bar exp" style="height:${Math.max(3,(x.exp/maxChart)*100)}%"></span>
        </div>
        <div class="bh4-day-label">${x.d.toLocaleDateString("id-ID",{day:"2-digit",month:"short"})}</div>
      </div>
    `).join("");

    const opportunityHtml = opportunities.slice(0,4).map(o => `
      <div class="bh4-op">
        <span class="bh4-severity ${o.level}"></span>
        <div class="bh4-op-body">
          <div class="bh4-op-title">${o.title}</div>
          <div class="bh4-op-text">${o.text}</div>
        </div>
        <button class="bh4-op-link" data-page="${o.action}">View</button>
      </div>
    `).join("");

    const productsHtml = topProducts.length
      ? topProducts.map((p,i) => `
        <div class="bh4-product">
          <div class="bh4-rank">${i+1}</div>
          <div>
            <div class="bh4-name">${p.name || "Unnamed Product"}</div>
            <div class="bh4-mini">
              <span style="width:${Math.min(100,(num(p.sold)/maxProductSold)*100)}%"></span>
            </div>
          </div>
          <div class="bh4-value">${num(p.sold)} sold</div>
        </div>
      `).join("")
      : `<div class="bh4-empty">Belum ada data produk.</div>`;

    const customersHtml = topCustomers.length
      ? topCustomers.map((c,i) => `
        <div class="bh4-product">
          <div class="bh4-rank">${i+1}</div>
          <div>
            <div class="bh4-name">${c.name || c.company || "Customer"}</div>
            <div class="bh4-mini">
              <span style="width:${Math.min(100,(num(c.revenue)/maxCustomerRevenue)*100)}%"></span>
            </div>
          </div>
          <div class="bh4-value">${money(c.revenue)}</div>
        </div>
      `).join("")
      : `<div class="bh4-empty">Belum ada data customer.</div>`;

    const recentHtml = recent.length
      ? recent.map(t => `
        <tr>
          <td>${formatDate(t.date)}</td>
          <td>${t.description || t.category || "-"}</td>
          <td>${t.category || "-"}</td>
          <td class="bh4-type ${String(t.type).toLowerCase()}">
            ${String(t.type).toLowerCase() === "income" ? "+" : "-"} ${money(t.amount)}
          </td>
        </tr>
      `).join("")
      : `<tr><td colspan="4" class="bh4-empty">Belum ada transaksi.</td></tr>`;

    content.innerHTML = `
      <div class="bh4">
        ${css}

        <div class="bh4-head">
          <div>
            <div class="bh4-eyebrow">Business Control Center</div>
            <h1 class="bh4-title">Executive Dashboard</h1>
            <p class="bh4-sub">Pantau kesehatan bisnis, performa penjualan, dan peluang tindakan dalam satu layar.</p>
          </div>

          <div class="bh4-head-actions">
            <select class="bh4-select" id="bh4-period">
              <option value="30">30 hari</option>
              <option value="90">90 hari</option>
              <option value="365">1 tahun</option>
            </select>
            <button class="bh4-btn bh4-quick-toggle" id="bh4-quick-toggle" type="button">
              ⚡ Quick Action
            </button>
            <button class="bh4-btn" id="bh4-refresh" type="button">↻ Refresh</button>
          </div>
        </div>

        <div class="bh4-kpis">
          <div class="bh4-kpi">
            <div class="bh4-kpi-top">
              <span class="bh4-kpi-label">Revenue</span>
              <span class="bh4-icon">↗</span>
            </div>
            <div class="bh4-kpi-value">${money(revenue)}</div>
            <div class="bh4-kpi-foot">Pendapatan bulan berjalan</div>
          </div>

          <div class="bh4-kpi">
            <div class="bh4-kpi-top">
              <span class="bh4-kpi-label">Expenses</span>
              <span class="bh4-icon">↘</span>
            </div>
            <div class="bh4-kpi-value">${money(expenses)}</div>
            <div class="bh4-kpi-foot">Total pengeluaran bulan berjalan</div>
          </div>

          <div class="bh4-kpi">
            <div class="bh4-kpi-top">
              <span class="bh4-kpi-label">Net Profit</span>
              <span class="bh4-icon">✓</span>
            </div>
            <div class="bh4-kpi-value ${profit >= 0 ? "bh4-positive" : "bh4-negative"}">${money(profit)}</div>
            <div class="bh4-kpi-foot">${margin.toFixed(1)}% profit margin</div>
          </div>

          <div class="bh4-kpi">
            <div class="bh4-kpi-top">
              <span class="bh4-kpi-label">Inventory Value</span>
              <span class="bh4-icon">▣</span>
            </div>
            <div class="bh4-kpi-value">${money(inventoryValue)}</div>
            <div class="bh4-kpi-foot">${lowStock.length} produk perlu perhatian</div>
          </div>
        </div>

        <div class="bh4-grid-main">
          <section class="bh4-card">
            <div class="bh4-card-head">
              <div>
                <h3 class="bh4-card-title">Revenue vs Expenses</h3>
                <p class="bh4-card-desc">Pergerakan keuangan 7 hari terakhir</p>
              </div>
            </div>

            <div class="bh4-chart">${chart}</div>

            <div class="bh4-legend">
              <span><i class="bh4-dot" style="background:#2563eb"></i>Revenue</span>
              <span><i class="bh4-dot" style="background:#d9dee7"></i>Expenses</span>
            </div>
          </section>

          <section class="bh4-card">
            <div class="bh4-card-head">
              <div>
                <h3 class="bh4-card-title">Sales Performance</h3>
                <p class="bh4-card-desc">Progress terhadap target revenue</p>
              </div>
            </div>

            <div class="bh4-progress-wrap">
              <div class="bh4-progress-label">
                <span>${money(salesRevenue)}</span>
                <span>${targetPct.toFixed(0)}%</span>
              </div>
              <div class="bh4-progress">
                <span style="width:${targetPct}%"></span>
              </div>
              <div class="bh4-kpi-foot">Target ${money(target)}</div>
            </div>

            <div class="bh4-margin">
              <div class="bh4-margin-value">${margin.toFixed(1)}%</div>
              <div class="bh4-margin-label">Net Profit Margin</div>
            </div>
          </section>
        </div>

        <div class="bh4-card" style="margin-bottom:16px">
          <div class="bh4-card-head">
            <div>
              <h3 class="bh4-card-title">Opportunity Center</h3>
              <p class="bh4-card-desc">Area yang membutuhkan perhatian atau tindakan</p>
            </div>
          </div>
          ${opportunityHtml}
        </div>

        <div class="bh4-two">
          <section class="bh4-card">
            <div class="bh4-card-head">
              <div>
                <h3 class="bh4-card-title">Top Products</h3>
                <p class="bh4-card-desc">Produk berdasarkan jumlah terjual</p>
              </div>
              <button class="bh4-op-link" data-page="products">View all</button>
            </div>
            <div class="bh4-list">${productsHtml}</div>
          </section>

          <section class="bh4-card">
            <div class="bh4-card-head">
              <div>
                <h3 class="bh4-card-title">Top Customers</h3>
                <p class="bh4-card-desc">Customer berdasarkan revenue</p>
              </div>
              <button class="bh4-op-link" data-page="customers">View all</button>
            </div>
            <div class="bh4-list">${customersHtml}</div>
          </section>
        </div>

        <section class="bh4-card" style="margin-bottom:16px">
          <div class="bh4-card-head">
            <div>
              <h3 class="bh4-card-title">Recent Transactions</h3>
              <p class="bh4-card-desc">Aktivitas keuangan terbaru</p>
            </div>
            <button class="bh4-op-link" data-page="transactions">View all</button>
          </div>

          <div style="overflow-x:auto">
            <table class="bh4-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>${recentHtml}</tbody>
            </table>
          </div>
        </section>

        <div class="bh4-actions">
          <button class="bh4-action" data-page="transactions">
            <div class="bh4-action-icon">＋</div>
            <div class="bh4-action-title">Transaction</div>
            <div class="bh4-action-desc">Catat pemasukan / pengeluaran</div>
          </button>

          <button class="bh4-action" data-page="sales">
            <div class="bh4-action-icon">↗</div>
            <div class="bh4-action-title">Sales</div>
            <div class="bh4-action-desc">Lihat performa penjualan</div>
          </button>

          <button class="bh4-action" data-page="customers">
            <div class="bh4-action-icon">♙</div>
            <div class="bh4-action-title">Customer</div>
            <div class="bh4-action-desc">Kelola customer</div>
          </button>

          <button class="bh4-action" data-page="products">
            <div class="bh4-action-icon">▦</div>
            <div class="bh4-action-title">Products</div>
            <div class="bh4-action-desc">Produk dan inventory</div>
          </button>

          <button class="bh4-action" data-page="opportunities">
            <div class="bh4-action-icon">✦</div>
            <div class="bh4-action-title">Insights</div>
            <div class="bh4-action-desc">Lihat peluang bisnis</div>
          </button>
        </div>
      </div>
    `;

    content.querySelectorAll("[data-page]").forEach(el => {
      el.addEventListener("click", () => {
        const page = el.dataset.page;
        const target = document.querySelector('[data-page="' + page + '"]');
        if (target) target.click();
      });
    });

    const quickToggle = document.getElementById("bh4-quick-toggle");
    if (quickToggle) {
      quickToggle.addEventListener("click", function () {
        const actions = content.querySelector(".bh4-actions");
        if (actions) {
          actions.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }
      });
    }

    const refresh = document.getElementById("bh4-refresh");

    if (refresh) {
      refresh.addEventListener("click", function () {
        refresh.disabled = true;
        refresh.innerHTML = "↻ Refreshing...";

        try {
          // Re-read semua sumber data dari localStorage
          // lalu render ulang Dashboard tanpa reload halaman.
          renderDashboard();
        } finally {
          setTimeout(function () {
            const btn = document.getElementById("bh4-refresh");
            if (btn) {
              btn.disabled = false;
              btn.innerHTML = "↻ Refresh";
            }
          }, 250);
        }
      });
    }
  }

  window.renderDashboard = renderDashboard;
  window.renderLiveDashboard = renderDashboard;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      const activePage = document.querySelector(".nav-item.active[data-page]");
      if (!activePage || activePage.dataset.page === "dashboard") {
        renderDashboard();
      }
    });
  } else {
    const activePage = document.querySelector(".nav-item.active[data-page]");
    if (!activePage || activePage.dataset.page === "dashboard") {
      renderDashboard();
    }
  }
})();

/* =========================================================
   SALES ANALYTICS V2
   TARGET + PERFORMANCE + PRODUCT + CUSTOMER ANALYTICS
   ========================================================= */
(function () {
  "use strict";

  const TARGET_KEY = "businessHubSalesTargetsV1";
  const SALES_KEY = "businessHubSalesSafe";
  const PRODUCTS_KEY = "businessHubProductsV3";
  const CUSTOMERS_KEY = "businessHubCustomersSafe";

  const DEFAULT_TARGET = {
    month: "2026-09",
    revenueTarget: 100000000,
    salesTarget: 20
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;

      const data = JSON.parse(raw);

      return data;
    } catch (e) {
      return fallback;
    }
  }

  function getTarget() {
    const data = read(TARGET_KEY, null);

    if (
      data &&
      typeof data === "object"
    ) {
      return {
        ...DEFAULT_TARGET,
        ...data
      };
    }

    localStorage.setItem(
      TARGET_KEY,
      JSON.stringify(DEFAULT_TARGET)
    );

    return {
      ...DEFAULT_TARGET
    };
  }

  function saveTarget(data) {
    localStorage.setItem(
      TARGET_KEY,
      JSON.stringify(data)
    );
  }

  function money(value) {
    return "Rp " +
      Number(value || 0)
        .toLocaleString("id-ID");
  }

  function compactMoney(value) {
    value = Number(value || 0);

    if (value >= 1000000000) {
      return "Rp " +
        (value / 1000000000)
          .toFixed(1) +
        " M";
    }

    if (value >= 1000000) {
      return "Rp " +
        (value / 1000000)
          .toFixed(1) +
        " Jt";
    }

    if (value >= 1000) {
      return "Rp " +
        (value / 1000)
          .toFixed(0) +
        " Rb";
    }

    return money(value);
  }

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getCurrentMonth() {
    const d = new Date();

    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1)
        .padStart(2, "0")
    );
  }

  function monthName(month) {
    const names = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    const [year, m] =
      String(month)
        .split("-")
        .map(Number);

    return (
      names[(m || 1) - 1] +
      " " +
      year
    );
  }

  function salesForMonth(
    sales,
    month
  ) {
    return sales.filter(s => {

      if (!s.date) return false;

      return String(s.date)
        .slice(0, 7) === month;

    });
  }

  function injectStyles() {

    if (
      document.getElementById(
        "salesAnalyticsV2Styles"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "salesAnalyticsV2Styles";

    style.textContent = `

      .sa2-page {
        animation: sa2fade .18s ease;
      }

      @keyframes sa2fade {
        from {
          opacity:0;
          transform:translateY(4px);
        }

        to {
          opacity:1;
          transform:translateY(0);
        }
      }

      .sa2-header {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:20px;
        margin-bottom:22px;
      }

      .sa2-header h1 {
        margin:0;
        color:#101828;
        font-size:27px;
      }

      .sa2-header p {
        margin:6px 0 0;
        color:#667085;
        font-size:14px;
      }

      .sa2-actions {
        display:flex;
        gap:9px;
      }

      .sa2-btn {
        height:41px;
        padding:0 16px;
        border-radius:8px;
        border:1px solid #d0d5dd;
        background:#fff;
        color:#344054;
        font-weight:600;
        cursor:pointer;
      }

      .sa2-btn-primary {
        border:0;
        background:#101828;
        color:#fff;
      }

      .sa2-btn:hover {
        transform:translateY(-1px);
      }

      .sa2-kpis {
        display:grid;
        grid-template-columns:
          repeat(4,minmax(0,1fr));
        gap:15px;
        margin-bottom:18px;
      }

      .sa2-kpi {
        background:#fff;
        border:1px solid #eaecf0;
        border-radius:13px;
        padding:18px;
        box-shadow:
          0 1px 3px rgba(16,24,40,.05);
      }

      .sa2-kpi-label {
        font-size:11px;
        font-weight:600;
        color:#667085;
        text-transform:uppercase;
      }

      .sa2-kpi-value {
        margin-top:8px;
        font-size:22px;
        font-weight:700;
        color:#101828;
      }

      .sa2-kpi-sub {
        margin-top:6px;
        color:#98a2b3;
        font-size:11px;
      }

      .sa2-grid {
        display:grid;
        grid-template-columns:
          minmax(0,1.35fr)
          minmax(320px,1fr);
        gap:18px;
        margin-bottom:18px;
      }

      .sa2-card {
        background:#fff;
        border:1px solid #eaecf0;
        border-radius:13px;
        padding:19px;
        box-shadow:
          0 1px 3px rgba(16,24,40,.05);
        margin-bottom:18px;
      }

      .sa2-card-head {
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:15px;
        margin-bottom:17px;
      }

      .sa2-card-head h2 {
        margin:0;
        font-size:16px;
        color:#101828;
      }

      .sa2-card-head p {
        margin:5px 0 0;
        font-size:12px;
        color:#667085;
      }

      .sa2-target-box {
        padding:16px;
        background:#f9fafb;
        border-radius:10px;
      }

      .sa2-target-top {
        display:flex;
        justify-content:space-between;
        gap:10px;
        margin-bottom:10px;
      }

      .sa2-target-percent {
        font-size:25px;
        font-weight:700;
        color:#101828;
      }

      .sa2-target-track {
        height:10px;
        background:#eaecf0;
        border-radius:99px;
        overflow:hidden;
      }

      .sa2-target-fill {
        height:100%;
        background:#344054;
        border-radius:99px;
      }

      .sa2-target-meta {
        display:grid;
        grid-template-columns:
          repeat(3,1fr);
        gap:10px;
        margin-top:14px;
      }

      .sa2-mini {
        padding:11px;
        background:#fff;
        border:1px solid #eaecf0;
        border-radius:8px;
      }

      .sa2-mini span {
        display:block;
        font-size:10px;
        color:#667085;
      }

      .sa2-mini strong {
        display:block;
        margin-top:5px;
        color:#101828;
        font-size:13px;
      }

      .sa2-alert {
        padding:14px;
        border-radius:10px;
        border:1px solid #fedf89;
        background:#fffaeb;
        color:#92400e;
      }

      .sa2-alert strong {
        display:block;
        color:#7a2e0e;
        margin-bottom:5px;
      }

      .sa2-alert p {
        margin:0;
        font-size:12px;
        line-height:1.5;
      }

      .sa2-table-wrap {
        overflow-x:auto;
      }

      .sa2-table {
        width:100%;
        min-width:650px;
        border-collapse:collapse;
      }

      .sa2-table th {
        text-align:left;
        padding:11px;
        background:#f9fafb;
        color:#667085;
        font-size:10px;
        text-transform:uppercase;
      }

      .sa2-table td {
        padding:12px 11px;
        border-top:1px solid #f2f4f7;
        color:#344054;
        font-size:12px;
      }

      .sa2-table td strong {
        color:#101828;
      }

      .sa2-rank {
        width:25px;
        height:25px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        border-radius:50%;
        background:#f2f4f7;
        color:#344054;
        font-weight:700;
        font-size:11px;
      }

      .sa2-status {
        display:inline-flex;
        padding:5px 8px;
        border-radius:999px;
        font-size:10px;
        font-weight:700;
      }

      .sa2-status-good {
        background:#ecfdf3;
        color:#027a48;
      }

      .sa2-status-warning {
        background:#fffaeb;
        color:#b54708;
      }

      .sa2-progress {
        width:120px;
        height:6px;
        background:#eaecf0;
        border-radius:99px;
        overflow:hidden;
      }

      .sa2-progress div {
        height:100%;
        background:#344054;
      }

      .sa2-filter {
        height:39px;
        border:1px solid #d0d5dd;
        border-radius:8px;
        padding:0 11px;
        background:#fff;
        color:#344054;
        outline:none;
      }

      .sa2-modal-overlay {
        position:fixed;
        inset:0;
        z-index:10000;
        display:none;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:rgba(16,24,40,.55);
        backdrop-filter:blur(3px);
      }

      .sa2-modal-overlay.show {
        display:flex;
      }

      .sa2-modal {
        width:100%;
        max-width:460px;
        background:#fff;
        border-radius:15px;
        overflow:hidden;
        box-shadow:
          0 25px 60px rgba(16,24,40,.25);
      }

      .sa2-modal-head {
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:19px 21px;
        border-bottom:1px solid #eaecf0;
      }

      .sa2-modal-head h3 {
        margin:0;
        color:#101828;
        font-size:17px;
      }

      .sa2-close {
        border:0;
        background:transparent;
        font-size:23px;
        color:#667085;
        cursor:pointer;
      }

      .sa2-modal-body {
        padding:21px;
      }

      .sa2-field {
        margin-bottom:15px;
      }

      .sa2-field label {
        display:block;
        margin-bottom:6px;
        font-size:12px;
        font-weight:600;
        color:#344054;
      }

      .sa2-field input {
        width:100%;
        height:42px;
        box-sizing:border-box;
        border:1px solid #d0d5dd;
        border-radius:8px;
        padding:0 11px;
        outline:none;
      }

      .sa2-field input:focus {
        border-color:#98a2b3;
        box-shadow:
          0 0 0 3px rgba(16,24,40,.05);
      }

      .sa2-modal-foot {
        display:flex;
        justify-content:flex-end;
        gap:9px;
        padding:15px 21px;
        border-top:1px solid #eaecf0;
      }

      @media(max-width:1000px) {
        .sa2-kpis {
          grid-template-columns:
            repeat(2,1fr);
        }

        .sa2-grid {
          grid-template-columns:1fr;
        }
      }

      @media(max-width:600px) {
        .sa2-header {
          flex-direction:column;
          align-items:stretch;
        }

        .sa2-actions {
          display:grid;
          grid-template-columns:1fr 1fr;
        }

        .sa2-kpis {
          grid-template-columns:1fr;
        }

        .sa2-target-meta {
          grid-template-columns:1fr;
        }
      }

    `;

    document.head.appendChild(style);
  }

  function closeModal() {

    const modal =
      document.getElementById(
        "salesAnalyticsModal"
      );

    if (modal) {
      modal.classList.remove("show");
    }
  }

  function openTargetModal() {

    const target = getTarget();

    let modal =
      document.getElementById(
        "salesAnalyticsModal"
      );

    if (!modal) {

      modal =
        document.createElement("div");

      modal.id =
        "salesAnalyticsModal";

      modal.className =
        "sa2-modal-overlay";

      document.body.appendChild(modal);

    }

    modal.innerHTML = `

      <div class="sa2-modal">

        <div class="sa2-modal-head">

          <h3>Set Sales Target</h3>

          <button
            class="sa2-close"
            id="sa2Close">
            ×
          </button>

        </div>

        <div class="sa2-modal-body">

          <div class="sa2-field">

            <label>Target Month</label>

            <input
              id="sa2Month"
              type="month"
              value="${esc(target.month)}">

          </div>

          <div class="sa2-field">

            <label>Revenue Target</label>

            <input
              id="sa2Revenue"
              type="number"
              min="0"
              value="${Number(
                target.revenueTarget || 0
              )}">

          </div>

          <div class="sa2-field">

            <label>Number of Sales Target</label>

            <input
              id="sa2Sales"
              type="number"
              min="0"
              value="${Number(
                target.salesTarget || 0
              )}">

          </div>

        </div>

        <div class="sa2-modal-foot">

          <button
            class="sa2-btn"
            id="sa2Cancel">
            Cancel
          </button>

          <button
            class="sa2-btn sa2-btn-primary"
            id="sa2Save">
            Save Target
          </button>

        </div>

      </div>
    `;

    modal.classList.add("show");

    document
      .getElementById("sa2Close")
      .onclick = closeModal;

    document
      .getElementById("sa2Cancel")
      .onclick = closeModal;

    modal.onclick = function(e) {

      if (e.target === modal) {
        closeModal();
      }

    };

    document
      .getElementById("sa2Save")
      .onclick = function() {

        const month =
          document
            .getElementById("sa2Month")
            .value;

        const revenue =
          Number(
            document
              .getElementById("sa2Revenue")
              .value
          );

        const sales =
          Number(
            document
              .getElementById("sa2Sales")
              .value
          );

        if (!month) {
          alert("Pilih bulan target.");
          return;
        }

        if (
          !Number.isFinite(revenue) ||
          revenue < 0
        ) {
          alert("Revenue target tidak valid.");
          return;
        }

        if (
          !Number.isFinite(sales) ||
          sales < 0
        ) {
          alert("Sales target tidak valid.");
          return;
        }

        saveTarget({
          month,
          revenueTarget: revenue,
          salesTarget: sales
        });

        closeModal();
        renderSalesAnalytics();

      };

  }

  function renderSalesAnalytics() {

    const content =
      document.querySelector(".content");

    if (!content) return;

    injectStyles();

    const sales =
      read(SALES_KEY, []);

    const products =
      read(PRODUCTS_KEY, []);

    const customers =
      read(CUSTOMERS_KEY, []);

    const target =
      getTarget();

    const currentMonth =
      target.month || getCurrentMonth();

    const currentSales =
      salesForMonth(
        sales,
        currentMonth
      );

    const completedSales =
      currentSales.filter(s =>
        String(
          s.status || "Completed"
        ).toLowerCase() === "completed"
      );

    const revenue =
      completedSales.reduce(
        (sum, s) =>
          sum + Number(s.amount || 0),
        0
      );

    const salesCount =
      completedSales.length;

    const achievement =
      target.revenueTarget > 0
        ? Math.round(
            (
              revenue /
              target.revenueTarget
            ) * 100
          )
        : 0;

    const salesAchievement =
      target.salesTarget > 0
        ? Math.round(
            (
              salesCount /
              target.salesTarget
            ) * 100
          )
        : 0;

    const revenueGap =
      Math.max(
        0,
        Number(target.revenueTarget || 0) -
        revenue
      );

    const avgSale =
      salesCount > 0
        ? revenue / salesCount
        : 0;

    /*
     * Product contribution
     */
    const productMap = {};

    completedSales.forEach(s => {

      const id =
        s.productId ||
        s.productName ||
        s.product ||
        "unknown";

      const name =
        s.productName ||
        s.product ||
        "Unknown Product";

      if (!productMap[id]) {

        productMap[id] = {
          name,
          revenue:0,
          qty:0
        };

      }

      productMap[id].revenue +=
        Number(s.amount || 0);

      productMap[id].qty +=
        Number(s.qty || 0);

    });

    const topProducts =
      Object.values(productMap)
        .sort(
          (a,b) =>
            b.revenue - a.revenue
        )
        .slice(0,5);

    /*
     * Customer contribution
     */
    const customerMap = {};

    completedSales.forEach(s => {

      const id =
        s.customerId ||
        s.customerName ||
        s.customer ||
        "unknown";

      const name =
        s.customerName ||
        s.customer ||
        "Unknown Customer";

      if (!customerMap[id]) {

        customerMap[id] = {
          name,
          revenue:0,
          orders:0
        };

      }

      customerMap[id].revenue +=
        Number(s.amount || 0);

      customerMap[id].orders++;

    });

    const topCustomers =
      Object.values(customerMap)
        .sort(
          (a,b) =>
            b.revenue - a.revenue
        )
        .slice(0,5);

    const productLookup = {};

    products.forEach(p => {
      productLookup[p.id] = p;
      productLookup[p.name] = p;
      productLookup[p.sku] = p;
    });

    /*
     * Inventory opportunity
     */
    const inventoryAlerts =
      products.filter(
        p =>
          Number(p.stock || 0) <
          Number(p.targetStock || 0)
      );

    const targetStatus =
      achievement >= 100
        ? {
            text:"Target tercapai",
            class:"sa2-status-good"
          }
        : achievement >= 70
          ? {
              text:"On Track",
              class:"sa2-status-good"
            }
          : {
              text:"Behind Target",
              class:"sa2-status-warning"
            };

    content.innerHTML = `

      <div class="sa2-page">

        <div class="sa2-header">

          <div>

            <h1>Sales & Analytics</h1>

            <p>
              Monitor target, revenue,
              customers and product performance
            </p>

          </div>

          <div class="sa2-actions">

            <select
              class="sa2-filter"
              id="sa2Period">

              <option value="${esc(currentMonth)}">
                ${esc(monthName(currentMonth))}
              </option>

            </select>

            <button
              class="sa2-btn sa2-btn-primary"
              id="sa2SetTarget">
              Set Target
            </button>

          </div>

        </div>

        <div class="sa2-kpis">

          <div class="sa2-kpi">

            <div class="sa2-kpi-label">
              Revenue
            </div>

            <div class="sa2-kpi-value">
              ${compactMoney(revenue)}
            </div>

            <div class="sa2-kpi-sub">
              ${salesCount} completed sales
            </div>

          </div>

          <div class="sa2-kpi">

            <div class="sa2-kpi-label">
              Revenue Target
            </div>

            <div class="sa2-kpi-value">
              ${compactMoney(
                target.revenueTarget
              )}
            </div>

            <div class="sa2-kpi-sub">
              ${achievement}% achieved
            </div>

          </div>

          <div class="sa2-kpi">

            <div class="sa2-kpi-label">
              Target Gap
            </div>

            <div class="sa2-kpi-value">
              ${compactMoney(revenueGap)}
            </div>

            <div class="sa2-kpi-sub">
              Remaining revenue
            </div>

          </div>

          <div class="sa2-kpi">

            <div class="sa2-kpi-label">
              Average Sale
            </div>

            <div class="sa2-kpi-value">
              ${compactMoney(avgSale)}
            </div>

            <div class="sa2-kpi-sub">
              Per completed sale
            </div>

          </div>

        </div>

        <div class="sa2-grid">

          <div class="sa2-card">

            <div class="sa2-card-head">

              <div>

                <h2>Revenue Target</h2>

                <p>
                  ${esc(
                    monthName(currentMonth)
                  )}
                </p>

              </div>

              <span class="
                sa2-status
                ${targetStatus.class}
              ">
                ${targetStatus.text}
              </span>

            </div>

            <div class="sa2-target-box">

              <div class="sa2-target-top">

                <strong>
                  ${compactMoney(revenue)}
                  /
                  ${compactMoney(
                    target.revenueTarget
                  )}
                </strong>

                <strong class="sa2-target-percent">
                  ${achievement}%
                </strong>

              </div>

              <div class="sa2-target-track">

                <div
                  class="sa2-target-fill"
                  style="
                    width:${Math.min(
                      100,
                      Math.max(
                        0,
                        achievement
                      )
                    )}%
                  ">
                </div>

              </div>

              <div class="sa2-target-meta">

                <div class="sa2-mini">

                  <span>Revenue Actual</span>

                  <strong>
                    ${compactMoney(revenue)}
                  </strong>

                </div>

                <div class="sa2-mini">

                  <span>Revenue Gap</span>

                  <strong>
                    ${compactMoney(revenueGap)}
                  </strong>

                </div>

                <div class="sa2-mini">

                  <span>Sales Achievement</span>

                  <strong>
                    ${salesAchievement}%
                  </strong>

                </div>

              </div>

            </div>

          </div>

          <div class="sa2-card">

            <div class="sa2-card-head">

              <div>

                <h2>Performance Alert</h2>

                <p>
                  Automatic sales analysis
                </p>

              </div>

            </div>

            ${
              achievement < 70
                ? `
                  <div class="sa2-alert">

                    <strong>
                      Target masih tertinggal
                    </strong>

                    <p>
                      Revenue baru mencapai
                      ${achievement}% dari target.
                      Masih diperlukan
                      ${compactMoney(revenueGap)}
                      untuk mencapai target.
                    </p>

                  </div>
                `
                : achievement < 100
                  ? `
                    <div class="sa2-alert">

                      <strong>
                        Target belum tercapai
                      </strong>

                      <p>
                        Performance sudah cukup dekat
                        dengan target, tetapi masih
                        ada gap ${compactMoney(
                          revenueGap
                        )}.
                      </p>

                    </div>
                  `
                  : `
                    <div style="
                      padding:14px;
                      border-radius:10px;
                      background:#ecfdf3;
                      border:1px solid #abefc6;
                      color:#027a48;
                    ">

                      <strong>
                        Target revenue tercapai
                      </strong>

                      <p style="
                        margin:5px 0 0;
                        font-size:12px;
                      ">
                        Revenue telah mencapai
                        ${achievement}% dari target.
                      </p>

                    </div>
                  `
            }

            ${
              inventoryAlerts.length
                ? `
                  <div style="
                    margin-top:10px;
                    padding:12px;
                    border-radius:9px;
                    background:#f9fafb;
                    border:1px solid #eaecf0;
                    font-size:12px;
                    color:#667085;
                  ">
                    ${inventoryAlerts.length}
                    produk membutuhkan perhatian
                    inventory.
                  </div>
                `
                : ""
            }

          </div>

        </div>

        <div class="sa2-card">

          <div class="sa2-card-head">

            <div>

              <h2>Top Products</h2>

              <p>
                Products contributing the most revenue
              </p>

            </div>

          </div>

          <div class="sa2-table-wrap">

            <table class="sa2-table">

              <thead>

                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Units</th>
                  <th>Revenue</th>
                  <th>Contribution</th>
                </tr>

              </thead>

              <tbody>

                ${
                  topProducts.length
                    ? topProducts.map(
                        (p,index) => {

                          const contribution =
                            revenue > 0
                              ? Math.round(
                                  (
                                    p.revenue /
                                    revenue
                                  ) * 100
                                )
                              : 0;

                          return `

                            <tr>

                              <td>
                                <span class="sa2-rank">
                                  ${index + 1}
                                </span>
                              </td>

                              <td>
                                <strong>
                                  ${esc(p.name)}
                                </strong>
                              </td>

                              <td>
                                ${p.qty}
                              </td>

                              <td>
                                ${money(p.revenue)}
                              </td>

                              <td>

                                <div style="
                                  display:flex;
                                  align-items:center;
                                  gap:8px;
                                ">

                                  <div class="sa2-progress">

                                    <div style="
                                      width:${contribution}%
                                    ">
                                    </div>

                                  </div>

                                  ${contribution}%

                                </div>

                              </td>

                            </tr>

                          `;

                        }
                      ).join("")
                    : `
                      <tr>
                        <td colspan="5">
                          Belum ada data sales.
                        </td>
                      </tr>
                    `
                }

              </tbody>

            </table>

          </div>

        </div>

        <div class="sa2-card">

          <div class="sa2-card-head">

            <div>

              <h2>Top Customers</h2>

              <p>
                Customers contributing the most revenue
              </p>

            </div>

          </div>

          <div class="sa2-table-wrap">

            <table class="sa2-table">

              <thead>

                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Contribution</th>
                </tr>

              </thead>

              <tbody>

                ${
                  topCustomers.length
                    ? topCustomers.map(
                        (c,index) => {

                          const contribution =
                            revenue > 0
                              ? Math.round(
                                  (
                                    c.revenue /
                                    revenue
                                  ) * 100
                                )
                              : 0;

                          return `

                            <tr>

                              <td>
                                <span class="sa2-rank">
                                  ${index + 1}
                                </span>
                              </td>

                              <td>
                                <strong>
                                  ${esc(c.name)}
                                </strong>
                              </td>

                              <td>
                                ${c.orders}
                              </td>

                              <td>
                                ${money(c.revenue)}
                              </td>

                              <td>

                                <div style="
                                  display:flex;
                                  align-items:center;
                                  gap:8px;
                                ">

                                  <div class="sa2-progress">

                                    <div style="
                                      width:${contribution}%
                                    ">
                                    </div>

                                  </div>

                                  ${contribution}%

                                </div>

                              </td>

                            </tr>

                          `;

                        }
                      ).join("")
                    : `
                      <tr>
                        <td colspan="5">
                          Belum ada data customer.
                        </td>
                      </tr>
                    `
                }

              </tbody>

            </table>

          </div>

        </div>

        <div class="sa2-card">

          <div class="sa2-card-head">

            <div>

              <h2>Sales Summary</h2>

              <p>
                Current period transaction overview
              </p>

            </div>

          </div>

          <div class="sa2-table-wrap">

            <table class="sa2-table">

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Revenue</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                ${
                  currentSales.length
                    ? currentSales.map(s => `

                      <tr>

                        <td>
                          ${esc(s.date || "-")}
                        </td>

                        <td>
                          ${esc(
                            s.customerName ||
                            s.customer ||
                            "-"
                          )}
                        </td>

                        <td>
                          ${esc(
                            s.productName ||
                            s.product ||
                            "-"
                          )}
                        </td>

                        <td>
                          ${Number(s.qty || 0)}
                        </td>

                        <td>
                          <strong>
                            ${money(
                              s.amount
                            )}
                          </strong>
                        </td>

                        <td>
                          <span class="
                            sa2-status
                            ${
                              String(
                                s.status ||
                                "Completed"
                              ).toLowerCase() ===
                              "completed"
                                ? "sa2-status-good"
                                : "sa2-status-warning"
                            }
                          ">
                            ${esc(
                              s.status ||
                              "Completed"
                            )}
                          </span>
                        </td>

                      </tr>

                    `).join("")
                    : `
                      <tr>
                        <td colspan="6">
                          Belum ada sales pada periode ini.
                        </td>
                      </tr>
                    `
                }

              </tbody>

            </table>

          </div>

        </div>

      </div>
    `;

    document
      .getElementById("sa2SetTarget")
      .onclick = openTargetModal;

  }

  /*
   * Capture Sales navigation.
   * This renderer is intentionally the last layer.
   */
  document.addEventListener(
    "click",
    function(event) {

      const button =
        event.target.closest(
          '[data-page="sales"]'
        );

      if (!button) return;

      setTimeout(
        renderSalesAnalytics,
        180
      );

    }
  );

})();

/* =========================================================
   INTELLIGENCE V1 — OPPORTUNITY ENGINE
   DATA -> DETECTION -> PRIORITY -> ACTION
   ========================================================= */
(function () {
  "use strict";

  const TX_KEY = "businessHubTransactions";
  const SALES_KEY = "businessHubSalesSafe";
  const PRODUCTS_KEY = "businessHubProductsV3";
  const CUSTOMERS_KEY = "businessHubCustomersSafe";
  const TARGET_KEY = "businessHubSalesTargetsV1";
  const STATUS_KEY = "businessHubOpportunityStatusV1";

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;

      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function money(value) {
    value = Number(value || 0);

    if (value >= 1000000000) {
      return "Rp " +
        (value / 1000000000).toFixed(1) +
        " M";
    }

    if (value >= 1000000) {
      return "Rp " +
        (value / 1000000).toFixed(1) +
        " Jt";
    }

    return "Rp " +
      value.toLocaleString("id-ID");
  }

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getStatus() {
    return read(STATUS_KEY, {});
  }

  function saveStatus(data) {
    localStorage.setItem(
      STATUS_KEY,
      JSON.stringify(data)
    );
  }

  function getMonth() {
    const d = new Date();

    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1)
        .padStart(2, "0")
    );
  }

  function getTarget() {
    const target =
      read(
        TARGET_KEY,
        {
          month: getMonth(),
          revenueTarget: 100000000,
          salesTarget: 20
        }
      );

    return target;
  }

  function generateOpportunities() {

    const tx =
      read(TX_KEY, []);

    const sales =
      read(SALES_KEY, []);

    const products =
      read(PRODUCTS_KEY, []);

    const customers =
      read(CUSTOMERS_KEY, []);

    const target =
      getTarget();

    const opportunities = [];

    const month =
      target.month || getMonth();

    const monthSales =
      sales.filter(s =>
        String(s.date || "")
          .slice(0, 7) === month
      );

    const completedSales =
      monthSales.filter(s =>
        String(
          s.status || "Completed"
        ).toLowerCase() === "completed"
      );

    const revenue =
      completedSales.reduce(
        (sum, s) =>
          sum + Number(s.amount || 0),
        0
      );

    const monthTx =
      tx.filter(t => {

        if (!t.date) return true;

        return String(t.date)
          .slice(0, 7) === month;

      });

    const income =
      monthTx
        .filter(t => t.type === "income")
        .reduce(
          (sum, t) =>
            sum + Number(t.amount || 0),
          0
        );

    const expenses =
      monthTx
        .filter(t => t.type === "expense")
        .reduce(
          (sum, t) =>
            sum + Number(t.amount || 0),
          0
        );

    /*
     * 1. SALES TARGET
     */
    if (
      Number(target.revenueTarget || 0) > 0
    ) {

      const achievement =
        Math.round(
          (
            revenue /
            Number(target.revenueTarget)
          ) * 100
        );

      if (achievement < 70) {

        opportunities.push({
          id: "sales-target",
          priority: "HIGH",
          category: "Sales",
          title: "Sales target tertinggal",
          description:
            "Revenue baru mencapai " +
            achievement +
            "% dari target " +
            money(target.revenueTarget) +
            ".",
          action: "sales",
          actionLabel: "Open Sales Analytics"
        });

      } else if (
        achievement < 100
      ) {

        opportunities.push({
          id: "sales-target",
          priority: "MEDIUM",
          category: "Sales",
          title: "Sales target belum tercapai",
          description:
            "Revenue sudah " +
            achievement +
            "% tetapi masih terdapat gap " +
            money(
              Math.max(
                0,
                Number(target.revenueTarget) -
                revenue
              )
            ) +
            ".",
          action: "sales",
          actionLabel: "Review Sales"
        });

      }

    }

    /*
     * 2. EXPENSE RATIO
     */
    if (revenue > 0) {

      const ratio =
        Math.round(
          (expenses / revenue) * 100
        );

      if (ratio >= 60) {

        opportunities.push({
          id: "expense-ratio",
          priority: "HIGH",
          category: "Finance",
          title: "Expense ratio tinggi",
          description:
            "Expenses mencapai " +
            ratio +
            "% dari revenue bulan ini.",
          action: "expenses",
          actionLabel: "Analyze Expenses"
        });

      } else if (ratio >= 40) {

        opportunities.push({
          id: "expense-ratio",
          priority: "MEDIUM",
          category: "Finance",
          title: "Expenses perlu dipantau",
          description:
            "Expense ratio berada di " +
            ratio +
            "% dari revenue.",
          action: "expenses",
          actionLabel: "Review Expenses"
        });

      }

    }

    /*
     * 3. NEGATIVE PROFIT
     */
    if (
      revenue > 0 &&
      expenses > revenue
    ) {

      opportunities.push({
        id: "negative-profit",
        priority: "CRITICAL",
        category: "Finance",
        title: "Net profit negatif",
        description:
          "Expenses bulan ini lebih besar daripada revenue.",
        action: "finance",
        actionLabel: "Open Finance"
      });

    }

    /*
     * 4. LOW STOCK
     */
    products
      .filter(
        p =>
          Number(p.stock || 0) <
          Number(p.targetStock || 0)
      )
      .forEach(p => {

        opportunities.push({
          id:
            "low-stock-" +
            String(p.id),
          priority:
            Number(p.stock || 0) === 0
              ? "HIGH"
              : "MEDIUM",
          category: "Inventory",
          title:
            "Low stock — " +
            p.name,
          description:
            "Stock saat ini " +
            Number(p.stock || 0) +
            ", target " +
            Number(p.targetStock || 0) +
            ".",
          action: "products",
          actionLabel: "Open Products"
        });

      });

    /*
     * 5. PRODUCT SALES OPPORTUNITY
     */
    const productRevenue = {};

    completedSales.forEach(s => {

      const key =
        s.productId ||
        s.productName ||
        s.product;

      if (!key) return;

      if (!productRevenue[key]) {

        productRevenue[key] = {
          name:
            s.productName ||
            s.product ||
            "Product",
          revenue:0,
          qty:0
        };

      }

      productRevenue[key].revenue +=
        Number(s.amount || 0);

      productRevenue[key].qty +=
        Number(s.qty || 0);

    });

    Object.values(productRevenue)
      .sort(
        (a,b) =>
          b.revenue - a.revenue
      )
      .slice(0,3)
      .forEach((p,index) => {

        if (p.revenue <= 0) return;

        opportunities.push({
          id:
            "top-product-" +
            index,
          priority: "LOW",
          category: "Product",
          title:
            "Top product opportunity — " +
            p.name,
          description:
            p.qty +
            " unit terjual dengan revenue " +
            money(p.revenue) +
            ".",
          action: "products",
          actionLabel: "Review Product"
        });

      });

    /*
     * 6. CUSTOMER OPPORTUNITY
     */
    const customerRevenue = {};

    completedSales.forEach(s => {

      const key =
        s.customerId ||
        s.customerName ||
        s.customer;

      if (!key) return;

      if (!customerRevenue[key]) {

        customerRevenue[key] = {
          name:
            s.customerName ||
            s.customer ||
            "Customer",
          revenue:0,
          orders:0
        };

      }

      customerRevenue[key].revenue +=
        Number(s.amount || 0);

      customerRevenue[key].orders++;

    });

    Object.values(customerRevenue)
      .sort(
        (a,b) =>
          b.revenue - a.revenue
      )
      .slice(0,3)
      .forEach((c,index) => {

        opportunities.push({
          id:
            "top-customer-" +
            index,
          priority: "LOW",
          category: "Customer",
          title:
            "Customer bernilai tinggi — " +
            c.name,
          description:
            c.orders +
            " order dengan revenue " +
            money(c.revenue) +
            ".",
          action: "customers",
          actionLabel: "Open Customer"
        });

      });

    /*
     * 7. CUSTOMER DATABASE
     */
    const activeCustomers =
      customers.filter(
        c =>
          String(
            c.status || "Active"
          ).toLowerCase() === "active"
      );

    if (
      customers.length > 0 &&
      activeCustomers.length <
      customers.length
    ) {

      opportunities.push({
        id: "customer-status",
        priority: "LOW",
        category: "Customer",
        title: "Customer perlu ditinjau",
        description:
          (
            customers.length -
            activeCustomers.length
          ) +
          " customer tidak berstatus Active.",
        action: "customers",
        actionLabel: "Review Customers"
      });

    }

    return opportunities;
  }

  function injectStyles() {

    if (
      document.getElementById(
        "intelligenceV1Styles"
      )
    ) return;

    const style =
      document.createElement("style");

    style.id =
      "intelligenceV1Styles";

    style.textContent = `

      .intel-page {
        animation:intelFade .18s ease;
      }

      @keyframes intelFade {
        from {
          opacity:0;
          transform:translateY(4px);
        }

        to {
          opacity:1;
          transform:translateY(0);
        }
      }

      .intel-header {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:20px;
        margin-bottom:22px;
      }

      .intel-header h1 {
        margin:0;
        color:#101828;
        font-size:27px;
      }

      .intel-header p {
        margin:6px 0 0;
        color:#667085;
        font-size:14px;
      }

      .intel-refresh {
        height:40px;
        padding:0 15px;
        border:1px solid #d0d5dd;
        border-radius:8px;
        background:#fff;
        color:#344054;
        font-weight:600;
        cursor:pointer;
      }

      .intel-summary {
        display:grid;
        grid-template-columns:
          repeat(4,minmax(0,1fr));
        gap:15px;
        margin-bottom:18px;
      }

      .intel-stat {
        background:#fff;
        border:1px solid #eaecf0;
        border-radius:13px;
        padding:18px;
        box-shadow:
          0 1px 3px rgba(16,24,40,.05);
      }

      .intel-stat-label {
        color:#667085;
        font-size:11px;
        font-weight:600;
        text-transform:uppercase;
      }

      .intel-stat-value {
        margin-top:8px;
        color:#101828;
        font-size:23px;
        font-weight:700;
      }

      .intel-card {
        background:#fff;
        border:1px solid #eaecf0;
        border-radius:13px;
        padding:19px;
        box-shadow:
          0 1px 3px rgba(16,24,40,.05);
      }

      .intel-toolbar {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:12px;
        margin-bottom:17px;
      }

      .intel-toolbar h2 {
        margin:0;
        color:#101828;
        font-size:16px;
      }

      .intel-toolbar p {
        margin:5px 0 0;
        color:#667085;
        font-size:12px;
      }

      .intel-filters {
        display:flex;
        gap:7px;
        flex-wrap:wrap;
      }

      .intel-filter {
        height:36px;
        padding:0 10px;
        border:1px solid #d0d5dd;
        border-radius:7px;
        background:#fff;
        color:#344054;
        font-size:11px;
      }

      .intel-list {
        display:flex;
        flex-direction:column;
        gap:10px;
      }

      .intel-item {
        display:grid;
        grid-template-columns:
          92px minmax(0,1fr) auto;
        gap:16px;
        align-items:center;
        padding:15px;
        border:1px solid #eaecf0;
        border-radius:10px;
        transition:.15s;
      }

      .intel-item:hover {
        background:#f9fafb;
        border-color:#d0d5dd;
      }

      .intel-priority {
        display:inline-flex;
        justify-content:center;
        align-items:center;
        padding:7px 8px;
        border-radius:7px;
        font-size:10px;
        font-weight:700;
      }

      .intel-critical {
        background:#fef3f2;
        color:#b42318;
      }

      .intel-high {
        background:#fff1f3;
        color:#c01048;
      }

      .intel-medium {
        background:#fffaeb;
        color:#b54708;
      }

      .intel-low {
        background:#f2f4f7;
        color:#475467;
      }

      .intel-title {
        font-size:13px;
        font-weight:700;
        color:#101828;
      }

      .intel-description {
        margin-top:5px;
        color:#667085;
        font-size:12px;
        line-height:1.5;
      }

      .intel-category {
        display:inline-block;
        margin-top:7px;
        font-size:10px;
        color:#98a2b3;
      }

      .intel-action {
        height:36px;
        padding:0 11px;
        border:1px solid #d0d5dd;
        border-radius:7px;
        background:#fff;
        color:#344054;
        font-size:11px;
        font-weight:600;
        cursor:pointer;
        white-space:nowrap;
      }

      .intel-action:hover {
        background:#101828;
        color:#fff;
        border-color:#101828;
      }

      .intel-empty {
        text-align:center;
        padding:45px 20px;
        color:#667085;
      }

      .intel-empty-icon {
        width:48px;
        height:48px;
        display:flex;
        align-items:center;
        justify-content:center;
        margin:0 auto 12px;
        border-radius:50%;
        background:#ecfdf3;
        color:#027a48;
        font-size:22px;
      }

      @media(max-width:900px) {

        .intel-summary {
          grid-template-columns:
            repeat(2,1fr);
        }

      }

      @media(max-width:650px) {

        .intel-header {
          flex-direction:column;
          align-items:stretch;
        }

        .intel-summary {
          grid-template-columns:1fr;
        }

        .intel-item {
          grid-template-columns:1fr;
        }

        .intel-action {
          width:100%;
        }

      }

    `;

    document.head.appendChild(style);
  }

  function renderIntelligence() {

    const content =
      document.querySelector(".content");

    if (!content) return;

    injectStyles();

    const opportunities =
      generateOpportunities();

    const status =
      getStatus();

    const visible =
      opportunities.filter(o =>
        status[o.id] !== "resolved"
      );

    const critical =
      visible.filter(
        o => o.priority === "CRITICAL"
      ).length;

    const high =
      visible.filter(
        o => o.priority === "HIGH"
      ).length;

    const medium =
      visible.filter(
        o => o.priority === "MEDIUM"
      ).length;

    content.innerHTML = `

      <div class="intel-page">

        <div class="intel-header">

          <div>

            <h1>Opportunity Center</h1>

            <p>
              Intelligent detection of business
              opportunities, risks and actions
            </p>

          </div>

          <button
            class="intel-refresh"
            id="intelRefresh">
            ↻ Refresh Analysis
          </button>

        </div>

        <div class="intel-summary">

          <div class="intel-stat">

            <div class="intel-stat-label">
              Open Opportunities
            </div>

            <div class="intel-stat-value">
              ${visible.length}
            </div>

          </div>

          <div class="intel-stat">

            <div class="intel-stat-label">
              Critical
            </div>

            <div class="intel-stat-value">
              ${critical}
            </div>

          </div>

          <div class="intel-stat">

            <div class="intel-stat-label">
              High Priority
            </div>

            <div class="intel-stat-value">
              ${high}
            </div>

          </div>

          <div class="intel-stat">

            <div class="intel-stat-label">
              Medium Priority
            </div>

            <div class="intel-stat-value">
              ${medium}
            </div>

          </div>

        </div>

        <div class="intel-card">

          <div class="intel-toolbar">

            <div>

              <h2>Detected Opportunities</h2>

              <p>
                Analysis generated from current business data
              </p>

            </div>

            <div class="intel-filters">

              <select
                class="intel-filter"
                id="intelPriority">

                <option value="all">
                  All Priority
                </option>

                <option value="CRITICAL">
                  Critical
                </option>

                <option value="HIGH">
                  High
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="LOW">
                  Low
                </option>

              </select>

              <select
                class="intel-filter"
                id="intelCategory">

                <option value="all">
                  All Categories
                </option>

                <option value="Finance">
                  Finance
                </option>

                <option value="Sales">
                  Sales
                </option>

                <option value="Inventory">
                  Inventory
                </option>

                <option value="Product">
                  Product
                </option>

                <option value="Customer">
                  Customer
                </option>

              </select>

            </div>

          </div>

          <div
            class="intel-list"
            id="intelList">
          </div>

        </div>

      </div>

    `;

    const list =
      document.getElementById(
        "intelList"
      );

    function draw() {

      const priority =
        document.getElementById(
          "intelPriority"
        ).value;

      const category =
        document.getElementById(
          "intelCategory"
        ).value;

      const filtered =
        visible.filter(o => {

          const priorityMatch =
            priority === "all" ||
            o.priority === priority;

          const categoryMatch =
            category === "all" ||
            o.category === category;

          return (
            priorityMatch &&
            categoryMatch
          );

        });

      if (!filtered.length) {

        list.innerHTML = `

          <div class="intel-empty">

            <div class="intel-empty-icon">
              ✓
            </div>

            <strong>
              Tidak ada opportunity
            </strong>

            <div style="
              margin-top:5px;
              font-size:12px;
            ">
              Semua kondisi bisnis yang
              dipilih sudah normal.
            </div>

          </div>

        `;

        return;
      }

      list.innerHTML =
        filtered.map(o => {

          const priorityClass =
            o.priority === "CRITICAL"
              ? "intel-critical"
              : o.priority === "HIGH"
                ? "intel-high"
                : o.priority === "MEDIUM"
                  ? "intel-medium"
                  : "intel-low";

          return `

            <div class="intel-item">

              <div>

                <span class="
                  intel-priority
                  ${priorityClass}
                ">
                  ${esc(o.priority)}
                </span>

              </div>

              <div>

                <div class="intel-title">
                  ${esc(o.title)}
                </div>

                <div class="intel-description">
                  ${esc(o.description)}
                </div>

                <span class="intel-category">
                  ${esc(o.category)}
                </span>

              </div>

              <button
                class="intel-action"
                data-intel-action="${esc(o.action)}"
                data-intel-id="${esc(o.id)}">
                ${esc(o.actionLabel)} →
              </button>

            </div>

          `;

        }).join("");

    }

    draw();

    document
      .getElementById("intelPriority")
      .addEventListener(
        "change",
        draw
      );

    document
      .getElementById("intelCategory")
      .addEventListener(
        "change",
        draw
      );

    document
      .getElementById("intelRefresh")
      .onclick =
        renderIntelligence;

    list.addEventListener(
      "click",
      function(event) {

        const button =
          event.target.closest(
            "[data-intel-action]"
          );

        if (!button) return;

        const action =
          button.dataset.intelAction;

        const id =
          button.dataset.intelId;

        const statusData =
          getStatus();

        statusData[id] =
          "resolved";

        saveStatus(statusData);

        const nav =
          document.querySelector(
            '[data-page="' +
            action +
            '"]'
          );

        if (nav) {

          nav.click();

        } else {

          renderIntelligence();

        }

      }
    );

  }

  /*
   * Opportunity page
   */
  document.addEventListener(
    "click",
    function(event) {

      const button =
        event.target.closest(
          '[data-page="opportunities"]'
        );

      if (!button) return;

      setTimeout(
        renderIntelligence,
        180
      );

    }
  );

})();

/* =========================================================
   PROFILE SYNC FINAL V4
   ONE PHOTO -> LEFT + RIGHT
   ========================================================= */
(function () {
  "use strict";

  const KEY = "businessHubProfilePhoto";

  function getLeft() {
    return document.getElementById("sideProfileAvatar");
  }

  function getRight() {
    return document.getElementById("topProfileAvatar");
  }

  function apply(photo) {
    const left = getLeft();
    const right = getRight();

    [left, right].forEach(function (avatar) {
      if (!avatar) return;

      if (photo) {
        avatar.textContent = "";
        avatar.style.backgroundImage = "url(" + JSON.stringify(photo) + ")";
        avatar.style.backgroundSize = "cover";
        avatar.style.backgroundPosition = "center";
        avatar.style.backgroundRepeat = "no-repeat";
        avatar.style.color = "transparent";
        avatar.style.overflow = "hidden";
      } else {
        avatar.textContent = "BH";
        avatar.style.backgroundImage = "none";
        avatar.style.backgroundSize = "";
        avatar.style.backgroundPosition = "";
        avatar.style.backgroundRepeat = "";
        avatar.style.color = "";
      }
    });
  }

  function load() {
    apply(localStorage.getItem(KEY));
  }

  function openPicker() {
    const input = document.getElementById("profilePhotoInput");
    if (input) {
      input.value = "";
      input.click();
    }
  }

  function setup() {
    const input = document.getElementById("profilePhotoInput");

    // Klik avatar kiri ATAU kanan
    document.addEventListener("click", function (event) {
      const left = event.target.closest("#sideProfileAvatar");
      const right = event.target.closest("#topProfileAvatar");

      if (left || right) {
        event.preventDefault();
        event.stopPropagation();
        openPicker();
      }
    }, true);

    // Satu-satunya handler upload
    if (input) {
      input.addEventListener("change", function () {
        const file = input.files && input.files[0];

        if (!file) return;

        if (!file.type || !file.type.startsWith("image/")) {
          alert("Silakan pilih file gambar.");
          input.value = "";
          return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {
          const photo = event.target.result;

          try {
            localStorage.setItem(KEY, photo);
          } catch (error) {
            alert("Foto terlalu besar untuk disimpan.");
            return;
          }

          // Langsung update KEDUA avatar
          apply(photo);
        };

        reader.readAsDataURL(file);
      });
    }

    // Load foto saat halaman dibuka
    load();

    // Pastikan jika DOM berubah/render ulang,
    // kedua avatar tetap memakai foto yang sama.
    const observer = new MutationObserver(function () {
      const photo = localStorage.getItem(KEY);

      if (photo) {
        apply(photo);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }

  // Sinkronisasi antar-tab/window
  window.addEventListener("storage", function (event) {
    if (event.key === KEY) {
      apply(event.newValue);
    }
  });

})();

/* =========================================================
   PORTOFOLIO WANDI — SIDEBAR AVATAR SYNC
   ========================================================= */
(function () {
  const KEY = "businessHubProfilePhoto";

  function syncSidebarAvatar() {
    const photo = localStorage.getItem(KEY);
    const avatar = document.getElementById("sideProfileAvatar");

    if (!avatar) return;

    if (photo) {
      avatar.textContent = "";
      avatar.style.backgroundImage = "url(" + JSON.stringify(photo) + ")";
      avatar.style.backgroundSize = "cover";
      avatar.style.backgroundPosition = "center";
      avatar.style.backgroundRepeat = "no-repeat";
      avatar.style.color = "transparent";
    } else {
      avatar.textContent = "BH";
      avatar.style.backgroundImage = "none";
      avatar.style.color = "";
    }
  }

  function init() {
    syncSidebarAvatar();

    const input = document.getElementById("profilePhotoInput");
    if (input) {
      input.addEventListener("change", function () {
        setTimeout(syncSidebarAvatar, 50);
      });
    }

    window.addEventListener("storage", function (event) {
      if (event.key === KEY) {
        syncSidebarAvatar();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

/* =========================================================
   PORTOFOLIO WANDI — BRAND PROFILE SYNC
   ========================================================= */
(function () {
  const KEY = "businessHubProfilePhoto";

  function syncBrandPhoto() {
    const brand = document.querySelector(".brand-mark");
    const photo = localStorage.getItem(KEY);

    if (!brand) return;

    brand.classList.add("profile-brand-photo");

    if (photo) {
      brand.textContent = "";
      brand.style.backgroundImage = "url(" + JSON.stringify(photo) + ")";
    } else {
      brand.textContent = "B";
      brand.style.backgroundImage = "none";
    }
  }

  function setupBrandPhoto() {
    syncBrandPhoto();

    const input = document.getElementById("profilePhotoInput");

    if (input) {
      input.addEventListener("change", function () {
        setTimeout(syncBrandPhoto, 100);
      });
    }

    window.addEventListener("storage", function (event) {
      if (event.key === KEY) {
        syncBrandPhoto();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupBrandPhoto, {
      once: true
    });
  } else {
    setupBrandPhoto();
  }
})();

/* =========================================================
   NOTIFICATION CENTER V1
   ========================================================= */
(function () {
  const TX_KEY = "businessHubTransactions";
  const SALES_KEY = "businessHubSalesSafe";
  const PRODUCTS_KEY = "businessHubProductsV3";
  const TARGET_KEY = "businessHubSalesTargetsV1";

  function read(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {
      return [];
    }
  }

  function buildNotifications() {
    const notifications = [];

    const products = read(PRODUCTS_KEY);
    const sales = read(SALES_KEY);
    const transactions = read(TX_KEY);

    // LOW STOCK
    products.forEach(function (product) {
      const stock = Number(product.stock || 0);
      const target = Number(
        product.target ||
        product.targetStock ||
        10
      );

      if (stock <= target) {
        notifications.push({
          icon: "📦",
          title: "Stok rendah",
          text:
            String(product.name || "Produk") +
            " tersisa " +
            stock +
            " unit."
        });
      }
    });

    // SALES TARGET
    let target = null;

    try {
      target = JSON.parse(
        localStorage.getItem(TARGET_KEY) || "null"
      );
    } catch (e) {}

    if (target) {
      const month = String(target.month || "");
      const revenueTarget = Number(target.revenueTarget || 0);

      if (revenueTarget > 0) {
        const revenue = sales.reduce(function (sum, sale) {
          return sum + Number(sale.amount || 0);
        }, 0);

        const achievement =
          (revenue / revenueTarget) * 100;

        if (achievement < 70) {
          notifications.push({
            icon: "🎯",
            title: "Target sales masih rendah",
            text:
              "Pencapaian revenue bulan " +
              month +
              " baru " +
              achievement.toFixed(0) +
              "%."
          });
        }
      }
    }

    // EXPENSE / PROFIT ALERT
    let income = 0;
    let expense = 0;

    transactions.forEach(function (tx) {
      const amount = Number(tx.amount || 0);

      if (
        tx.type === "income" ||
        tx.type === "revenue"
      ) {
        income += amount;
      }

      if (tx.type === "expense") {
        expense += amount;
      }
    });

    if (income > 0 && expense / income >= 0.6) {
      notifications.push({
        icon: "⚠️",
        title: "Expense tinggi",
        text:
          "Expense sudah mencapai " +
          ((expense / income) * 100).toFixed(0) +
          "% dari revenue."
      });
    }

    // RECENT SALES
    if (sales.length > 0) {
      const latest = sales[0];

      notifications.push({
        icon: "💰",
        title: "Penjualan terbaru",
        text:
          String(latest.product || "Produk") +
          " — " +
          String(latest.customer || "Customer")
      });
    }

    return notifications.slice(0, 8);
  }

  function closeCenter() {
    const existing =
      document.getElementById("notificationCenter");

    if (existing) existing.remove();
  }

  function renderCenter() {
    closeCenter();

    const notifications = buildNotifications();

    const panel = document.createElement("div");
    panel.id = "notificationCenter";
    panel.className = "notification-center";

    let html = `
      <div class="notification-center-head">
        <strong>Notifications</strong>
        <span class="notification-count">
          ${notifications.length}
        </span>
      </div>
      <div class="notification-list">
    `;

    if (!notifications.length) {
      html += `
        <div class="notification-empty">
          ✓ Tidak ada notifikasi penting
        </div>
      `;
    } else {
      notifications.forEach(function (item) {
        html += `
          <div class="notification-item">
            <div class="notification-icon">${item.icon}</div>
            <div>
              <strong>${item.title}</strong>
              <span>${item.text}</span>
            </div>
          </div>
        `;
      });
    }

    html += `
      </div>
      <div class="notification-footer">
        Data diperbarui dari aktivitas dashboard
      </div>
    `;

    panel.innerHTML = html;
    document.body.appendChild(panel);
  }

  function setup() {
    const button =
      document.getElementById("notificationButton");

    if (!button) return;

    button.addEventListener("click", function (event) {
      event.stopPropagation();

      const existing =
        document.getElementById("notificationCenter");

      if (existing) {
        closeCenter();
      } else {
        renderCenter();
      }
    });

    document.addEventListener("click", function (event) {
      const panel =
        document.getElementById("notificationCenter");

      if (
        panel &&
        !panel.contains(event.target) &&
        !event.target.closest("#notificationButton")
      ) {
        closeCenter();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      setup,
      { once: true }
    );
  } else {
    setup();
  }
})();

/* =========================================================
   NOTIFICATION POLISH V2 — BADGE SYNC
   ========================================================= */
(function () {
  "use strict";

  function updateNotificationBadge() {
    const panel = document.querySelector(".notification-center");
    const button = document.getElementById("notificationButton");
    const countEl = document.getElementById("notificationCount");

    if (!button || !countEl) return;

    let count = 0;

    if (panel) {
      count = panel.querySelectorAll(".notification-item").length;
    }

    if (count > 99) count = 99;

    countEl.textContent = count > 99 ? "99+" : String(count);

    if (count > 0) {
      countEl.classList.add("show");
      button.classList.add("has-alert");
    } else {
      countEl.classList.remove("show");
      button.classList.remove("has-alert");
    }
  }

  function refreshBadge() {
    setTimeout(updateNotificationBadge, 80);
  }

  document.addEventListener("DOMContentLoaded", refreshBadge);

  document.addEventListener("click", function (e) {
    if (
      e.target.closest("#notificationButton") ||
      e.target.closest(".notification-center")
    ) {
      setTimeout(updateNotificationBadge, 80);
    }
  });

  window.addEventListener("storage", refreshBadge);

  const observer = new MutationObserver(function () {
    updateNotificationBadge();
  });

  function startObserver() {
    const panel = document.querySelector(".notification-center");

    if (panel) {
      observer.observe(panel, {
        childList: true,
        subtree: true
      });

      updateNotificationBadge();
    } else {
      setTimeout(startObserver, 300);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver);
  } else {
    startObserver();
  }
})();

/* =========================================================
   NOTIFICATION ROUTING V1
   Klik notifikasi -> langsung ke halaman terkait
   ========================================================= */
(function () {
  "use strict";

  function goToPage(page) {
    if (!page) return;

    const nav = document.querySelector('[data-page="' + page + '"]');

    if (nav) {
      nav.click();
      return;
    }

    if (typeof window.renderModule === "function") {
      window.renderModule(page);
    }
  }

  function getNotificationTarget(item) {
    if (!item) return null;

    const text = (item.innerText || item.textContent || "").toLowerCase();

    /*
     * Tentukan tujuan berdasarkan isi notifikasi.
     */

    if (
      text.includes("stok") ||
      text.includes("stock") ||
      text.includes("product") ||
      text.includes("produk")
    ) {
      return "products";
    }

    if (
      text.includes("target") ||
      text.includes("sales") ||
      text.includes("penjualan") ||
      text.includes("revenue")
    ) {
      return "sales";
    }

    if (
      text.includes("expense") ||
      text.includes("pengeluaran")
    ) {
      return "expenses";
    }

    if (
      text.includes("profit") ||
      text.includes("laba") ||
      text.includes("rugi") ||
      text.includes("transaksi")
    ) {
      return "finance";
    }

    if (
      text.includes("customer") ||
      text.includes("pelanggan")
    ) {
      return "customers";
    }

    return "dashboard";
  }

  function setupNotificationRouting() {
    const panel = document.querySelector(".notification-center");

    if (!panel || panel.dataset.routingReady === "1") return;

    panel.dataset.routingReady = "1";

    panel.addEventListener("click", function (e) {
      const item = e.target.closest(".notification-item");

      if (!item) return;

      const target =
        item.dataset.page ||
        item.dataset.target ||
        getNotificationTarget(item);

      if (!target) return;

      /*
       * Tandai sebagai sudah dibaca jika sistem
       * notification center memiliki class unread.
       */
      item.classList.remove("unread");
      item.classList.add("notification-read");

      /*
       * Tutup notification center sebelum pindah halaman.
       */
      panel.style.display = "none";

      const button = document.getElementById("notificationButton");

      if (button) {
        button.setAttribute("aria-expanded", "false");
      }

      /*
       * Beri sedikit waktu agar dropdown tertutup
       * sebelum navigasi.
       */
      setTimeout(function () {
        goToPage(target);
      }, 50);
    });
  }

  function watchNotificationPanel() {
    setupNotificationRouting();

    setTimeout(watchNotificationPanel, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchNotificationPanel);
  } else {
    watchNotificationPanel();
  }

})();

/* =========================================================
   NOTIFICATION ENGINE V2
   - unread / read
   - persistent read state
   - contextual page routing
   - badge hanya unread
   ========================================================= */
(function () {
  "use strict";

  const READ_KEY = "businessHubNotificationsReadV2";

  function getReadMap() {
    try {
      return JSON.parse(localStorage.getItem(READ_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveReadMap(map) {
    localStorage.setItem(READ_KEY, JSON.stringify(map));
  }

  function makeId(text) {
    let hash = 0;
    const value = String(text || "");

    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash) + value.charCodeAt(i);
      hash |= 0;
    }

    return "notif-" + Math.abs(hash);
  }

  function detectPage(text) {
    const t = String(text || "").toLowerCase();

    if (
      t.includes("stok") ||
      t.includes("stock") ||
      t.includes("product") ||
      t.includes("produk")
    ) return "products";

    if (
      t.includes("target") ||
      t.includes("sales") ||
      t.includes("penjualan") ||
      t.includes("revenue")
    ) return "sales";

    if (
      t.includes("expense") ||
      t.includes("pengeluaran")
    ) return "expenses";

    if (
      t.includes("customer") ||
      t.includes("pelanggan")
    ) return "customers";

    if (
      t.includes("profit") ||
      t.includes("laba") ||
      t.includes("rugi") ||
      t.includes("transaksi") ||
      t.includes("finance")
    ) return "finance";

    return "dashboard";
  }

  function decorateNotifications() {
    const panel = document.querySelector(".notification-center");
    if (!panel) return;

    const readMap = getReadMap();
    const items = panel.querySelectorAll(".notification-item");

    items.forEach(function (item) {
      const text = (item.innerText || item.textContent || "").trim();
      if (!text) return;

      const id = makeId(text);

      item.dataset.notificationId = id;
      item.dataset.page = item.dataset.page || detectPage(text);

      if (readMap[id]) {
        item.classList.remove("unread");
        item.classList.add("notification-read");
        item.dataset.read = "1";
      } else {
        item.classList.add("unread");
        item.classList.remove("notification-read");
        item.dataset.read = "0";
      }
    });

    updateUnreadBadge();
  }

  function updateUnreadBadge() {
    const panel = document.querySelector(".notification-center");
    const count = document.getElementById("notificationCount");
    const button = document.getElementById("notificationButton");

    if (!count || !button) return;

    let unread = 0;

    if (panel) {
      unread = panel.querySelectorAll(
        '.notification-item.unread:not([data-read="1"])'
      ).length;
    }

    count.textContent = unread > 99 ? "99+" : String(unread);

    if (unread > 0) {
      count.classList.add("show");
      button.classList.add("has-alert");
    } else {
      count.classList.remove("show");
      button.classList.remove("has-alert");
    }
  }

  function markRead(item) {
    if (!item) return;

    const id = item.dataset.notificationId;
    if (!id) return;

    const readMap = getReadMap();
    readMap[id] = Date.now();
    saveReadMap(readMap);

    item.classList.remove("unread");
    item.classList.add("notification-read");
    item.dataset.read = "1";

    updateUnreadBadge();
  }

  function routeToPage(page) {
    if (!page) return;

    const nav = document.querySelector('[data-page="' + page + '"]');

    if (nav) {
      nav.click();
      return;
    }

    if (typeof window.renderModule === "function") {
      window.renderModule(page);
    }
  }

  function setupClickHandler() {
    const panel = document.querySelector(".notification-center");

    if (!panel || panel.dataset.engineV2 === "1") return;

    panel.dataset.engineV2 = "1";

    panel.addEventListener("click", function (e) {
      const item = e.target.closest(".notification-item");

      if (!item) return;

      const page =
        item.dataset.page ||
        detectPage(item.innerText || item.textContent);

      markRead(item);

      setTimeout(function () {
        panel.style.display = "none";

        const button = document.getElementById("notificationButton");

        if (button) {
          button.setAttribute("aria-expanded", "false");
        }

        routeToPage(page);
      }, 60);
    });
  }

  function init() {
    decorateNotifications();
    setupClickHandler();
    updateUnreadBadge();
  }

  const observer = new MutationObserver(function () {
    init();
  });

  function start() {
    init();

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.refreshNotificationEngine = init;

})();

/* =========================================================
   NOTIFICATION ENGINE V3
   REAL EVENT MONITOR
   ========================================================= */
(function () {
  "use strict";

  const EVENTS_KEY = "businessHubNotificationEventsV3";

  const STORAGE = {
    sales: "businessHubSalesSafe",
    transactions: "businessHubTransactions",
    products: "businessHubProductsV3",
    customers: "businessHubCustomersSafe",
    target: "businessHubSalesTargetsV1"
  };

  function read(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value == null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function writeEvents(events) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }

  function getEvents() {
    return read(EVENTS_KEY, {});
  }

  function makeEventId(type, id) {
    return "event-" + type + "-" + String(id);
  }

  function getArray(key) {
    const value = read(key, []);
    return Array.isArray(value) ? value : [];
  }

  function pushEvent(type, id, title, description, page, icon) {
    const events = getEvents();
    const eventId = makeEventId(type, id);

    if (events[eventId]) return false;

    events[eventId] = {
      id: eventId,
      type: type,
      title: title,
      description: description,
      page: page,
      icon: icon || "•",
      createdAt: Date.now()
    };

    writeEvents(events);

    return true;
  }

  function scanSales() {
    const sales = getArray(STORAGE.sales);

    sales.forEach(function (sale) {
      const id = sale.id || sale.date + "-" + sale.customer + "-" + sale.product;

      pushEvent(
        "sale",
        id,
        "Penjualan baru",
        (sale.product || "Produk") +
          " — " +
          (sale.customer || "Customer"),
        "sales",
        "🛒"
      );
    });
  }

  function scanTransactions() {
    const transactions = getArray(STORAGE.transactions);

    transactions.forEach(function (tx) {
      const id =
        tx.id ||
        tx.date + "-" +
        tx.description + "-" +
        tx.amount;

      pushEvent(
        "transaction",
        id,
        tx.type === "expense"
          ? "Pengeluaran baru"
          : "Transaksi pemasukan",
        tx.description ||
          tx.category ||
          "Transaksi Finance",
        tx.type === "expense"
          ? "expenses"
          : "finance",
        tx.type === "expense" ? "💸" : "💰"
      );
    });
  }

  function scanProducts() {
    const products = getArray(STORAGE.products);

    products.forEach(function (product) {
      const stock = Number(product.stock || 0);
      const target = Number(
        product.target ||
        product.targetStock ||
        0
      );

      if (target > 0 && stock <= target) {
        const id =
          product.sku ||
          product.id ||
          product.name;

        pushEvent(
          "low-stock",
          id,
          "Stok rendah",
          (product.name || "Produk") +
            " tersisa " +
            stock +
            " unit",
          "products",
          "📦"
        );
      }
    });
  }

  function scanCustomers() {
    const customers = getArray(STORAGE.customers);

    customers.forEach(function (customer) {
      const id =
        customer.id ||
        customer.name ||
        customer.company;

      pushEvent(
        "customer",
        id,
        "Customer tersedia",
        customer.name ||
          customer.company ||
          "Customer baru",
        "customers",
        "👥"
      );
    });
  }

  function scanSalesTarget() {
    const target = read(STORAGE.target, null);

    if (!target) return;

    const sales = getArray(STORAGE.sales);

    const month = target.month ||
      new Date().toISOString().slice(0, 7);

    const monthSales = sales.filter(function (sale) {
      const date = String(sale.date || "");

      return date.includes(month);
    });

    const revenue = monthSales.reduce(function (sum, sale) {
      return sum + Number(sale.amount || 0);
    }, 0);

    const targetRevenue = Number(
      target.revenueTarget || 0
    );

    if (targetRevenue <= 0) return;

    const achievement =
      revenue / targetRevenue * 100;

    if (achievement < 70) {
      pushEvent(
        "sales-target",
        month,
        "Target sales tertinggal",
        "Pencapaian revenue baru " +
          achievement.toFixed(0) +
          "% dari target",
        "sales",
        "🎯"
      );
    }
  }

  function scanFinanceHealth() {
    const transactions =
      getArray(STORAGE.transactions);

    const revenue = transactions
      .filter(function (tx) {
        return tx.type === "income";
      })
      .reduce(function (sum, tx) {
        return sum + Number(tx.amount || 0);
      }, 0);

    const expenses = transactions
      .filter(function (tx) {
        return tx.type === "expense";
      })
      .reduce(function (sum, tx) {
        return sum + Number(tx.amount || 0);
      }, 0);

    if (revenue > 0) {
      const expenseRatio =
        expenses / revenue * 100;

      if (expenseRatio >= 60) {
        pushEvent(
          "expense-health",
          "current",
          "Expense tinggi",
          "Expense mencapai " +
            expenseRatio.toFixed(0) +
            "% dari revenue",
          "expenses",
          "⚠️"
        );
      }
    }

    if (expenses > revenue && expenses > 0) {
      pushEvent(
        "negative-profit",
        "current",
        "Profit negatif",
        "Total expense saat ini lebih besar dari revenue",
        "finance",
        "🔴"
      );
    }
  }

  function cleanOldEvents() {
    const events = getEvents();
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000;

    Object.keys(events).forEach(function (id) {
      if (
        now - Number(events[id].createdAt || 0) >
        maxAge
      ) {
        delete events[id];
      }
    });

    writeEvents(events);
  }

  function runScan() {
    scanSales();
    scanTransactions();
    scanProducts();
    scanCustomers();
    scanSalesTarget();
    scanFinanceHealth();
    cleanOldEvents();

    if (
      typeof window.refreshNotificationEngine ===
      "function"
    ) {
      window.refreshNotificationEngine();
    }
  }

  /*
   * Jalankan setelah aplikasi selesai load.
   */
  function start() {
    setTimeout(runScan, 500);

    /*
     * Cek kembali setiap 10 detik.
     * Tidak membuat duplikat karena setiap event
     * memiliki ID unik.
     */
    setInterval(runScan, 10000);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

  window.runNotificationScanV3 = runScan;

})();

/* =========================================================
   NOTIFICATION ENGINE V4
   BASELINE + NEW EVENT DETECTION
   ========================================================= */
(function () {
  "use strict";

  const BASELINE_KEY = "businessHubNotificationBaselineV4";
  const EVENTS_KEY = "businessHubNotificationEventsV3";

  const STORAGE = {
    sales: "businessHubSalesSafe",
    transactions: "businessHubTransactions",
    products: "businessHubProductsV3",
    customers: "businessHubCustomersSafe"
  };

  function read(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value == null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getArray(key) {
    const value = read(key, []);
    return Array.isArray(value) ? value : [];
  }

  function makeKey(value) {
    let hash = 0;
    const str = String(value || "");

    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }

    return String(Math.abs(hash));
  }

  function itemKey(prefix, item) {
    return prefix + "-" + makeKey(
      item.id ||
      item.sku ||
      item.name ||
      item.company ||
      JSON.stringify(item)
    );
  }

  function getBaseline() {
    return read(BASELINE_KEY, null);
  }

  function createBaseline() {
    const baseline = {
      sales: getArray(STORAGE.sales).map(function (x) {
        return itemKey("sale", x);
      }),

      transactions: getArray(STORAGE.transactions).map(function (x) {
        return itemKey("tx", x);
      }),

      customers: getArray(STORAGE.customers).map(function (x) {
        return itemKey("customer", x);
      }),

      products: getArray(STORAGE.products).map(function (x) {
        return {
          id: itemKey("product", x),
          stock: Number(x.stock || 0)
        };
      }),

      createdAt: Date.now()
    };

    write(BASELINE_KEY, baseline);

    return baseline;
  }

  function getEvents() {
    return read(EVENTS_KEY, {});
  }

  function saveEvents(events) {
    write(EVENTS_KEY, events);
  }

  function addEvent(id, title, description, page, icon) {
    const events = getEvents();

    if (events[id]) return;

    events[id] = {
      id: id,
      title: title,
      description: description,
      page: page,
      icon: icon || "•",
      createdAt: Date.now()
    };

    saveEvents(events);
  }

  function detectNewCollection(
    current,
    previous,
    prefix,
    callback
  ) {
    const old = new Set(previous || []);

    current.forEach(function (item) {
      const key = itemKey(prefix, item);

      if (!old.has(key)) {
        callback(item, key);
      }
    });
  }

  function scan() {
    let baseline = getBaseline();

    /*
     * Pertama kali:
     * semua data yang sudah ada dianggap data lama.
     */
    if (!baseline) {
      createBaseline();

      /*
       * Bersihkan event lama dari versi sebelumnya
       * agar badge tidak tiba-tiba penuh.
       */
      write(EVENTS_KEY, {});

      if (
        typeof window.refreshNotificationEngine ===
        "function"
      ) {
        window.refreshNotificationEngine();
      }

      return;
    }

    /* =========================
       SALES BARU
       ========================= */
    const sales = getArray(STORAGE.sales);

    detectNewCollection(
      sales,
      baseline.sales,
      "sale",
      function (sale, key) {
        addEvent(
          "new-" + key,
          "Penjualan baru",
          (sale.product || "Produk") +
            " — " +
            (sale.customer || "Customer"),
          "sales",
          "🛒"
        );
      }
    );

    /* =========================
       TRANSAKSI BARU
       ========================= */
    const transactions =
      getArray(STORAGE.transactions);

    detectNewCollection(
      transactions,
      baseline.transactions,
      "tx",
      function (tx, key) {
        addEvent(
          "new-" + key,
          tx.type === "expense"
            ? "Pengeluaran baru"
            : "Transaksi pemasukan",
          tx.description ||
            tx.category ||
            "Transaksi Finance",
          tx.type === "expense"
            ? "expenses"
            : "finance",
          tx.type === "expense"
            ? "💸"
            : "💰"
        );
      }
    );

    /* =========================
       CUSTOMER BARU
       ========================= */
    const customers =
      getArray(STORAGE.customers);

    detectNewCollection(
      customers,
      baseline.customers,
      "customer",
      function (customer, key) {
        addEvent(
          "new-" + key,
          "Customer baru",
          customer.name ||
            customer.company ||
            "Customer baru",
          "customers",
          "👥"
        );
      }
    );

    /* =========================
       STOK TURUN
       ========================= */
    const products =
      getArray(STORAGE.products);

    const oldProducts = {};

    (baseline.products || []).forEach(function (p) {
      oldProducts[p.id] = Number(p.stock || 0);
    });

    products.forEach(function (product) {
      const id = itemKey("product", product);
      const currentStock = Number(product.stock || 0);

      if (!Object.prototype.hasOwnProperty.call(oldProducts, id)) {
        return;
      }

      const oldStock = oldProducts[id];

      /*
       * Hanya beri notifikasi jika stok benar-benar turun.
       */
      if (currentStock < oldStock) {
        addEvent(
          "stock-change-" +
            id +
            "-" +
            currentStock,
          "Stok berkurang",
          (product.name || "Produk") +
            " : " +
            oldStock +
            " → " +
            currentStock,
          "products",
          "📦"
        );
      }

      /*
       * Stok kritis.
       */
      const target = Number(
        product.target ||
        product.targetStock ||
        0
      );

      if (
        target > 0 &&
        currentStock <= target &&
        oldStock > target
      ) {
        addEvent(
          "low-stock-" +
            id +
            "-" +
            currentStock,
          "Stok rendah",
          (product.name || "Produk") +
            " tersisa " +
            currentStock +
            " unit",
          "products",
          "⚠️"
        );
      }
    });

    /*
     * Update baseline setelah scan.
     */
    baseline.sales = sales.map(function (x) {
      return itemKey("sale", x);
    });

    baseline.transactions = transactions.map(function (x) {
      return itemKey("tx", x);
    });

    baseline.customers = customers.map(function (x) {
      return itemKey("customer", x);
    });

    baseline.products = products.map(function (x) {
      return {
        id: itemKey("product", x),
        stock: Number(x.stock || 0)
      };
    });

    write(BASELINE_KEY, baseline);

    if (
      typeof window.refreshNotificationEngine ===
      "function"
    ) {
      window.refreshNotificationEngine();
    }
  }

  /*
   * Monitor setiap 3 detik agar perubahan lokal
   * cepat masuk ke notification center.
   */
  function start() {
    setTimeout(scan, 800);

    setInterval(scan, 3000);

    window.addEventListener(
      "storage",
      function (e) {
        if (
          e.key === STORAGE.sales ||
          e.key === STORAGE.transactions ||
          e.key === STORAGE.products ||
          e.key === STORAGE.customers
        ) {
          scan();
        }
      }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

  window.runNotificationEngineV4 = scan;

})();

/* =========================================================
   PORTOFOLIO WANDI — DASHBOARD QUICK ACTIONS V1
   ========================================================= */
(function () {
  "use strict";

  const ROUTES = {
    sales: "sales",
    finance: "finance",
    products: "products",
    customers: "customers",
    expenses: "expenses",
    opportunities: "opportunities"
  };

  function openPage(page) {
    if (!page) return;

    const nav = document.querySelector(
      '[data-page="' + page + '"]'
    );

    if (nav) {
      nav.click();
      return;
    }

    if (typeof window.renderModule === "function") {
      window.renderModule(page);
    }
  }

  function findAction(text) {
    const value = String(text || "").toLowerCase();

    if (
      value.includes("sales") ||
      value.includes("penjualan") ||
      value.includes("jual")
    ) {
      return ROUTES.sales;
    }

    if (
      value.includes("finance") ||
      value.includes("keuangan") ||
      value.includes("transaksi")
    ) {
      return ROUTES.finance;
    }

    if (
      value.includes("product") ||
      value.includes("produk") ||
      value.includes("inventory") ||
      value.includes("stok")
    ) {
      return ROUTES.products;
    }

    if (
      value.includes("customer") ||
      value.includes("pelanggan")
    ) {
      return ROUTES.customers;
    }

    if (
      value.includes("expense") ||
      value.includes("pengeluaran")
    ) {
      return ROUTES.expenses;
    }

    if (
      value.includes("opportun") ||
      value.includes("peluang") ||
      value.includes("action")
    ) {
      return ROUTES.opportunities;
    }

    return null;
  }

  function setup() {
    const buttons = document.querySelectorAll(
      ".bh4-actions button, " +
      ".quick-actions button, " +
      ".bh4-quick-action"
    );

    buttons.forEach(function (button) {
      if (button.dataset.quickActionReady === "1") {
        return;
      }

      const page =
        button.dataset.page ||
        button.dataset.target ||
        findAction(
          button.innerText ||
          button.textContent ||
          ""
        );

      if (!page) return;

      button.dataset.quickActionReady = "1";
      button.dataset.quickTarget = page;

      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        openPage(page);
      });
    });
  }

  function start() {
    setup();

    /*
     * Dashboard dirender ulang secara dinamis,
     * sehingga observer memastikan Quick Actions
     * tetap aktif setelah refresh dashboard.
     */
    const observer = new MutationObserver(function () {
      setup();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

})();

/* =========================================================
   PORTOFOLIO WANDI — GLOBAL SEARCH V1
   ========================================================= */
(function () {
  "use strict";

  const STORAGE = {
    products: "businessHubProductsV3",
    customers: "businessHubCustomersSafe",
    sales: "businessHubSalesSafe",
    transactions: "businessHubTransactions"
  };

  function read(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (e) {
      return [];
    }
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function openPage(page) {
    const nav = document.querySelector(
      '[data-page="' + page + '"]'
    );

    if (nav) {
      nav.click();
    } else if (
      typeof window.renderModule === "function"
    ) {
      window.renderModule(page);
    }
  }

  function collectResults(query) {
    const q = query.toLowerCase().trim();

    if (!q) return [];

    const results = [];

    read(STORAGE.products).forEach(function (item) {
      const text = [
        item.name,
        item.sku,
        item.category
      ].join(" ").toLowerCase();

      if (text.includes(q)) {
        results.push({
          type: "Product",
          icon: "📦",
          title: item.name || "Product",
          detail: item.sku || item.category || "",
          page: "products"
        });
      }
    });

    read(STORAGE.customers).forEach(function (item) {
      const text = [
        item.name,
        item.company,
        item.segment
      ].join(" ").toLowerCase();

      if (text.includes(q)) {
        results.push({
          type: "Customer",
          icon: "👥",
          title:
            item.name ||
            item.company ||
            "Customer",
          detail: item.segment || "",
          page: "customers"
        });
      }
    });

    read(STORAGE.sales).forEach(function (item) {
      const text = [
        item.customer,
        item.product,
        item.date
      ].join(" ").toLowerCase();

      if (text.includes(q)) {
        results.push({
          type: "Sale",
          icon: "🛒",
          title:
            item.product ||
            "Sales transaction",
          detail:
            item.customer ||
            item.date ||
            "",
          page: "sales"
        });
      }
    });

    read(STORAGE.transactions).forEach(function (item) {
      const text = [
        item.description,
        item.category,
        item.date,
        item.type
      ].join(" ").toLowerCase();

      if (text.includes(q)) {
        results.push({
          type:
            item.type === "expense"
              ? "Expense"
              : "Finance",
          icon:
            item.type === "expense"
              ? "💸"
              : "💰",
          title:
            item.description ||
            item.category ||
            "Transaction",
          detail: item.date || "",
          page:
            item.type === "expense"
              ? "expenses"
              : "finance"
        });
      }
    });

    return results.slice(0, 12);
  }

  function createSearchUI() {
    if (document.getElementById("pwGlobalSearch")) {
      return;
    }

    const overlay =
      document.createElement("div");

    overlay.id = "pwGlobalSearch";
    overlay.innerHTML = `
      <div class="pw-search-box">
        <div class="pw-search-header">
          <strong>Global Search</strong>
          <button type="button" id="pwSearchClose">×</button>
        </div>

        <div class="pw-search-input-wrap">
          <span>⌕</span>
          <input
            id="pwSearchInput"
            type="search"
            autocomplete="off"
            placeholder="Cari product, customer, sales..."
          />
        </div>

        <div
          id="pwSearchResults"
          class="pw-search-results"
        >
          <div class="pw-search-empty">
            Ketik untuk mencari...
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const input =
      document.getElementById("pwSearchInput");

    const results =
      document.getElementById("pwSearchResults");

    function renderResults(query) {
      const data = collectResults(query);

      if (!query.trim()) {
        results.innerHTML = `
          <div class="pw-search-empty">
            Ketik untuk mencari product, customer,
            sales atau transaksi.
          </div>
        `;
        return;
      }

      if (!data.length) {
        results.innerHTML = `
          <div class="pw-search-empty">
            Tidak ada hasil untuk
            "<strong>${esc(query)}</strong>"
          </div>
        `;
        return;
      }

      results.innerHTML = data.map(function (item, index) {
        return `
          <button
            type="button"
            class="pw-search-result"
            data-index="${index}"
          >
            <span class="pw-search-result-icon">
              ${item.icon}
            </span>

            <span class="pw-search-result-main">
              <strong>${esc(item.title)}</strong>
              <small>
                ${esc(item.type)}
                ${item.detail
                  ? " · " + esc(item.detail)
                  : ""}
              </small>
            </span>

            <span class="pw-search-arrow">›</span>
          </button>
        `;
      }).join("");

      results
        .querySelectorAll(".pw-search-result")
        .forEach(function (button) {
          button.addEventListener(
            "click",
            function () {
              const index =
                Number(button.dataset.index);

              const item = data[index];

              if (!item) return;

              overlay.classList.remove("open");

              input.value = "";

              setTimeout(function () {
                openPage(item.page);
              }, 80);
            }
          );
        });
    }

    input.addEventListener(
      "input",
      function () {
        renderResults(input.value);
      }
    );

    document
      .getElementById("pwSearchClose")
      .addEventListener(
        "click",
        function () {
          overlay.classList.remove("open");
          input.value = "";
        }
      );

    overlay.addEventListener(
      "click",
      function (event) {
        if (event.target === overlay) {
          overlay.classList.remove("open");
          input.value = "";
        }
      }
    );

    document.addEventListener(
      "keydown",
      function (event) {
        if (
          event.key === "/" &&
          document.activeElement.tagName !==
            "INPUT" &&
          document.activeElement.tagName !==
            "TEXTAREA"
        ) {
          event.preventDefault();

          overlay.classList.add("open");

          setTimeout(function () {
            input.focus();
          }, 50);
        }

        if (
          event.key === "Escape" &&
          overlay.classList.contains("open")
        ) {
          overlay.classList.remove("open");
          input.value = "";
        }
      }
    );

    window.openPWGlobalSearch = function () {
      overlay.classList.add("open");

      setTimeout(function () {
        input.focus();
      }, 50);
    };
  }

  function connectSearchButton() {
    const button =
      document.getElementById("searchButton");

    if (!button || button.dataset.searchReady === "1") {
      return;
    }

    button.dataset.searchReady = "1";

    button.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        createSearchUI();

        if (
          typeof window.openPWGlobalSearch ===
          "function"
        ) {
          window.openPWGlobalSearch();
        }
      }
    );
  }

  function start() {
    createSearchUI();
    connectSearchButton();

    setTimeout(connectSearchButton, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

})();

/* =========================================================
   PORTOFOLIO WANDI — COMMAND CENTER V1
   Search -> quick navigation commands
   ========================================================= */
(function () {
  "use strict";

  const COMMANDS = [
    {
      keys: ["dashboard", "home", "beranda"],
      title: "Dashboard",
      description: "Buka Executive Dashboard",
      page: "dashboard",
      icon: "⌂"
    },
    {
      keys: ["sales", "sale", "penjualan"],
      title: "Sales",
      description: "Buka Sales Management",
      page: "sales",
      icon: "🛒"
    },
    {
      keys: ["products", "product", "produk", "inventory", "stok"],
      title: "Products",
      description: "Buka Products & Inventory",
      page: "products",
      icon: "📦"
    },
    {
      keys: ["customers", "customer", "pelanggan"],
      title: "Customers",
      description: "Buka Customer Management",
      page: "customers",
      icon: "👥"
    },
    {
      keys: ["finance", "keuangan", "cashflow"],
      title: "Finance",
      description: "Buka Finance",
      page: "finance",
      icon: "💰"
    },
    {
      keys: ["expenses", "expense", "pengeluaran"],
      title: "Expenses",
      description: "Buka Expense Management",
      page: "expenses",
      icon: "💸"
    },
    {
      keys: ["revenue", "pendapatan"],
      title: "Revenue",
      description: "Buka Revenue",
      page: "revenue",
      icon: "📈"
    },
    {
      keys: ["opportunities", "opportunity", "peluang"],
      title: "Opportunities",
      description: "Buka Opportunity Center",
      page: "opportunities",
      icon: "⚡"
    }
  ];

  function openPage(page) {
    const nav = document.querySelector(
      '[data-page="' + page + '"]'
    );

    if (nav) {
      nav.click();
      return;
    }

    if (typeof window.renderModule === "function") {
      window.renderModule(page);
    }
  }

  function getCommands(query) {
    const q = String(query || "")
      .trim()
      .toLowerCase();

    if (!q) return [];

    return COMMANDS.filter(function (command) {
      return command.keys.some(function (key) {
        return (
          key === q ||
          key.startsWith(q) ||
          q.includes(key)
        );
      });
    });
  }

  function renderCommands() {
    const input =
      document.getElementById("pwSearchInput");

    const results =
      document.getElementById("pwSearchResults");

    if (!input || !results) return;

    const commands = getCommands(input.value);

    if (!commands.length) return;

    const existing =
      results.querySelector(".pw-command-section");

    if (existing) {
      existing.remove();
    }

    const section =
      document.createElement("div");

    section.className = "pw-command-section";

    section.innerHTML = `
      <div class="pw-command-label">
        QUICK NAVIGATION
      </div>

      ${commands.map(function (command, index) {
        return `
          <button
            type="button"
            class="pw-command-item"
            data-command-index="${index}"
          >
            <span class="pw-command-icon">
              ${command.icon}
            </span>

            <span class="pw-command-main">
              <strong>${command.title}</strong>
              <small>${command.description}</small>
            </span>

            <span class="pw-command-arrow">›</span>
          </button>
        `;
      }).join("")}
    `;

    results.insertBefore(
      section,
      results.firstChild
    );

    section
      .querySelectorAll(".pw-command-item")
      .forEach(function (button) {
        button.addEventListener(
          "click",
          function () {
            const index =
              Number(
                button.dataset.commandIndex
              );

            const command = commands[index];

            if (!command) return;

            const overlay =
              document.getElementById(
                "pwGlobalSearch"
              );

            if (overlay) {
              overlay.classList.remove("open");
            }

            input.value = "";

            setTimeout(function () {
              openPage(command.page);
            }, 80);
          }
        );
      });
  }

  function connect() {
    const input =
      document.getElementById("pwSearchInput");

    if (!input || input.dataset.commandReady === "1") {
      return;
    }

    input.dataset.commandReady = "1";

    input.addEventListener(
      "input",
      function () {
        setTimeout(renderCommands, 0);
      }
    );
  }

  function start() {
    connect();

    setInterval(connect, 700);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

})();

/* =========================================================
   PORTOFOLIO WANDI — ACTIVITY CENTER V1
   ========================================================= */
(function () {
  "use strict";

  const KEY = "businessHubActivityCenterV1";
  const MAX_ITEMS = 60;

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function save(items) {
    localStorage.setItem(
      KEY,
      JSON.stringify(items.slice(0, MAX_ITEMS))
    );
  }

  function addActivity(type, title, description, page) {
    const items = load();

    const item = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      type: type,
      title: title,
      description: description || "",
      page: page || "dashboard",
      time: new Date().toISOString()
    };

    items.unshift(item);
    save(items);

    window.dispatchEvent(
      new CustomEvent("pwActivityAdded")
    );

    return item;
  }

  function formatTime(value) {
    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function icon(type) {
    const icons = {
      sale: "🛒",
      finance: "💰",
      stock: "📦",
      customer: "👤",
      target: "🎯",
      system: "⚡"
    };

    return icons[type] || icons.system;
  }

  function renderActivityCenter() {
    const container =
      document.getElementById("pwActivityCenter");

    if (!container) return;

    const items = load();

    if (!items.length) {
      container.innerHTML = `
        <div class="pw-activity-empty">
          <div>◷</div>
          <strong>Belum ada aktivitas</strong>
          <span>Aktivitas bisnis baru akan muncul di sini.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = items.slice(0, 20).map(function (item) {
      return `
        <button
          type="button"
          class="pw-activity-item"
          data-activity-page="${item.page || "dashboard"}"
        >
          <span class="pw-activity-icon">
            ${icon(item.type)}
          </span>

          <span class="pw-activity-content">
            <strong>${escapeHtml(item.title)}</strong>
            <small>${escapeHtml(item.description || "")}</small>
            <em>${formatTime(item.time)}</em>
          </span>

          <span class="pw-activity-arrow">›</span>
        </button>
      `;
    }).join("");

    container
      .querySelectorAll(".pw-activity-item")
      .forEach(function (button) {
        button.addEventListener("click", function () {
          const page =
            button.dataset.activityPage;

          const nav =
            document.querySelector(
              '[data-page="' + page + '"]'
            );

          if (nav) {
            nav.click();
          }
        });
      });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function injectUI() {
    if (document.getElementById("pwActivityCenter")) {
      renderActivityCenter();
      return;
    }

    const main =
      document.querySelector("#dashboardExtras");

    if (!main) return;

    const wrapper =
      document.createElement("section");

    wrapper.className = "pw-activity-card";

    wrapper.innerHTML = `
      <div class="pw-activity-header">
        <div>
          <span class="pw-section-kicker">
            BUSINESS ACTIVITY
          </span>
          <h3>Recent Activity</h3>
        </div>

        <button
          type="button"
          class="pw-activity-refresh"
          id="pwActivityRefresh"
        >
          ↻
        </button>
      </div>

      <div id="pwActivityCenter"></div>
    `;

    main.appendChild(wrapper);

    const refresh =
      document.getElementById(
        "pwActivityRefresh"
      );

    if (refresh) {
      refresh.addEventListener(
        "click",
        renderActivityCenter
      );
    }

    renderActivityCenter();
  }

  function monitorData() {
    const signatures = {};

    const sources = [
      {
        key: "businessHubSalesSafe",
        type: "sale",
        page: "sales",
        title: "New sale recorded",
        description: "Sales data berubah"
      },
      {
        key: "businessHubTransactions",
        type: "finance",
        page: "finance",
        title: "Finance activity updated",
        description: "Transaksi finance berubah"
      },
      {
        key: "businessHubProductsV3",
        type: "stock",
        page: "products",
        title: "Inventory updated",
        description: "Data produk atau stok berubah"
      },
      {
        key: "businessHubCustomersSafe",
        type: "customer",
        page: "customers",
        title: "Customer database updated",
        description: "Data customer berubah"
      },
      {
        key: "businessHubSalesTargetsV1",
        type: "target",
        page: "sales",
        title: "Sales target updated",
        description: "Target penjualan berubah"
      }
    ];

    function scan() {
      sources.forEach(function (source) {
        let raw =
          localStorage.getItem(source.key) || "";

        let signature =
          raw.length + ":" +
          raw.slice(-120);

        if (
          signatures[source.key] === undefined
        ) {
          signatures[source.key] = signature;
          return;
        }

        if (
          signatures[source.key] !== signature
        ) {
          signatures[source.key] = signature;

          addActivity(
            source.type,
            source.title,
            source.description,
            source.page
          );

          renderActivityCenter();
        }
      });
    }

    setInterval(scan, 2500);
  }

  window.addBusinessActivity = addActivity;
  window.renderActivityCenter =
    renderActivityCenter;

  function start() {
    injectUI();
    monitorData();

    window.addEventListener(
      "pwActivityAdded",
      renderActivityCenter
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

})();

/* =========================================================
   PORTOFOLIO WANDI — DATA HEALTH CENTER V1
   ========================================================= */
(function () {
  "use strict";

  const SOURCES = [
    {
      key: "businessHubTransactions",
      name: "Finance",
      page: "finance"
    },
    {
      key: "businessHubSalesSafe",
      name: "Sales",
      page: "sales"
    },
    {
      key: "businessHubProductsV3",
      name: "Products",
      page: "products"
    },
    {
      key: "businessHubCustomersSafe",
      name: "Customers",
      page: "customers"
    },
    {
      key: "businessHubSalesTargetsV1",
      name: "Sales Target",
      page: "sales"
    }
  ];

  function inspect(source) {
    const raw = localStorage.getItem(source.key);

    if (raw === null) {
      return {
        status: "empty",
        label: "Not configured",
        count: 0
      };
    }

    if (!raw.trim()) {
      return {
        status: "empty",
        label: "Empty",
        count: 0
      };
    }

    try {
      const data = JSON.parse(raw);

      let count = 1;

      if (Array.isArray(data)) {
        count = data.length;
      } else if (
        data &&
        typeof data === "object"
      ) {
        count = Object.keys(data).length;
      }

      return {
        status: "healthy",
        label: "Healthy",
        count: count
      };
    } catch (error) {
      return {
        status: "error",
        label: "Invalid data",
        count: 0
      };
    }
  }

  function getHealth() {
    return SOURCES.map(function (source) {
      return {
        ...source,
        ...inspect(source)
      };
    });
  }

  function getOverall() {
    const data = getHealth();

    const errors = data.filter(function (item) {
      return item.status === "error";
    }).length;

    const empty = data.filter(function (item) {
      return item.status === "empty";
    }).length;

    if (errors > 0) {
      return {
        status: "error",
        label: "Needs attention"
      };
    }

    if (empty > 0) {
      return {
        status: "warning",
        label: "Partially configured"
      };
    }

    return {
      status: "healthy",
      label: "All systems healthy"
    };
  }

  function icon(status) {
    if (status === "healthy") return "✓";
    if (status === "warning") return "!";
    return "×";
  }

  function render() {
    const container =
      document.getElementById(
        "pwDataHealthContent"
      );

    if (!container) return;

    const data = getHealth();
    const overall = getOverall();

    container.innerHTML = `
      <div class="pw-health-summary">
        <div class="pw-health-status ${overall.status}">
          <span>${icon(overall.status)}</span>
          <div>
            <strong>${overall.label}</strong>
            <small>
              ${data.length} data modules monitored
            </small>
          </div>
        </div>

        <button
          type="button"
          id="pwHealthRefresh"
          class="pw-health-refresh"
        >
          ↻
        </button>
      </div>

      <div class="pw-health-list">
        ${data.map(function (item) {
          return `
            <button
              type="button"
              class="pw-health-row"
              data-health-page="${item.page}"
            >
              <span class="pw-health-dot ${item.status}">
                ${icon(item.status)}
              </span>

              <span class="pw-health-name">
                <strong>${item.name}</strong>
                <small>
                  ${item.status === "healthy"
                    ? item.count + " record"
                      + (item.count === 1 ? "" : "s")
                    : item.label}
                </small>
              </span>

              <span class="pw-health-label ${item.status}">
                ${item.label}
              </span>

              <span class="pw-health-arrow">›</span>
            </button>
          `;
        }).join("")}
      </div>
    `;

    const refresh =
      document.getElementById(
        "pwHealthRefresh"
      );

    if (refresh) {
      refresh.addEventListener(
        "click",
        render
      );
    }

    container
      .querySelectorAll(
        ".pw-health-row"
      )
      .forEach(function (row) {
        row.addEventListener(
          "click",
          function () {
            const page =
              row.dataset.healthPage;

            const nav =
              document.querySelector(
                '[data-page="' + page + '"]'
              );

            if (nav) nav.click();
          }
        );
      });
  }

  function inject() {
    if (
      document.getElementById(
        "pwDataHealthCard"
      )
    ) {
      render();
      return;
    }

    const main =
      document.querySelector("#dashboardExtras");

    if (!main) return;

    const card =
      document.createElement("section");

    card.id = "pwDataHealthCard";
    card.className = "pw-data-health-card";

    card.innerHTML = `
      <div class="pw-health-heading">
        <div>
          <span>DATA INTEGRITY</span>
          <h3>Data Health Center</h3>
        </div>
        <div class="pw-health-pulse"></div>
      </div>

      <div id="pwDataHealthContent"></div>
    `;

    main.appendChild(card);

    render();
  }

  function start() {
    inject();

    setInterval(function () {
      render();
    }, 5000);

    window.addEventListener(
      "storage",
      render
    );

    window.addEventListener(
      "pwActivityAdded",
      render
    );
  }

  window.getPortofolioDataHealth =
    getHealth;

  window.getPortofolioOverallHealth =
    getOverall;

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

})();

/* =========================================================
   PORTOFOLIO WANDI — DATA HEALTH CENTER V1
   ========================================================= */
(function () {
  "use strict";

  const SOURCES = [
    {
      key: "businessHubTransactions",
      name: "Finance",
      page: "finance"
    },
    {
      key: "businessHubSalesSafe",
      name: "Sales",
      page: "sales"
    },
    {
      key: "businessHubProductsV3",
      name: "Products",
      page: "products"
    },
    {
      key: "businessHubCustomersSafe",
      name: "Customers",
      page: "customers"
    },
    {
      key: "businessHubSalesTargetsV1",
      name: "Sales Target",
      page: "sales"
    }
  ];

  function inspect(source) {
    const raw = localStorage.getItem(source.key);

    if (raw === null) {
      return {
        status: "empty",
        label: "Not configured",
        count: 0
      };
    }

    if (!raw.trim()) {
      return {
        status: "empty",
        label: "Empty",
        count: 0
      };
    }

    try {
      const data = JSON.parse(raw);

      let count = 1;

      if (Array.isArray(data)) {
        count = data.length;
      } else if (
        data &&
        typeof data === "object"
      ) {
        count = Object.keys(data).length;
      }

      return {
        status: "healthy",
        label: "Healthy",
        count: count
      };
    } catch (error) {
      return {
        status: "error",
        label: "Invalid data",
        count: 0
      };
    }
  }

  function getHealth() {
    return SOURCES.map(function (source) {
      return {
        ...source,
        ...inspect(source)
      };
    });
  }

  function getOverall() {
    const data = getHealth();

    const errors = data.filter(function (item) {
      return item.status === "error";
    }).length;

    const empty = data.filter(function (item) {
      return item.status === "empty";
    }).length;

    if (errors > 0) {
      return {
        status: "error",
        label: "Needs attention"
      };
    }

    if (empty > 0) {
      return {
        status: "warning",
        label: "Partially configured"
      };
    }

    return {
      status: "healthy",
      label: "All systems healthy"
    };
  }

  function icon(status) {
    if (status === "healthy") return "✓";
    if (status === "warning") return "!";
    return "×";
  }

  function render() {
    const container =
      document.getElementById(
        "pwDataHealthContent"
      );

    if (!container) return;

    const data = getHealth();
    const overall = getOverall();

    container.innerHTML = `
      <div class="pw-health-summary">
        <div class="pw-health-status ${overall.status}">
          <span>${icon(overall.status)}</span>
          <div>
            <strong>${overall.label}</strong>
            <small>
              ${data.length} data modules monitored
            </small>
          </div>
        </div>

        <button
          type="button"
          id="pwHealthRefresh"
          class="pw-health-refresh"
        >
          ↻
        </button>
      </div>

      <div class="pw-health-list">
        ${data.map(function (item) {
          return `
            <button
              type="button"
              class="pw-health-row"
              data-health-page="${item.page}"
            >
              <span class="pw-health-dot ${item.status}">
                ${icon(item.status)}
              </span>

              <span class="pw-health-name">
                <strong>${item.name}</strong>
                <small>
                  ${item.status === "healthy"
                    ? item.count + " record"
                      + (item.count === 1 ? "" : "s")
                    : item.label}
                </small>
              </span>

              <span class="pw-health-label ${item.status}">
                ${item.label}
              </span>

              <span class="pw-health-arrow">›</span>
            </button>
          `;
        }).join("")}
      </div>
    `;

    const refresh =
      document.getElementById(
        "pwHealthRefresh"
      );

    if (refresh) {
      refresh.addEventListener(
        "click",
        render
      );
    }

    container
      .querySelectorAll(
        ".pw-health-row"
      )
      .forEach(function (row) {
        row.addEventListener(
          "click",
          function () {
            const page =
              row.dataset.healthPage;

            const nav =
              document.querySelector(
                '[data-page="' + page + '"]'
              );

            if (nav) nav.click();
          }
        );
      });
  }

  function inject() {
    if (
      document.getElementById(
        "pwDataHealthCard"
      )
    ) {
      render();
      return;
    }

    const main =
      document.querySelector("#dashboardExtras");

    if (!main) return;

    const card =
      document.createElement("section");

    card.id = "pwDataHealthCard";
    card.className = "pw-data-health-card";

    card.innerHTML = `
      <div class="pw-health-heading">
        <div>
          <span>DATA INTEGRITY</span>
          <h3>Data Health Center</h3>
        </div>
        <div class="pw-health-pulse"></div>
      </div>

      <div id="pwDataHealthContent"></div>
    `;

    main.appendChild(card);

    render();
  }

  function start() {
    inject();

    setInterval(function () {
      render();
    }, 5000);

    window.addEventListener(
      "storage",
      render
    );

    window.addEventListener(
      "pwActivityAdded",
      render
    );
  }

  window.getPortofolioDataHealth =
    getHealth;

  window.getPortofolioOverallHealth =
    getOverall;

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

})();

/* =========================================================
   PORTOFOLIO WANDI — EXECUTIVE KPI INTELLIGENCE V1
   ========================================================= */
(function () {
  "use strict";

  const TX_KEY = "businessHubTransactions";
  const SALES_KEY = "businessHubSalesSafe";
  const PRODUCTS_KEY = "businessHubProductsV3";
  const TARGET_KEY = "businessHubSalesTargetsV1";

  function read(key, fallback) {
    try {
      const value = JSON.parse(
        localStorage.getItem(key) || ""
      );

      return value == null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function number(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function money(value) {
    return "Rp " + Math.round(value).toLocaleString("id-ID");
  }

  function pct(value) {
    return number(value).toFixed(1) + "%";
  }

  function dateKey(date) {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return "";
    }

    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("-");
  }

  function monthRange(offset) {
    const now = new Date();

    const start = new Date(
      now.getFullYear(),
      now.getMonth() + offset,
      1
    );

    const end = new Date(
      now.getFullYear(),
      now.getMonth() + offset + 1,
      0,
      23,
      59,
      59
    );

    return { start, end };
  }

  function inRange(date, range) {
    const d = new Date(date);

    if (isNaN(d.getTime())) return false;

    return (
      d >= range.start &&
      d <= range.end
    );
  }

  function calculate() {
    const transactions =
      read(TX_KEY, []);

    const sales =
      read(SALES_KEY, []);

    const products =
      read(PRODUCTS_KEY, []);

    const target =
      read(TARGET_KEY, {});

    const current =
      monthRange(0);

    const previous =
      monthRange(-1);

    function calcRange(range) {
      let revenue = 0;
      let expense = 0;
      let salesRevenue = 0;
      let salesCount = 0;

      transactions.forEach(function (tx) {
        if (!inRange(tx.date, range)) {
          return;
        }

        const amount =
          number(tx.amount);

        if (
          tx.type === "expense"
        ) {
          expense += amount;
        } else {
          revenue += amount;
        }
      });

      sales.forEach(function (sale) {
        if (!inRange(sale.date, range)) {
          return;
        }

        salesRevenue +=
          number(sale.amount);

        salesCount++;
      });

      const profit =
        revenue - expense;

      const margin =
        revenue > 0
          ? (profit / revenue) * 100
          : 0;

      return {
        revenue,
        expense,
        profit,
        margin,
        salesRevenue,
        salesCount
      };
    }

    const now =
      calcRange(current);

    const prev =
      calcRange(previous);

    let inventoryValue = 0;
    let lowStock = 0;

    products.forEach(function (product) {
      const stock =
        number(product.stock);

      const cost =
        number(product.cost);

      inventoryValue +=
        stock * cost;

      const targetStock =
        number(
          product.target ??
          product.targetStock
        );

      if (
        targetStock > 0 &&
        stock < targetStock
      ) {
        lowStock++;
      }
    });

    const revenueTarget =
      number(
        target.revenueTarget
      );

    const salesTarget =
      number(
        target.salesTarget
      );

    const revenueAchievement =
      revenueTarget > 0
        ? (now.salesRevenue / revenueTarget) * 100
        : 0;

    const salesAchievement =
      salesTarget > 0
        ? (now.salesCount / salesTarget) * 100
        : 0;

    function change(currentValue, previousValue) {
      if (!previousValue) {
        return currentValue > 0 ? 100 : 0;
      }

      return (
        (currentValue - previousValue) /
        Math.abs(previousValue)
      ) * 100;
    }

    return {
      revenue: now.revenue,
      expense: now.expense,
      profit: now.profit,
      margin: now.margin,
      salesRevenue: now.salesRevenue,
      salesCount: now.salesCount,
      inventoryValue,
      lowStock,
      revenueTarget,
      salesTarget,
      revenueAchievement,
      salesAchievement,
      revenueChange: change(
        now.revenue,
        prev.revenue
      ),
      expenseChange: change(
        now.expense,
        prev.expense
      ),
      profitChange: change(
        now.profit,
        prev.profit
      ),
      salesChange: change(
        now.salesRevenue,
        prev.salesRevenue
      )
    };
  }

  function trend(value, positiveGood) {
    if (Math.abs(value) < 0.05) {
      return {
        cls: "flat",
        text: "→ Stable"
      };
    }

    const good =
      positiveGood
        ? value > 0
        : value < 0;

    return {
      cls: good ? "up" : "down",
      text:
        (value > 0 ? "↑ " : "↓ ") +
        Math.abs(value).toFixed(1) +
        "%"
    };
  }

  function render() {
    const container =
      document.getElementById(
        "pwExecutiveKpi"
      );

    if (!container) return;

    const k =
      calculate();

    const revenueTrend =
      trend(k.revenueChange, true);

    const expenseTrend =
      trend(k.expenseChange, false);

    const profitTrend =
      trend(k.profitChange, true);

    const salesTrend =
      trend(k.salesChange, true);

    container.innerHTML = `
      <div class="pw-exec-kpi-header">
        <div>
          <span>EXECUTIVE INTELLIGENCE</span>
          <h3>Business Performance</h3>
        </div>

        <div class="pw-exec-period">
          ${new Date().toLocaleString(
            "id-ID",
            {
              month: "long",
              year: "numeric"
            }
          )}
        </div>
      </div>

      <div class="pw-exec-kpi-grid">

        <div class="pw-exec-kpi-card">
          <span class="pw-exec-kpi-label">
            Revenue
          </span>
          <strong>
            ${money(k.revenue)}
          </strong>
          <small class="${revenueTrend.cls}">
            ${revenueTrend.text} vs last month
          </small>
        </div>

        <div class="pw-exec-kpi-card">
          <span class="pw-exec-kpi-label">
            Expense
          </span>
          <strong>
            ${money(k.expense)}
          </strong>
          <small class="${expenseTrend.cls}">
            ${expenseTrend.text} vs last month
          </small>
        </div>

        <div class="pw-exec-kpi-card">
          <span class="pw-exec-kpi-label">
            Net Profit
          </span>
          <strong>
            ${money(k.profit)}
          </strong>
          <small class="${profitTrend.cls}">
            ${profitTrend.text} vs last month
          </small>
        </div>

        <div class="pw-exec-kpi-card">
          <span class="pw-exec-kpi-label">
            Profit Margin
          </span>
          <strong>
            ${pct(k.margin)}
          </strong>
          <small class="${
            k.margin >= 0
              ? "up"
              : "down"
          }">
            ${k.margin >= 0
              ? "Healthy profit position"
              : "Negative profit"}
          </small>
        </div>

        <div class="pw-exec-kpi-card">
          <span class="pw-exec-kpi-label">
            Sales Target
          </span>
          <strong>
            ${pct(k.revenueAchievement)}
          </strong>
          <small class="${
            k.revenueAchievement >= 70
              ? "up"
              : "down"
          }">
            ${money(k.salesRevenue)}
            / ${money(k.revenueTarget)}
          </small>
        </div>

        <div class="pw-exec-kpi-card">
          <span class="pw-exec-kpi-label">
            Inventory Value
          </span>
          <strong>
            ${money(k.inventoryValue)}
          </strong>
          <small class="${
            k.lowStock > 0
              ? "down"
              : "up"
          }">
            ${k.lowStock} low-stock item
            ${k.lowStock === 1 ? "" : "s"}
          </small>
        </div>

      </div>

      <div class="pw-exec-insight">
        <span>⚡</span>
        <div>
          <strong>Executive Insight</strong>
          <p>
            ${
              k.profit < 0
                ? "Profit saat ini negatif. Review expense dan transaksi utama."
                : k.revenueAchievement < 70
                  ? "Revenue masih di bawah 70% target. Fokus pada sales pipeline."
                  : k.lowStock > 0
                    ? k.lowStock +
                      " produk berada di bawah batas stok."
                    : "Performa bisnis saat ini terlihat stabil berdasarkan data yang tersedia."
            }
          </p>
        </div>
      </div>
    `;

    container
      .querySelectorAll(
        ".pw-exec-kpi-card"
      )
      .forEach(function (card) {
        card.addEventListener(
          "click",
          function () {
            const label =
              card
                .querySelector(
                  ".pw-exec-kpi-label"
                )
                ?.textContent
                .toLowerCase() || "";

            let page = "dashboard";

            if (label.includes("expense")) {
              page = "expenses";
            } else if (
              label.includes("revenue") ||
              label.includes("sales")
            ) {
              page = "sales";
            } else if (
              label.includes("inventory")
            ) {
              page = "products";
            } else if (
              label.includes("profit")
            ) {
              page = "finance";
            }

            const nav =
              document.querySelector(
                '[data-page="' + page + '"]'
              );

            if (nav) nav.click();
          }
        );
      });
  }

  function inject() {
    if (
      document.getElementById(
        "pwExecutiveKpiCard"
      )
    ) {
      render();
      return;
    }

    const main =
      document.querySelector("#dashboardExtras");

    if (!main) return;

    const card =
      document.createElement("section");

    card.id = "pwExecutiveKpiCard";
    card.className =
      "pw-executive-kpi-card";

    card.innerHTML = `
      <div id="pwExecutiveKpi"></div>
    `;

    /* Place Executive Intelligence at the very bottom
       of the main content area. */
    main.appendChild(card);

    render();
  }

  function start() {
    inject();

    setInterval(
      render,
      5000
    );

    window.addEventListener(
      "storage",
      render
    );

    window.addEventListener(
      "pwActivityAdded",
      render
    );
  }

  window.getExecutiveKpi =
    calculate;

  window.renderExecutiveKpi =
    render;

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

})();

/* =========================================================
   PORTOFOLIO WANDI — FINANCIAL CHART V1
   Revenue / Expense / Profit — Last 14 Days
   ========================================================= */
(function () {
  "use strict";

  const TX_KEY = "businessHubTransactions";

  function readTransactions() {
    try {
      const data = JSON.parse(
        localStorage.getItem(TX_KEY) || "[]"
      );
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function money(value) {
    return "Rp " + Math.round(value).toLocaleString("id-ID");
  }

  function formatShort(value) {
    if (value >= 1000000000) {
      return "Rp " + (value / 1000000000).toFixed(1) + "M";
    }

    if (value >= 1000000) {
      return "Rp " + (value / 1000000).toFixed(1) + "jt";
    }

    if (value >= 1000) {
      return "Rp " + (value / 1000).toFixed(0) + "rb";
    }

    return "Rp " + Math.round(value);
  }

  function buildData() {
    const transactions = readTransactions();
    const result = [];

    const now = new Date();

    for (let i = 13; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i
      );

      const key =
        date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");

      let revenue = 0;
      let expense = 0;

      transactions.forEach(function (tx) {
        if (!tx.date) return;

        const txDate = new Date(tx.date);

        if (isNaN(txDate.getTime())) return;

        const txKey =
          txDate.getFullYear() + "-" +
          String(txDate.getMonth() + 1).padStart(2, "0") + "-" +
          String(txDate.getDate()).padStart(2, "0");

        if (txKey !== key) return;

        const amount = Number(tx.amount) || 0;

        if (tx.type === "expense") {
          expense += amount;
        } else {
          revenue += amount;
        }
      });

      result.push({
        date: date,
        label:
          String(date.getDate()).padStart(2, "0") +
          "/" +
          String(date.getMonth() + 1).padStart(2, "0"),
        revenue: revenue,
        expense: expense,
        profit: revenue - expense
      });
    }

    return result;
  }

  function render() {
    const root =
      document.getElementById(
        "pwFinancialChart"
      );

    if (!root) return;

    const data = buildData();

    const maxValue =
      Math.max.apply(
        null,
        data.map(function (item) {
          return Math.max(
            item.revenue,
            item.expense,
            Math.abs(item.profit)
          );
        })
      ) || 1;

    const totalRevenue =
      data.reduce(
        (sum, item) => sum + item.revenue,
        0
      );

    const totalExpense =
      data.reduce(
        (sum, item) => sum + item.expense,
        0
      );

    const totalProfit =
      totalRevenue - totalExpense;

    root.innerHTML = `
      <div class="pw-fin-chart-head">
        <div>
          <span>FINANCIAL TREND</span>
          <h3>Revenue vs Expense</h3>
        </div>

        <div class="pw-fin-chart-summary">
          <div>
            <small>Revenue</small>
            <strong>${money(totalRevenue)}</strong>
          </div>
          <div>
            <small>Expense</small>
            <strong>${money(totalExpense)}</strong>
          </div>
          <div>
            <small>Profit</small>
            <strong>${money(totalProfit)}</strong>
          </div>
        </div>
      </div>

      <div class="pw-chart-legend">
        <span>
          <i class="revenue"></i>
          Revenue
        </span>

        <span>
          <i class="expense"></i>
          Expense
        </span>

        <span>
          <i class="profit"></i>
          Profit
        </span>
      </div>

      <div class="pw-fin-chart">
        <div class="pw-chart-y">
          <span>${formatShort(maxValue)}</span>
          <span>${formatShort(maxValue * .75)}</span>
          <span>${formatShort(maxValue * .5)}</span>
          <span>${formatShort(maxValue * .25)}</span>
          <span>Rp 0</span>
        </div>

        <div class="pw-chart-area">
          <div class="pw-chart-grid">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>

          <div class="pw-bars">
            ${data.map(function (item) {
              const revenueHeight =
                Math.max(
                  2,
                  (item.revenue / maxValue) * 100
                );

              const expenseHeight =
                Math.max(
                  2,
                  (item.expense / maxValue) * 100
                );

              const profitHeight =
                Math.max(
                  2,
                  (Math.abs(item.profit) / maxValue) * 100
                );

              return `
                <div class="pw-chart-column">

                  <div class="pw-bar-group">

                    <span
                      class="pw-bar revenue"
                      style="height:${revenueHeight}%"
                      title="${item.label} Revenue: ${money(item.revenue)}"
                    ></span>

                    <span
                      class="pw-bar expense"
                      style="height:${expenseHeight}%"
                      title="${item.label} Expense: ${money(item.expense)}"
                    ></span>

                    <span
                      class="pw-bar profit ${
                        item.profit < 0
                          ? "negative"
                          : ""
                      }"
                      style="height:${profitHeight}%"
                      title="${item.label} Profit: ${money(item.profit)}"
                    ></span>

                  </div>

                  <small>${item.label}</small>

                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  }

  function inject() {
    if (
      document.getElementById(
        "pwFinancialChartCard"
      )
    ) {
      render();
      return;
    }

    const main =
      document.querySelector("#dashboardExtras");

    if (!main) return;

    const card =
      document.createElement("section");

    card.id = "pwFinancialChartCard";
    card.className =
      "pw-financial-chart-card";

    card.innerHTML = `
      <div id="pwFinancialChart"></div>
    `;

    const activity =
      document.getElementById(
        "pwActivityCard"
      );

    if (activity) {
      activity.before(card);
    } else {
      main.appendChild(card);
    }

    render();
  }

  function start() {
    inject();

    setInterval(
      render,
      5000
    );

    window.addEventListener(
      "storage",
      render
    );

    window.addEventListener(
      "pwActivityAdded",
      render
    );
  }

  window.renderFinancialChart =
    render;

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

})();

/* =========================================================
   PORTOFOLIO WANDI — TOP PRODUCTS & CUSTOMERS V1
   ========================================================= */
(function () {
  "use strict";

  const SALES_KEY = "businessHubSalesSafe";
  const PRODUCTS_KEY = "businessHubProductsV3";
  const CUSTOMERS_KEY = "businessHubCustomersSafe";

  function read(key) {
    try {
      const data = JSON.parse(
        localStorage.getItem(key) || "[]"
      );
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function money(value) {
    return "Rp " +
      Math.round(Number(value) || 0)
        .toLocaleString("id-ID");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function calculate() {
    const sales = read(SALES_KEY);
    const products = read(PRODUCTS_KEY);
    const customers = read(CUSTOMERS_KEY);

    const productMap = {};
    const customerMap = {};

    products.forEach(function (product) {
      const name =
        product.name ||
        product.product ||
        product.sku ||
        "Unknown Product";

      productMap[name] = {
        name: name,
        revenue: 0,
        qty: 0,
        stock: Number(product.stock) || 0
      };
    });

    customers.forEach(function (customer) {
      const name =
        customer.name ||
        customer.company ||
        "Unknown Customer";

      customerMap[name] = {
        name: name,
        revenue: Number(customer.revenue) || 0,
        orders: 0
      };
    });

    sales.forEach(function (sale) {
      const productName =
        sale.product ||
        sale.productName ||
        "Unknown Product";

      const customerName =
        sale.customer ||
        sale.customerName ||
        "Unknown Customer";

      const amount =
        Number(sale.amount) || 0;

      const qty =
        Number(sale.qty) ||
        Number(sale.quantity) ||
        1;

      if (!productMap[productName]) {
        productMap[productName] = {
          name: productName,
          revenue: 0,
          qty: 0,
          stock: 0
        };
      }

      productMap[productName].revenue += amount;
      productMap[productName].qty += qty;

      if (!customerMap[customerName]) {
        customerMap[customerName] = {
          name: customerName,
          revenue: 0,
          orders: 0
        };
      }

      customerMap[customerName].revenue += amount;
      customerMap[customerName].orders++;
    });

    Object.keys(customerMap).forEach(function (name) {
      const stored =
        customers.find(function (customer) {
          return (
            (customer.name || customer.company) === name
          );
        });

      if (
        stored &&
        Number(stored.revenue) > 0
      ) {
        customerMap[name].revenue =
          Math.max(
            customerMap[name].revenue,
            Number(stored.revenue)
          );
      }
    });

    const topProducts =
      Object.values(productMap)
        .sort(function (a, b) {
          return b.revenue - a.revenue;
        })
        .slice(0, 5);

    const topCustomers =
      Object.values(customerMap)
        .sort(function (a, b) {
          return b.revenue - a.revenue;
        })
        .slice(0, 5);

    return {
      topProducts,
      topCustomers
    };
  }

  function renderList(items, type) {
    if (!items.length) {
      return `
        <div class="pw-top-empty">
          Belum ada data tersedia
        </div>
      `;
    }

    const max =
      Math.max.apply(
        null,
        items.map(function (item) {
          return item.revenue;
        })
      ) || 1;

    return items.map(function (item, index) {
      const width =
        Math.max(
          4,
          (item.revenue / max) * 100
        );

      const detail =
        type === "product"
          ? (
              item.qty +
              " unit · stok " +
              item.stock
            )
          : (
              item.orders +
              " order"
            );

      return `
        <button
          type="button"
          class="pw-top-row"
          data-top-type="${type}"
          data-top-name="${escapeHtml(item.name)}"
        >
          <span class="pw-top-rank">
            ${index + 1}
          </span>

          <span class="pw-top-main">
            <strong>
              ${escapeHtml(item.name)}
            </strong>

            <small>
              ${detail}
            </small>

            <i>
              <b style="width:${width}%"></b>
            </i>
          </span>

          <span class="pw-top-value">
            ${money(item.revenue)}
          </span>
        </button>
      `;
    }).join("");
  }

  function render() {
    const root =
      document.getElementById(
        "pwTopIntelligence"
      );

    if (!root) return;

    const data = calculate();

    root.innerHTML = `
      <div class="pw-top-head">
        <div>
          <span>BUSINESS INTELLIGENCE</span>
          <h3>Top Performance</h3>
        </div>

        <button
          type="button"
          id="pwTopRefresh"
          class="pw-top-refresh"
        >
          ↻
        </button>
      </div>

      <div class="pw-top-grid">

        <div class="pw-top-panel">
          <div class="pw-top-panel-title">
            <strong>Top Products</strong>
            <small>Revenue contribution</small>
          </div>

          <div class="pw-top-list">
            ${renderList(
              data.topProducts,
              "product"
            )}
          </div>
        </div>

        <div class="pw-top-panel">
          <div class="pw-top-panel-title">
            <strong>Top Customers</strong>
            <small>Customer contribution</small>
          </div>

          <div class="pw-top-list">
            ${renderList(
              data.topCustomers,
              "customer"
            )}
          </div>
        </div>

      </div>
    `;

    const refresh =
      document.getElementById(
        "pwTopRefresh"
      );

    if (refresh) {
      refresh.addEventListener(
        "click",
        render
      );
    }

    root
      .querySelectorAll(".pw-top-row")
      .forEach(function (row) {
        row.addEventListener(
          "click",
          function () {
            const type =
              row.dataset.topType;

            const page =
              type === "product"
                ? "products"
                : "customers";

            const nav =
              document.querySelector(
                '[data-page="' + page + '"]'
              );

            if (nav) nav.click();
          }
        );
      });
  }

  function inject() {
    if (
      document.getElementById(
        "pwTopIntelligenceCard"
      )
    ) {
      render();
      return;
    }

    const main =
      document.querySelector("#dashboardExtras");

    if (!main) return;

    const card =
      document.createElement("section");

    card.id =
      "pwTopIntelligenceCard";

    card.className =
      "pw-top-intelligence-card";

    card.innerHTML = `
      <div id="pwTopIntelligence"></div>
    `;

    main.appendChild(card);

    render();
  }

  function start() {
    inject();

    setInterval(
      render,
      5000
    );

    window.addEventListener(
      "storage",
      render
    );

    window.addEventListener(
      "pwActivityAdded",
      render
    );
  }

  window.getTopBusinessIntelligence =
    calculate;

  window.renderTopBusinessIntelligence =
    render;

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

})();

/* =========================================================
   PORTOFOLIO WANDI — BACKUP & RESTORE CENTER V1
   ========================================================= */
(function () {
  "use strict";

  const STORAGE_KEYS = [
    "businessHubTransactions",
    "businessHubSalesSafe",
    "businessHubProductsV3",
    "businessHubCustomersSafe",
    "businessHubSalesTargetsV1",
    "businessHubOpportunityStatusV1",
    "businessHubActivityCenterV1",
    "businessHubNotificationsReadV2",
    "businessHubNotificationEventsV3",
    "businessHubNotificationBaselineV4"
  ];

  function collectData() {
    const data = {};

    STORAGE_KEYS.forEach(function (key) {
      const value =
        localStorage.getItem(key);

      if (value !== null) {
        try {
          data[key] = JSON.parse(value);
        } catch (e) {
          data[key] = value;
        }
      }
    });

    return {
      app: "Portofolio Wandi",
      version: "Backup V1",
      createdAt: new Date().toISOString(),
      data: data
    };
  }

  function downloadFile(
    content,
    filename,
    type
  ) {
    const blob =
      new Blob(
        [content],
        { type: type }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function backup() {
    const backupData =
      collectData();

    const filename =
      "portofolio-wandi-backup-" +
      new Date()
        .toISOString()
        .replace(/[:.]/g, "-") +
      ".json";

    downloadFile(
      JSON.stringify(
        backupData,
        null,
        2
      ),
      filename,
      "application/json"
    );

    if (
      typeof window.addBusinessActivity ===
      "function"
    ) {
      window.addBusinessActivity(
        "system",
        "Backup created",
        "Data Portofolio Wandi berhasil dicadangkan",
        "dashboard"
      );
    }
  }

  function exportSalesCSV() {
    let sales = [];

    try {
      sales = JSON.parse(
        localStorage.getItem(
          "businessHubSalesSafe"
        ) || "[]"
      );
    } catch (e) {
      sales = [];
    }

    if (!Array.isArray(sales)) {
      sales = [];
    }

    const rows = [
      [
        "ID",
        "Tanggal",
        "Customer",
        "Product",
        "Qty",
        "Amount"
      ]
    ];

    sales.forEach(function (sale) {
      rows.push([
        sale.id ?? "",
        sale.date ?? "",
        sale.customer ?? "",
        sale.product ?? "",
        sale.qty ?? "",
        sale.amount ?? ""
      ]);
    });

    const csv =
      rows.map(function (row) {
        return row.map(function (cell) {
          const value =
            String(cell)
              .replace(/"/g, '""');

          return '"' + value + '"';
        }).join(",");
      }).join("\n");

    downloadFile(
      csv,
      "portofolio-wandi-sales.csv",
      "text/csv;charset=utf-8"
    );
  }

  function validateBackup(data) {
    return !!(
      data &&
      data.app === "Portofolio Wandi" &&
      data.data &&
      typeof data.data === "object"
    );
  }

  function restore(file) {
    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = function () {
      try {
        const data =
          JSON.parse(
            reader.result
          );

        if (!validateBackup(data)) {
          alert(
            "File backup tidak valid atau bukan backup Portofolio Wandi."
          );
          return;
        }

        const confirmed =
          confirm(
            "Restore backup ini?\n\n" +
            "Data lokal saat ini akan diganti dengan data dari backup."
          );

        if (!confirmed) return;

        Object.keys(data.data)
          .forEach(function (key) {
            const value =
              data.data[key];

            localStorage.setItem(
              key,
              typeof value === "string"
                ? value
                : JSON.stringify(value)
            );
          });

        alert(
          "Restore berhasil.\n\n" +
          "Dashboard akan dimuat ulang."
        );

        location.reload();

      } catch (error) {
        alert(
          "Backup gagal dibaca.\n\n" +
          error.message
        );
      }
    };

    reader.readAsText(file);
  }

  function render() {
    const root =
      document.getElementById(
        "pwBackupCenter"
      );

    if (!root) return;

    let recordCount = 0;

    STORAGE_KEYS.forEach(function (key) {
      const raw =
        localStorage.getItem(key);

      if (!raw) return;

      try {
        const data =
          JSON.parse(raw);

        if (Array.isArray(data)) {
          recordCount += data.length;
        } else {
          recordCount++;
        }
      } catch (e) {
        recordCount++;
      }
    });

    root.innerHTML = `
      <div class="pw-backup-head">
        <div>
          <span>DATA SECURITY</span>
          <h3>Backup & Restore</h3>
          <small>
            ${recordCount} data record terdeteksi
          </small>
        </div>

        <div class="pw-backup-status">
          ● Local
        </div>
      </div>

      <div class="pw-backup-actions">

        <button
          type="button"
          id="pwBackupNow"
          class="pw-backup-primary"
        >
          <strong>↓</strong>
          <span>
            <b>Backup Data</b>
            <small>Download semua data</small>
          </span>
        </button>

        <button
          type="button"
          id="pwRestoreData"
          class="pw-backup-button"
        >
          <strong>↑</strong>
          <span>
            <b>Restore</b>
            <small>Import file backup</small>
          </span>
        </button>

        <button
          type="button"
          id="pwExportSales"
          class="pw-backup-button"
        >
          <strong>⇩</strong>
          <span>
            <b>Export Sales</b>
            <small>Download CSV</small>
          </span>
        </button>

      </div>

      <input
        type="file"
        id="pwRestoreInput"
        accept=".json,application/json"
        hidden
      />

      <div class="pw-backup-note">
        <span>ⓘ</span>
        <p>
          Backup disimpan sebagai file di perangkat.
          Simpan file tersebut di tempat yang aman.
        </p>
      </div>
    `;

    document
      .getElementById("pwBackupNow")
      ?.addEventListener(
        "click",
        backup
      );

    document
      .getElementById("pwExportSales")
      ?.addEventListener(
        "click",
        exportSalesCSV
      );

    const restoreButton =
      document.getElementById(
        "pwRestoreData"
      );

    const input =
      document.getElementById(
        "pwRestoreInput"
      );

    if (restoreButton && input) {
      restoreButton.addEventListener(
        "click",
        function () {
          input.click();
        }
      );

      input.addEventListener(
        "change",
        function () {
          restore(
            input.files &&
            input.files[0]
          );

          input.value = "";
        }
      );
    }
  }

  function inject() {
    if (
      document.getElementById(
        "pwBackupCenterCard"
      )
    ) {
      render();
      return;
    }

    const main =
      document.querySelector("#dashboardExtras");

    if (!main) return;

    const card =
      document.createElement("section");

    card.id =
      "pwBackupCenterCard";

    card.className =
      "pw-backup-center-card";

    card.innerHTML = `
      <div id="pwBackupCenter"></div>
    `;

    main.appendChild(card);

    render();
  }

  function start() {
    inject();

    setInterval(
      render,
      5000
    );
  }

  window.portofolioWandiBackup =
    backup;

  window.portofolioWandiRestore =
    restore;

  window.portofolioWandiExportSales =
    exportSalesCSV;

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

})();

/* =========================================================
   PORTOFOLIO WANDI — EXECUTIVE REPORT CENTER V1
   ========================================================= */
(function () {
  "use strict";

  const KEYS = {
    tx: "businessHubTransactions",
    sales: "businessHubSalesSafe",
    products: "businessHubProductsV3",
    customers: "businessHubCustomersSafe",
    target: "businessHubSalesTargetsV1"
  };

  function read(key, fallback) {
    try {
      const value = JSON.parse(
        localStorage.getItem(key) || "null"
      );
      return value == null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function money(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function num(value) {
    return new Intl.NumberFormat("id-ID")
      .format(Number(value) || 0);
  }

  function getData() {
    const tx = read(KEYS.tx, []);
    const sales = read(KEYS.sales, []);
    const products = read(KEYS.products, []);
    const customers = read(KEYS.customers, []);
    const target = read(KEYS.target, {});

    const revenue = tx
      .filter(x => x.type === "income")
      .reduce((s, x) => s + Number(x.amount || 0), 0);

    const expense = tx
      .filter(x => x.type === "expense")
      .reduce((s, x) => s + Number(x.amount || 0), 0);

    const profit = revenue - expense;

    const margin =
      revenue > 0
        ? (profit / revenue) * 100
        : 0;

    const salesRevenue = sales.reduce(
      (s, x) => s + Number(x.amount || 0),
      0
    );

    const salesCount = sales.length;

    const targetRevenue =
      Number(target.revenueTarget || 0);

    const targetAchievement =
      targetRevenue > 0
        ? (salesRevenue / targetRevenue) * 100
        : 0;

    const inventoryValue = products.reduce(
      (s, x) =>
        s +
        (Number(x.stock || 0) *
         Number(x.cost || 0)),
      0
    );

    const lowStock = products.filter(
      x =>
        Number(x.stock || 0) <=
        Number(x.target || 0)
    );

    const productMap = {};

    sales.forEach(function (sale) {
      const name =
        sale.product || "Unknown";

      if (!productMap[name]) {
        productMap[name] = {
          name,
          revenue: 0,
          qty: 0
        };
      }

      productMap[name].revenue +=
        Number(sale.amount || 0);

      productMap[name].qty +=
        Number(sale.qty || 0);
    });

    const topProducts =
      Object.values(productMap)
        .sort((a, b) =>
          b.revenue - a.revenue
        )
        .slice(0, 5);

    const customerMap = {};

    sales.forEach(function (sale) {
      const name =
        sale.customer || "Unknown";

      if (!customerMap[name]) {
        customerMap[name] = {
          name,
          revenue: 0,
          orders: 0
        };
      }

      customerMap[name].revenue +=
        Number(sale.amount || 0);

      customerMap[name].orders++;
    });

    const topCustomers =
      Object.values(customerMap)
        .sort((a, b) =>
          b.revenue - a.revenue
        )
        .slice(0, 5);

    return {
      tx,
      sales,
      products,
      customers,
      revenue,
      expense,
      profit,
      margin,
      salesRevenue,
      salesCount,
      targetRevenue,
      targetAchievement,
      inventoryValue,
      lowStock,
      topProducts,
      topCustomers
    };
  }

  function render() {
    const root =
      document.getElementById(
        "pwExecutiveReport"
      );

    if (!root) return;

    const d = getData();

    const reportDate =
      new Date().toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric"
        }
      );

    root.innerHTML = `
      <div class="pw-report-header">
        <div>
          <span class="pw-report-eyebrow">
            EXECUTIVE REPORT
          </span>

          <h2>
            Portofolio Wandi
          </h2>

          <p>
            Business Performance Report
            · ${reportDate}
          </p>
        </div>

        <button
          type="button"
          id="pwPrintReport"
          class="pw-report-print"
        >
          Print / PDF
        </button>
      </div>

      <div class="pw-report-kpis">

        <div class="pw-report-kpi">
          <span>Revenue</span>
          <strong>${money(d.revenue)}</strong>
          <small>
            Sales ${money(d.salesRevenue)}
          </small>
        </div>

        <div class="pw-report-kpi">
          <span>Expenses</span>
          <strong>${money(d.expense)}</strong>
          <small>
            ${d.revenue > 0
              ? ((d.expense / d.revenue) * 100).toFixed(1)
              : "0.0"}% of revenue
          </small>
        </div>

        <div class="pw-report-kpi">
          <span>Net Profit</span>
          <strong>${money(d.profit)}</strong>
          <small>
            Margin ${d.margin.toFixed(1)}%
          </small>
        </div>

        <div class="pw-report-kpi">
          <span>Sales Target</span>
          <strong>
            ${d.targetRevenue > 0
              ? d.targetAchievement.toFixed(1) + "%"
              : "—"}
          </strong>
          <small>
            ${num(d.salesCount)} transactions
          </small>
        </div>

      </div>

      <div class="pw-report-grid">

        <section class="pw-report-section">
          <div class="pw-report-section-title">
            <strong>Top Products</strong>
            <span>${d.topProducts.length}</span>
          </div>

          ${
            d.topProducts.length
              ? d.topProducts.map(function (x, i) {
                  return `
                    <div class="pw-report-row">
                      <b>${i + 1}. ${x.name}</b>
                      <span>
                        ${money(x.revenue)}
                        · ${num(x.qty)} qty
                      </span>
                    </div>
                  `;
                }).join("")
              : `
                <div class="pw-report-empty">
                  Belum ada data sales.
                </div>
              `
          }
        </section>

        <section class="pw-report-section">
          <div class="pw-report-section-title">
            <strong>Top Customers</strong>
            <span>${d.topCustomers.length}</span>
          </div>

          ${
            d.topCustomers.length
              ? d.topCustomers.map(function (x, i) {
                  return `
                    <div class="pw-report-row">
                      <b>${i + 1}. ${x.name}</b>
                      <span>
                        ${money(x.revenue)}
                        · ${num(x.orders)} order
                      </span>
                    </div>
                  `;
                }).join("")
              : `
                <div class="pw-report-empty">
                  Belum ada data customer.
                </div>
              `
          }
        </section>

        <section class="pw-report-section">
          <div class="pw-report-section-title">
            <strong>Inventory</strong>
            <span>${num(d.products.length)} SKU</span>
          </div>

          <div class="pw-report-inventory">
            <div>
              <span>Inventory Value</span>
              <b>${money(d.inventoryValue)}</b>
            </div>

            <div>
              <span>Low Stock</span>
              <b>${num(d.lowStock.length)}</b>
            </div>

            <div>
              <span>Customers</span>
              <b>${num(d.customers.length)}</b>
            </div>
          </div>
        </section>

        <section class="pw-report-section">
          <div class="pw-report-section-title">
            <strong>Management Snapshot</strong>
          </div>

          <div class="pw-report-snapshot">

            <div>
              <span>Revenue</span>
              <b>${money(d.revenue)}</b>
            </div>

            <div>
              <span>Expense</span>
              <b>${money(d.expense)}</b>
            </div>

            <div>
              <span>Profit</span>
              <b>${money(d.profit)}</b>
            </div>

            <div>
              <span>Margin</span>
              <b>${d.margin.toFixed(1)}%</b>
            </div>

          </div>
        </section>

      </div>

      ${
        d.lowStock.length
          ? `
            <div class="pw-report-alert">
              <strong>Inventory Alert</strong>
              <span>
                ${d.lowStock.length}
                produk berada pada atau di bawah
                batas minimum stok.
              </span>
            </div>
          `
          : `
            <div class="pw-report-ok">
              <strong>Inventory Healthy</strong>
              <span>
                Tidak ada produk yang melewati
                batas minimum stok.
              </span>
            </div>
          `
      }
    `;

    document
      .getElementById("pwPrintReport")
      ?.addEventListener(
        "click",
        function () {
          window.print();
        }
      );
  }

  function inject() {
    if (
      document.getElementById(
        "pwExecutiveReportCard"
      )
    ) {
      render();
      return;
    }

    const main =
      document.querySelector("#dashboardExtras");

    if (!main) return;

    const card =
      document.createElement("section");

    card.id =
      "pwExecutiveReportCard";

    card.className =
      "pw-executive-report-card";

    card.innerHTML = `
      <div id="pwExecutiveReport"></div>
    `;

    main.appendChild(card);

    render();
  }

  function start() {
    inject();

    setInterval(
      render,
      5000
    );
  }

  window.renderExecutiveReport =
    render;

  window.getExecutiveReportData =
    getData;

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

})();

/* =========================================================
   PORTOFOLIO WANDI — CASH FLOW FORECAST V1
   ========================================================= */
(function () {
  "use strict";

  const TX_KEY = "businessHubTransactions";

  function readTransactions() {
    try {
      const data = JSON.parse(
        localStorage.getItem(TX_KEY) || "[]"
      );

      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function money(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function shortMoney(value) {
    value = Number(value) || 0;

    if (Math.abs(value) >= 1000000000) {
      return "Rp " +
        (value / 1000000000)
          .toFixed(1)
          .replace(".0", "") +
        " M";
    }

    if (Math.abs(value) >= 1000000) {
      return "Rp " +
        (value / 1000000)
          .toFixed(1)
          .replace(".0", "") +
        " jt";
    }

    if (Math.abs(value) >= 1000) {
      return "Rp " +
        (value / 1000)
          .toFixed(0) +
        " rb";
    }

    return "Rp " +
      Math.round(value);
  }

  function getForecast() {
    const tx = readTransactions();

    const now = new Date();

    const last30 = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);

      date.setHours(0, 0, 0, 0);
      date.setDate(
        date.getDate() - i
      );

      const key =
        date.toISOString()
          .slice(0, 10);

      last30.push({
        date: key,
        income: 0,
        expense: 0,
        net: 0
      });
    }

    const dayMap = {};

    last30.forEach(function (day) {
      dayMap[day.date] = day;
    });

    tx.forEach(function (item) {
      if (!item.date) return;

      const dateKey =
        String(item.date)
          .slice(0, 10);

      if (!dayMap[dateKey]) return;

      const amount =
        Number(item.amount || 0);

      if (item.type === "income") {
        dayMap[dateKey].income += amount;
      }

      if (item.type === "expense") {
        dayMap[dateKey].expense += amount;
      }
    });

    last30.forEach(function (day) {
      day.net =
        day.income -
        day.expense;
    });

    const totalIncome =
      last30.reduce(
        (sum, x) =>
          sum + x.income,
        0
      );

    const totalExpense =
      last30.reduce(
        (sum, x) =>
          sum + x.expense,
        0
      );

    const avgIncome =
      totalIncome / 30;

    const avgExpense =
      totalExpense / 30;

    const avgNet =
      avgIncome -
      avgExpense;

    const allTimeIncome =
      tx
        .filter(x => x.type === "income")
        .reduce(
          (s, x) =>
            s + Number(x.amount || 0),
          0
        );

    const allTimeExpense =
      tx
        .filter(x => x.type === "expense")
        .reduce(
          (s, x) =>
            s + Number(x.amount || 0),
          0
        );

    const currentCash =
      allTimeIncome -
      allTimeExpense;

    function project(days) {
      return currentCash +
        (avgNet * days);
    }

    return {
      days: last30,
      totalIncome,
      totalExpense,
      avgIncome,
      avgExpense,
      avgNet,
      currentCash,
      projections: {
        7: project(7),
        14: project(14),
        30: project(30)
      }
    };
  }

  function render() {
    const root =
      document.getElementById(
        "pwCashflowForecast"
      );

    if (!root) return;

    const d = getForecast();

    const status =
      d.avgNet > 0
        ? {
            label: "Positive",
            text:
              "Arus kas rata-rata harian positif."
          }
        : d.avgNet < 0
          ? {
              label: "Negative",
              text:
                "Pengeluaran rata-rata melebihi pemasukan."
            }
          : {
              label: "Flat",
              text:
                "Belum ada perubahan net cash flow."
            };

    const maxValue =
      Math.max(
        ...d.days.map(x =>
          Math.max(
            x.income,
            x.expense
          )
        ),
        1
      );

    const chart =
      d.days.map(function (day) {
        const incomeHeight =
          Math.max(
            3,
            (day.income / maxValue) * 100
          );

        const expenseHeight =
          Math.max(
            3,
            (day.expense / maxValue) * 100
          );

        const label =
          day.date.slice(8, 10);

        return `
          <div
            class="pw-cf-day"
            title="${day.date}
Income: ${money(day.income)}
Expense: ${money(day.expense)}"
          >
            <div class="pw-cf-bars">
              <i
                class="pw-cf-income"
                style="height:${incomeHeight}%"
              ></i>

              <i
                class="pw-cf-expense"
                style="height:${expenseHeight}%"
              ></i>
            </div>

            <small>${label}</small>
          </div>
        `;
      }).join("");

    root.innerHTML = `
      <div class="pw-cf-header">
        <div>
          <span class="pw-cf-eyebrow">
            CASH FLOW INTELLIGENCE
          </span>

          <h3>
            Cash Flow Forecast
          </h3>

          <p>
            Berdasarkan pola transaksi 30 hari terakhir
          </p>
        </div>

        <div class="pw-cf-status">
          <b>${status.label}</b>
          <span>${status.text}</span>
        </div>
      </div>

      <div class="pw-cf-kpis">

        <div class="pw-cf-kpi">
          <span>Current Cash</span>
          <strong>
            ${money(d.currentCash)}
          </strong>
          <small>
            Net seluruh transaksi
          </small>
        </div>

        <div class="pw-cf-kpi">
          <span>Avg Income / Day</span>
          <strong>
            ${shortMoney(d.avgIncome)}
          </strong>
          <small>
            30 hari
          </small>
        </div>

        <div class="pw-cf-kpi">
          <span>Avg Expense / Day</span>
          <strong>
            ${shortMoney(d.avgExpense)}
          </strong>
          <small>
            30 hari
          </small>
        </div>

        <div class="pw-cf-kpi">
          <span>Net / Day</span>
          <strong>
            ${shortMoney(d.avgNet)}
          </strong>
          <small>
            rata-rata
          </small>
        </div>

      </div>

      <div class="pw-cf-chart">
        <div class="pw-cf-chart-head">
          <strong>30 Day Cash Activity</strong>

          <span>
            <i class="pw-cf-dot-income"></i>
            Income
            <i class="pw-cf-dot-expense"></i>
            Expense
          </span>
        </div>

        <div class="pw-cf-chart-area">
          ${chart}
        </div>
      </div>

      <div class="pw-cf-forecast">

        <div class="pw-cf-forecast-title">
          <strong>Projected Cash Position</strong>
          <span>Jika pola saat ini berlanjut</span>
        </div>

        <div class="pw-cf-projections">

          <div>
            <span>7 Days</span>
            <b>
              ${money(d.projections[7])}
            </b>
            <small>
              ${shortMoney(
                d.projections[7] -
                d.currentCash
              )}
            </small>
          </div>

          <div>
            <span>14 Days</span>
            <b>
              ${money(d.projections[14])}
            </b>
            <small>
              ${shortMoney(
                d.projections[14] -
                d.currentCash
              )}
            </small>
          </div>

          <div>
            <span>30 Days</span>
            <b>
              ${money(d.projections[30])}
            </b>
            <small>
              ${shortMoney(
                d.projections[30] -
                d.currentCash
              )}
            </small>
          </div>

        </div>
      </div>
    `;
  }

  function inject() {
    if (
      document.getElementById(
        "pwCashflowForecastCard"
      )
    ) {
      render();
      return;
    }

    const main =
      document.querySelector("#dashboardExtras");

    if (!main) return;

    const card =
      document.createElement("section");

    card.id =
      "pwCashflowForecastCard";

    card.className =
      "pw-cashflow-forecast-card";

    card.innerHTML = `
      <div id="pwCashflowForecast"></div>
    `;

    main.appendChild(card);

    render();
  }

  function start() {
    inject();

    setInterval(
      render,
      5000
    );

    window.addEventListener(
      "storage",
      render
    );
  }

  window.getCashflowForecast =
    getForecast;

  window.renderCashflowForecast =
    render;

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

})();

/* =========================================================
   PORTOFOLIO WANDI — INVENTORY INTELLIGENCE V1
   ========================================================= */
(function () {
  "use strict";

  const KEY = "businessHubProductsV3";

  function readProducts() {
    try {
      const data = JSON.parse(
        localStorage.getItem(KEY) || "[]"
      );
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function money(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function getInventoryIntelligence() {
    const products = readProducts();

    let totalStock = 0;
    let inventoryValue = 0;
    let lowStock = 0;
    let outOfStock = 0;

    const items = products.map(function (p) {
      const stock = Number(p.stock || 0);
      const target = Number(p.target || 0);
      const cost = Number(p.cost || 0);
      const price = Number(p.price || 0);
      const sold = Number(p.sold || 0);

      const value = stock * cost;

      totalStock += stock;
      inventoryValue += value;

      if (stock <= 0) {
        outOfStock++;
      } else if (stock <= target) {
        lowStock++;
      }

      const risk =
        stock <= 0
          ? 100
          : target > 0
            ? Math.max(
                0,
                Math.min(
                  100,
                  ((target - stock) / target) * 100
                )
              )
            : 0;

      return {
        ...p,
        stock,
        target,
        cost,
        price,
        sold,
        value,
        risk
      };
    });

    const riskItems =
      items
        .filter(x =>
          x.stock <= x.target
        )
        .sort(function (a, b) {
          return b.risk - a.risk;
        })
        .slice(0, 5);

    const stockLeaders =
      [...items]
        .sort(function (a, b) {
          return b.stock - a.stock;
        })
        .slice(0, 5);

    const healthy =
      products.length === 0
        ? 0
        : Math.round(
            ((products.length -
              lowStock -
              outOfStock) /
              products.length) *
              100
          );

    return {
      products,
      items,
      totalStock,
      inventoryValue,
      lowStock,
      outOfStock,
      healthy: Math.max(0, healthy),
      riskItems,
      stockLeaders
    };
  }

  function routeProducts() {
    const item =
      document.querySelector(
        '[data-page="products"]'
      );

    if (item) {
      item.click();
    }
  }

  function render() {
    const root =
      document.getElementById(
        "pwInventoryIntelligence"
      );

    if (!root) return;

    const d =
      getInventoryIntelligence();

    const healthLabel =
      d.outOfStock > 0
        ? "Attention"
        : d.lowStock > 0
          ? "Monitor"
          : "Healthy";

    root.innerHTML = `
      <div class="pw-inv-header">
        <div>
          <span class="pw-inv-eyebrow">
            INVENTORY INTELLIGENCE
          </span>

          <h3>Stock Control</h3>

          <p>
            Analisis kondisi inventory secara real-time
          </p>
        </div>

        <div class="pw-inv-health">
          <b>${healthLabel}</b>
          <span>
            ${d.healthy}% healthy
          </span>
        </div>
      </div>

      <div class="pw-inv-kpis">

        <div class="pw-inv-kpi">
          <span>Inventory Value</span>
          <strong>
            ${money(d.inventoryValue)}
          </strong>
          <small>
            nilai berdasarkan cost
          </small>
        </div>

        <div class="pw-inv-kpi">
          <span>Total Stock</span>
          <strong>
            ${d.totalStock.toLocaleString("id-ID")}
          </strong>
          <small>
            unit tersedia
          </small>
        </div>

        <div class="pw-inv-kpi">
          <span>Low Stock</span>
          <strong>
            ${d.lowStock}
          </strong>
          <small>
            perlu monitoring
          </small>
        </div>

        <div class="pw-inv-kpi">
          <span>Out of Stock</span>
          <strong>
            ${d.outOfStock}
          </strong>
          <small>
            produk kosong
          </small>
        </div>

      </div>

      <div class="pw-inv-grid">

        <section class="pw-inv-panel">

          <div class="pw-inv-panel-head">
            <strong>Stock Risk</strong>
            <span>
              ${d.riskItems.length} items
            </span>
          </div>

          ${
            d.riskItems.length
              ? d.riskItems.map(function (p) {
                  return `
                    <button
                      type="button"
                      class="pw-inv-row"
                      data-product-route="1"
                    >
                      <span class="pw-inv-product">
                        <b>
                          ${p.name || "Unnamed"}
                        </b>
                        <small>
                          ${p.sku || "No SKU"}
                        </small>
                      </span>

                      <span class="pw-inv-stock">
                        <b>
                          ${p.stock}
                        </b>
                        <small>
                          / min ${p.target}
                        </small>
                      </span>

                      <span class="pw-inv-risk">
                        ${
                          p.stock <= 0
                            ? "EMPTY"
                            : "LOW"
                        }
                      </span>
                    </button>
                  `;
                }).join("")
              : `
                <div class="pw-inv-empty">
                  Semua produk berada di atas
                  batas minimum stok.
                </div>
              `
          }

        </section>

        <section class="pw-inv-panel">

          <div class="pw-inv-panel-head">
            <strong>Stock Leaders</strong>
            <span>
              top ${d.stockLeaders.length}
            </span>
          </div>

          ${
            d.stockLeaders.length
              ? d.stockLeaders.map(function (p, i) {
                  return `
                    <button
                      type="button"
                      class="pw-inv-row"
                      data-product-route="1"
                    >
                      <span class="pw-inv-rank">
                        ${i + 1}
                      </span>

                      <span class="pw-inv-product">
                        <b>
                          ${p.name || "Unnamed"}
                        </b>
                        <small>
                          ${money(p.value)}
                        </small>
                      </span>

                      <span class="pw-inv-stock">
                        <b>
                          ${p.stock}
                        </b>
                        <small>
                          unit
                        </small>
                      </span>
                    </button>
                  `;
                }).join("")
              : `
                <div class="pw-inv-empty">
                  Belum ada data inventory.
                </div>
              `
          }

        </section>

      </div>

      ${
        d.outOfStock > 0
          ? `
            <div class="pw-inv-alert">
              <strong>
                ${d.outOfStock} produk kosong
              </strong>

              <span>
                Periksa Products untuk melakukan
                restock.
              </span>

              <button
                type="button"
                data-product-route="1"
              >
                Open Products
              </button>
            </div>
          `
          : d.lowStock > 0
            ? `
              <div class="pw-inv-alert">
                <strong>
                  ${d.lowStock} produk low stock
                </strong>

                <span>
                  Beberapa inventory sudah berada
                  pada batas minimum.
                </span>

                <button
                  type="button"
                  data-product-route="1"
                >
                  Open Products
                </button>
              </div>
            `
            : `
              <div class="pw-inv-ok">
                <strong>Inventory Healthy</strong>
                <span>
                  Tidak ada produk yang berada
                  di bawah batas minimum.
                </span>
              </div>
            `
      }
    `;

    root
      .querySelectorAll(
        "[data-product-route]"
      )
      .forEach(function (button) {
        button.addEventListener(
          "click",
          routeProducts
        );
      });
  }

  function inject() {
    if (
      document.getElementById(
        "pwInventoryIntelligenceCard"
      )
    ) {
      render();
      return;
    }

    const main =
      document.querySelector("#dashboardExtras");

    if (!main) return;

    const card =
      document.createElement("section");

    card.id =
      "pwInventoryIntelligenceCard";

    card.className =
      "pw-inventory-intelligence-card";

    card.innerHTML = `
      <div id="pwInventoryIntelligence"></div>
    `;

    main.appendChild(card);

    render();
  }

  function start() {
    inject();

    setInterval(
      render,
      5000
    );

    window.addEventListener(
      "storage",
      render
    );
  }

  window.getInventoryIntelligence =
    getInventoryIntelligence;

  window.renderInventoryIntelligence =
    render;

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

})();


/* =========================================================
   PORTOFOLIO WANDI — THEME SYSTEM V1
   ========================================================= */
(function () {
  const STORAGE = "pwThemeSettingsV1";

  function getTheme() {
    return localStorage.getItem(STORAGE) || "white";
  }

  function applyTheme(theme) {
    theme = theme === "black" ? "black" : "white";

    document.body.classList.toggle(
      "pw-theme-black",
      theme === "black"
    );

    localStorage.setItem(STORAGE, theme);

    document
      .querySelectorAll(".pw-theme-option")
      .forEach(function (button) {
        button.classList.toggle(
          "active",
          button.dataset.theme === theme
        );
      });
  }

  function addThemeSetting() {
    if (document.getElementById("pwThemeSettingsV1")) return;

    const settings = document.querySelector(".pw-settings-page");

    if (!settings) return;

    const card = document.createElement("section");

    card.id = "pwThemeSettingsV1";
    card.className = "pw-theme-setting";

    card.innerHTML = `
      <div class="pw-theme-setting-title">
        Appearance
      </div>

      <div class="pw-theme-setting-desc">
        Pilih tampilan aplikasi untuk portofolio ini.
      </div>

      <div class="pw-theme-switch">
        <button
          type="button"
          class="pw-theme-option"
          data-theme="white"
        >
          ☀️ White
        </button>

        <button
          type="button"
          class="pw-theme-option"
          data-theme="black"
        >
          🌙 Black
        </button>
      </div>
    `;

    settings.appendChild(card);

    card.querySelectorAll(".pw-theme-option")
      .forEach(function (button) {
        button.addEventListener("click", function () {
          applyTheme(button.dataset.theme);
        });
      });

    applyTheme(getTheme());
  }

  function initTheme() {
    applyTheme(getTheme());
    addThemeSetting();

    setTimeout(addThemeSetting, 300);
    setTimeout(addThemeSetting, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }

  window.applyPortfolioTheme = applyTheme;
})();
