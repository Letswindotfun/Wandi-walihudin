document.addEventListener("DOMContentLoaded", () => {

  const sidebar = document.getElementById("sidebar");
  const mobileMenu = document.getElementById("mobileMenu");
  const content = document.querySelector(".content");

  const navItems = document.querySelectorAll(".nav-item[data-page]");
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

  navItems.forEach(item => {

    item.addEventListener("click", () => {

      navItems.forEach(nav => nav.classList.remove("active"));
      item.classList.add("active");

      const page = item.dataset.page;

      if (page === "dashboard") {
        if (typeof window.renderLiveDashboard === "function") {
          window.renderLiveDashboard();
        }
        return;
      }

      renderModule(page);

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
      <span>Business Hub</span>
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
          <div class="module-eyebrow">BUSINESS HUB</div>
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
          <div class="module-eyebrow">BUSINESS HUB</div>
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
   DASHBOARD LIVE V3
   EXECUTIVE BUSINESS CONTROL CENTER
   DATA -> ANALYSIS -> ACTION
   ========================================================= */
(function () {
  "use strict";

  const TX_KEY = "businessHubTransactions";
  const SALES_KEY = "businessHubSalesSafe";
  const CUSTOMER_KEY = "businessHubCustomersSafe";
  const PRODUCT_KEY = "businessHubProductsV3";
  const TARGET_KEY = "businessHubSalesTargetsV1";

  let currentPeriod = 30;

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function arr(key) {
    const data = read(key, []);
    return Array.isArray(data) ? data : [];
  }

  function money(v) {
    return "Rp " + Number(v || 0).toLocaleString("id-ID");
  }

  function compact(v) {
    v = Number(v || 0);

    if (Math.abs(v) >= 1000000000) {
      return "Rp " + (v / 1000000000).toFixed(1) + " M";
    }

    if (Math.abs(v) >= 1000000) {
      return "Rp " + (v / 1000000).toFixed(1) + " Jt";
    }

    if (Math.abs(v) >= 1000) {
      return "Rp " + (v / 1000).toFixed(0) + " Rb";
    }

    return money(v);
  }

  function esc(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function dateObj(value) {
    if (!value) return null;

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) return null;

    return d;
  }

  function inPeriod(value, days) {
    const d = dateObj(value);

    if (!d) return true;

    const now = new Date();
    const from = new Date();

    from.setHours(0, 0, 0, 0);
    from.setDate(now.getDate() - (days - 1));

    return d >= from && d <= now;
  }

  function navigate(page) {
    const nav = document.querySelector('[data-page="' + page + '"]');

    if (nav) {
      nav.click();
    }
  }

  function renderDashboard() {
    const content = document.querySelector(".content");

    if (!content) return;

    const transactions = arr(TX_KEY);
    const sales = arr(SALES_KEY);
    const customers = arr(CUSTOMER_KEY);
    const products = arr(PRODUCT_KEY);

    const targetData = read(TARGET_KEY, {});
    const revenueTarget =
      Number(targetData.revenueTarget || 100000000);

    const tx = transactions.filter(t =>
      inPeriod(t.date, currentPeriod)
    );

    const periodSales = sales.filter(s =>
      inPeriod(s.date, currentPeriod)
    );

    const revenue = tx
      .filter(t => String(t.type).toLowerCase() === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const expenses = tx
      .filter(t => String(t.type).toLowerCase() === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const profit = revenue - expenses;

    const salesRevenue = periodSales
      .filter(s =>
        String(s.status || "Completed").toLowerCase() === "completed"
      )
      .reduce((sum, s) => sum + Number(s.amount || 0), 0);

    const profitMargin =
      revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

    const expenseRatio =
      revenue > 0 ? Math.round((expenses / revenue) * 100) : 0;

    const targetProgress =
      revenueTarget > 0
        ? Math.min(100, Math.round((revenue / revenueTarget) * 100))
        : 0;

    const activeCustomers = customers.filter(c =>
      String(c.status || "Active").toLowerCase() === "active"
    ).length;

    const lowStock = products.filter(p => {
      const stock = Number(p.stock || 0);
      const target = Number(
        p.targetStock ?? p.target ?? 0
      );

      return target > 0 && stock < target;
    });

    const inventoryValue = products.reduce(
      (sum, p) =>
        sum +
        Number(p.price || 0) *
        Number(p.stock || 0),
      0
    );

    const completedSales = periodSales.filter(s =>
      String(s.status || "Completed").toLowerCase() === "completed"
    );

    const averageSale =
      completedSales.length
        ? salesRevenue / completedSales.length
        : 0;

    /* ---------------------------------------------
       DAILY TREND
       --------------------------------------------- */

    const today = new Date();

    const trend = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setHours(0, 0, 0, 0);
      d.setDate(today.getDate() - i);

      const key =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0");

      const dayRevenue = tx
        .filter(t =>
          String(t.type).toLowerCase() === "income" &&
          String(t.date || "").slice(0, 10) === key
        )
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const dayExpense = tx
        .filter(t =>
          String(t.type).toLowerCase() === "expense" &&
          String(t.date || "").slice(0, 10) === key
        )
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      trend.push({
        label: d.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short"
        }),
        revenue: dayRevenue,
        expense: dayExpense
      });
    }

    const maxTrend = Math.max(
      1,
      ...trend.flatMap(x => [x.revenue, x.expense])
    );

    /* ---------------------------------------------
       TOP PRODUCTS
       --------------------------------------------- */

    const productMap = {};

    completedSales.forEach(s => {
      const name =
        s.productName ||
        s.product ||
        "Unknown Product";

      productMap[name] =
        (productMap[name] || 0) +
        Number(s.amount || 0);
    });

    const topProducts = Object.entries(productMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    /* ---------------------------------------------
       TOP CUSTOMERS
       --------------------------------------------- */

    const customerMap = {};

    completedSales.forEach(s => {
      const name =
        s.customer ||
        s.customerName ||
        "Unknown Customer";

      customerMap[name] =
        (customerMap[name] || 0) +
        Number(s.amount || 0);
    });

    const topCustomers = Object.entries(customerMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    /* ---------------------------------------------
       OPPORTUNITIES
       --------------------------------------------- */

    const opportunities = [];

    if (profit < 0 && revenue > 0) {
      opportunities.push({
        level: "critical",
        title: "Profit negatif",
        text: "Expenses lebih besar daripada revenue.",
        action: "expenses",
        button: "Review Expenses"
      });
    }

    if (expenseRatio >= 50) {
      opportunities.push({
        level: "warning",
        title: "Expense ratio tinggi",
        text: "Expenses mencapai " + expenseRatio + "% dari revenue.",
        action: "expenses",
        button: "Analyze Expenses"
      });
    }

    if (targetProgress < 70) {
      opportunities.push({
        level: "warning",
        title: "Revenue masih di bawah target",
        text:
          "Achievement baru " +
          targetProgress +
          "% dari target " +
          compact(revenueTarget) +
          ".",
        action: "sales",
        button: "Open Sales"
      });
    }

    if (lowStock.length > 0) {
      opportunities.push({
        level: "warning",
        title: lowStock.length + " produk perlu restock",
        text: "Stock berada di bawah target inventory.",
        action: "products",
        button: "Review Products"
      });
    }

    if (profitMargin >= 30 && revenue > 0) {
      opportunities.push({
        level: "positive",
        title: "Margin bisnis sehat",
        text:
          "Profit margin saat ini mencapai " +
          profitMargin +
          "%.",
        action: "finance",
        button: "View Finance"
      });
    }

    if (!opportunities.length) {
      opportunities.push({
        level: "positive",
        title: "Tidak ada alert kritis",
        text: "Kondisi bisnis saat ini berjalan normal.",
        action: "finance",
        button: "View Finance"
      });
    }

    /* ---------------------------------------------
       RECENT ACTIVITY
       --------------------------------------------- */

    const recent = [
      ...transactions.map(t => ({
        date: t.date,
        title: t.description || t.category || "Transaction",
        type:
          String(t.type).toLowerCase() === "income"
            ? "Revenue"
            : "Expense",
        amount: Number(t.amount || 0)
      })),
      ...sales.map(s => ({
        date: s.date,
        title:
          "Sale — " +
          (s.productName || s.product || "Product"),
        type: "Sale",
        amount: Number(s.amount || 0)
      }))
    ]
      .sort((a, b) =>
        new Date(b.date || 0) -
        new Date(a.date || 0)
      )
      .slice(0, 7);

    /* ---------------------------------------------
       RENDER
       --------------------------------------------- */

    content.innerHTML = `
      <div class="dash-v3">

        <div class="dash-v3-header">
          <div>
            <div class="dash-v3-eyebrow">
              BUSINESS CONTROL CENTER
            </div>

            <h1>Executive Dashboard</h1>

            <p>
              Pantau kondisi keuangan, sales, customer,
              produk dan peluang bisnis dari satu tempat.
            </p>
          </div>

          <div class="dash-v3-controls">
            <select id="dash-v3-period">
              <option value="7">7 Hari</option>
              <option value="30" selected>30 Hari</option>
              <option value="90">90 Hari</option>
              <option value="365">1 Tahun</option>
            </select>

            <button id="dash-v3-refresh">
              ↻ Refresh
            </button>
          </div>
        </div>

        <div class="dash-v3-kpis">

          <div class="dash-v3-kpi">
            <div class="dash-v3-kpi-top">
              <span>Revenue</span>
              <b>↗</b>
            </div>

            <strong>${compact(revenue)}</strong>

            <small>
              ${tx.filter(t =>
                String(t.type).toLowerCase() === "income"
              ).length}
              transaksi pemasukan
            </small>
          </div>

          <div class="dash-v3-kpi">
            <div class="dash-v3-kpi-top">
              <span>Expenses</span>
              <b>↘</b>
            </div>

            <strong>${compact(expenses)}</strong>

            <small>
              ${expenseRatio}% dari revenue
            </small>
          </div>

          <div class="dash-v3-kpi">
            <div class="dash-v3-kpi-top">
              <span>Net Profit</span>
              <b>${profit >= 0 ? "✓" : "!"}</b>
            </div>

            <strong>${compact(profit)}</strong>

            <small>
              Margin ${profitMargin}%
            </small>
          </div>

          <div class="dash-v3-kpi">
            <div class="dash-v3-kpi-top">
              <span>Sales</span>
              <b>★</b>
            </div>

            <strong>${compact(salesRevenue)}</strong>

            <small>
              ${completedSales.length} completed sales
            </small>
          </div>

        </div>

        <div class="dash-v3-main-grid">

          <section class="dash-v3-card dash-v3-chart-card">

            <div class="dash-v3-card-head">
              <div>
                <h2>Financial Trend</h2>
                <p>Revenue dan expense 7 hari terakhir</p>
              </div>

              <button class="dash-v3-link" data-dash-v3-page="cashflow">
                Detail →
              </button>
            </div>

            <div class="dash-v3-chart">

              ${trend.map(item => `
                <div class="dash-v3-chart-day">

                  <div class="dash-v3-bars">

                    <div
                      class="dash-v3-bar revenue"
                      style="height:${Math.max(
                        item.revenue > 0 ? 8 : 2,
                        (item.revenue / maxTrend) * 150
                      )}px">
                    </div>

                    <div
                      class="dash-v3-bar expense"
                      style="height:${Math.max(
                        item.expense > 0 ? 8 : 2,
                        (item.expense / maxTrend) * 150
                      )}px">
                    </div>

                  </div>

                  <span>${esc(item.label)}</span>
                </div>
              `).join("")}

            </div>

            <div class="dash-v3-legend">
              <span><i class="rev"></i> Revenue</span>
              <span><i class="exp"></i> Expense</span>
            </div>

          </section>

          <section class="dash-v3-card">

            <div class="dash-v3-card-head">
              <div>
                <h2>Opportunity Center</h2>
                <p>Prioritas yang perlu diperhatikan</p>
              </div>
            </div>

            <div class="dash-v3-opportunities">

              ${opportunities.slice(0, 4).map(op => `
                <div class="dash-v3-op ${op.level}">

                  <div class="dash-v3-op-icon">
                    ${
                      op.level === "critical"
                        ? "!"
                        : op.level === "warning"
                          ? "!"
                          : "✓"
                    }
                  </div>

                  <div class="dash-v3-op-body">
                    <strong>${esc(op.title)}</strong>
                    <p>${esc(op.text)}</p>

                    <button
                      data-dash-v3-page="${esc(op.action)}">
                      ${esc(op.button)} →
                    </button>
                  </div>

                </div>
              `).join("")}

            </div>

          </section>

        </div>

        <div class="dash-v3-two-grid">

          <section class="dash-v3-card">

            <div class="dash-v3-card-head">
              <div>
                <h2>Business Performance</h2>
                <p>Indikator utama bisnis</p>
              </div>
            </div>

            <div class="dash-v3-performance">

              <div>
                <span>Sales Target</span>
                <strong>${targetProgress}%</strong>

                <div class="dash-v3-progress">
                  <i style="width:${targetProgress}%"></i>
                </div>

                <small>
                  ${compact(revenue)}
                  / ${compact(revenueTarget)}
                </small>
              </div>

              <div>
                <span>Profit Margin</span>
                <strong>${profitMargin}%</strong>

                <div class="dash-v3-progress">
                  <i style="width:${Math.max(
                    0,
                    Math.min(100, profitMargin)
                  )}%"></i>
                </div>

                <small>
                  ${profit >= 0 ? "Profit positif" : "Perlu perhatian"}
                </small>
              </div>

              <div>
                <span>Expense Control</span>
                <strong>${Math.max(
                  0,
                  100 - expenseRatio
                )}%</strong>

                <div class="dash-v3-progress">
                  <i style="width:${Math.max(
                    0,
                    Math.min(100, 100 - expenseRatio)
                  )}%"></i>
                </div>

                <small>
                  Expense ratio ${expenseRatio}%
                </small>
              </div>

            </div>

          </section>

          <section class="dash-v3-card">

            <div class="dash-v3-card-head">
              <div>
                <h2>Operational Snapshot</h2>
                <p>Status operasional bisnis</p>
              </div>
            </div>

            <div class="dash-v3-snapshot">

              <button data-dash-v3-page="customers">
                <span>Customers</span>
                <strong>${activeCustomers}</strong>
              </button>

              <button data-dash-v3-page="products">
                <span>Products</span>
                <strong>${products.length}</strong>
              </button>

              <button data-dash-v3-page="products">
                <span>Low Stock</span>
                <strong>${lowStock.length}</strong>
              </button>

              <button data-dash-v3-page="products">
                <span>Inventory Value</span>
                <strong>${compact(inventoryValue)}</strong>
              </button>

            </div>

          </section>

        </div>

        <div class="dash-v3-two-grid">

          <section class="dash-v3-card">

            <div class="dash-v3-card-head">
              <div>
                <h2>Top Products</h2>
                <p>Produk berdasarkan revenue</p>
              </div>

              <button
                class="dash-v3-link"
                data-dash-v3-page="products">
                Products →
              </button>
            </div>

            <div class="dash-v3-ranking">

              ${
                topProducts.length
                  ? topProducts.map((item, i) => `
                    <div class="dash-v3-rank">
                      <b>${i + 1}</b>
                      <span>${esc(item[0])}</span>
                      <strong>${compact(item[1])}</strong>
                    </div>
                  `).join("")
                  : `
                    <div class="dash-v3-empty">
                      Belum ada data sales.
                    </div>
                  `
              }

            </div>

          </section>

          <section class="dash-v3-card">

            <div class="dash-v3-card-head">
              <div>
                <h2>Top Customers</h2>
                <p>Customer berdasarkan revenue</p>
              </div>

              <button
                class="dash-v3-link"
                data-dash-v3-page="customers">
                Customers →
              </button>
            </div>

            <div class="dash-v3-ranking">

              ${
                topCustomers.length
                  ? topCustomers.map((item, i) => `
                    <div class="dash-v3-rank">
                      <b>${i + 1}</b>
                      <span>${esc(item[0])}</span>
                      <strong>${compact(item[1])}</strong>
                    </div>
                  `).join("")
                  : `
                    <div class="dash-v3-empty">
                      Belum ada data customer.
                    </div>
                  `
              }

            </div>

          </section>

        </div>

        <section class="dash-v3-card">

          <div class="dash-v3-card-head">
            <div>
              <h2>Recent Activity</h2>
              <p>Aktivitas bisnis terbaru</p>
            </div>

            <button
              class="dash-v3-link"
              data-dash-v3-page="finance">
              Finance →
            </button>
          </div>

          <div class="dash-v3-table-wrap">

            <table class="dash-v3-table">

              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Aktivitas</th>
                  <th>Tipe</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>

                ${
                  recent.length
                    ? recent.map(item => `
                      <tr>
                        <td>${esc(item.date || "-")}</td>

                        <td>
                          <strong>${esc(item.title)}</strong>
                        </td>

                        <td>
                          <span class="dash-v3-type">
                            ${esc(item.type)}
                          </span>
                        </td>

                        <td>
                          <strong>${money(item.amount)}</strong>
                        </td>
                      </tr>
                    `).join("")
                    : `
                      <tr>
                        <td colspan="4">
                          Belum ada aktivitas.
                        </td>
                      </tr>
                    `
                }

              </tbody>

            </table>

          </div>

        </section>

        <section class="dash-v3-card">

          <div class="dash-v3-card-head">
            <div>
              <h2>Quick Actions</h2>
              <p>Akses cepat ke pekerjaan utama</p>
            </div>
          </div>

          <div class="dash-v3-actions">

            <button data-dash-v3-page="finance">
              <b>＋</b>
              <span>Transaction</span>
            </button>

            <button data-dash-v3-page="sales">
              <b>＋</b>
              <span>Sale</span>
            </button>

            <button data-dash-v3-page="customers">
              <b>＋</b>
              <span>Customer</span>
            </button>

            <button data-dash-v3-page="products">
              <b>＋</b>
              <span>Product</span>
            </button>

            <button data-dash-v3-page="expenses">
              <b>↘</b>
              <span>Expenses</span>
            </button>

            <button data-dash-v3-page="cashflow">
              <b>↔</b>
              <span>Cash Flow</span>
            </button>

          </div>

        </section>

      </div>

      <style>

        .dash-v3 {
          padding: 4px 0 35px;
          color: #172033;
        }

        .dash-v3-header {
          display:flex;
          align-items:flex-end;
          justify-content:space-between;
          gap:20px;
          margin-bottom:24px;
        }

        .dash-v3-eyebrow {
          font-size:10px;
          font-weight:800;
          letter-spacing:1.2px;
          color:#667085;
          margin-bottom:6px;
        }

        .dash-v3-header h1 {
          margin:0;
          font-size:30px;
          line-height:1.15;
          letter-spacing:-.7px;
          color:#101828;
        }

        .dash-v3-header p {
          margin:8px 0 0;
          color:#667085;
          font-size:13px;
          max-width:650px;
        }

        .dash-v3-controls {
          display:flex;
          gap:8px;
          flex-shrink:0;
        }

        .dash-v3-controls select,
        .dash-v3-controls button {
          height:40px;
          border:1px solid #d0d5dd;
          border-radius:10px;
          background:#fff;
          padding:0 13px;
          color:#344054;
          font-weight:650;
          font-size:12px;
          cursor:pointer;
        }

        .dash-v3-controls button:hover,
        .dash-v3-controls select:hover {
          border-color:#98a2b3;
          background:#f9fafb;
        }

        .dash-v3-kpis {
          display:grid;
          grid-template-columns:repeat(4,minmax(0,1fr));
          gap:14px;
          margin-bottom:18px;
        }

        .dash-v3-kpi {
          background:#fff;
          border:1px solid #e4e7ec;
          border-radius:15px;
          padding:18px;
          box-shadow:0 3px 12px rgba(16,24,40,.045);
          min-height:125px;
        }

        .dash-v3-kpi-top {
          display:flex;
          justify-content:space-between;
          align-items:center;
          color:#667085;
          font-size:11px;
          font-weight:750;
          text-transform:uppercase;
          letter-spacing:.3px;
        }

        .dash-v3-kpi-top b {
          width:27px;
          height:27px;
          display:flex;
          align-items:center;
          justify-content:center;
          border-radius:8px;
          background:#f2f4f7;
          color:#344054;
          font-size:12px;
        }

        .dash-v3-kpi strong {
          display:block;
          margin-top:12px;
          font-size:24px;
          letter-spacing:-.5px;
          color:#101828;
        }

        .dash-v3-kpi small {
          display:block;
          margin-top:7px;
          color:#98a2b3;
          font-size:10px;
        }

        .dash-v3-main-grid {
          display:grid;
          grid-template-columns:minmax(0,1.55fr) minmax(320px,.9fr);
          gap:16px;
          margin-bottom:16px;
        }

        .dash-v3-two-grid {
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:16px;
          margin-bottom:16px;
        }

        .dash-v3-card {
          background:#fff;
          border:1px solid #e4e7ec;
          border-radius:15px;
          padding:19px;
          box-shadow:0 3px 12px rgba(16,24,40,.04);
          margin-bottom:16px;
        }

        .dash-v3-main-grid .dash-v3-card,
        .dash-v3-two-grid .dash-v3-card {
          margin-bottom:0;
        }

        .dash-v3-card-head {
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
          margin-bottom:17px;
        }

        .dash-v3-card-head h2 {
          margin:0;
          font-size:15px;
          color:#101828;
        }

        .dash-v3-card-head p {
          margin:5px 0 0;
          font-size:11px;
          color:#667085;
        }

        .dash-v3-link {
          border:0;
          background:transparent;
          color:#344054;
          font-size:11px;
          font-weight:750;
          cursor:pointer;
          padding:3px;
        }

        .dash-v3-link:hover {
          text-decoration:underline;
        }

        .dash-v3-chart {
          height:190px;
          display:flex;
          align-items:flex-end;
          justify-content:space-around;
          gap:10px;
          padding:5px 5px 0;
          border-bottom:1px solid #eaecf0;
        }

        .dash-v3-chart-day {
          flex:1;
          height:100%;
          display:flex;
          flex-direction:column;
          justify-content:flex-end;
          align-items:center;
          gap:8px;
          min-width:0;
        }

        .dash-v3-bars {
          height:160px;
          display:flex;
          align-items:flex-end;
          justify-content:center;
          gap:4px;
        }

        .dash-v3-bar {
          width:10px;
          min-height:2px;
          border-radius:4px 4px 0 0;
        }

        .dash-v3-bar.revenue {
          background:#344054;
        }

        .dash-v3-bar.expense {
          background:#d0d5dd;
        }

        .dash-v3-chart-day > span {
          font-size:9px;
          color:#98a2b3;
          white-space:nowrap;
        }

        .dash-v3-legend {
          display:flex;
          gap:18px;
          margin-top:12px;
          font-size:10px;
          color:#667085;
        }

        .dash-v3-legend i {
          display:inline-block;
          width:7px;
          height:7px;
          border-radius:50%;
          margin-right:5px;
        }

        .dash-v3-legend .rev {
          background:#344054;
        }

        .dash-v3-legend .exp {
          background:#d0d5dd;
        }

        .dash-v3-op {
          display:flex;
          gap:11px;
          padding:12px;
          border:1px solid #eaecf0;
          border-radius:11px;
          margin-bottom:9px;
          background:#fcfcfd;
        }

        .dash-v3-op:last-child {
          margin-bottom:0;
        }

        .dash-v3-op-icon {
          flex:0 0 27px;
          width:27px;
          height:27px;
          display:flex;
          align-items:center;
          justify-content:center;
          border-radius:8px;
          background:#f2f4f7;
          color:#344054;
          font-weight:800;
          font-size:11px;
        }

        .dash-v3-op.critical .dash-v3-op-icon {
          background:#fee4e2;
          color:#b42318;
        }

        .dash-v3-op.warning .dash-v3-op-icon {
          background:#fef0c7;
          color:#b54708;
        }

        .dash-v3-op.positive .dash-v3-op-icon {
          background:#dcfae6;
          color:#027a48;
        }

        .dash-v3-op-body {
          min-width:0;
        }

        .dash-v3-op-body strong {
          display:block;
          color:#101828;
          font-size:12px;
        }

        .dash-v3-op-body p {
          margin:4px 0 7px;
          color:#667085;
          font-size:10px;
          line-height:1.5;
        }

        .dash-v3-op-body button {
          padding:0;
          border:0;
          background:none;
          color:#344054;
          font-size:10px;
          font-weight:750;
          cursor:pointer;
        }

        .dash-v3-performance {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:18px;
        }

        .dash-v3-performance span {
          display:block;
          font-size:10px;
          font-weight:650;
          color:#667085;
        }

        .dash-v3-performance strong {
          display:block;
          margin-top:7px;
          color:#101828;
          font-size:18px;
        }

        .dash-v3-performance small {
          display:block;
          margin-top:6px;
          color:#98a2b3;
          font-size:9px;
        }

        .dash-v3-progress {
          height:6px;
          margin-top:9px;
          overflow:hidden;
          border-radius:99px;
          background:#eaecf0;
        }

        .dash-v3-progress i {
          display:block;
          height:100%;
          border-radius:99px;
          background:#344054;
        }

        .dash-v3-snapshot {
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:9px;
        }

        .dash-v3-snapshot button {
          text-align:left;
          padding:13px;
          border:1px solid #eaecf0;
          border-radius:10px;
          background:#fcfcfd;
          cursor:pointer;
        }

        .dash-v3-snapshot button:hover {
          background:#f9fafb;
          border-color:#d0d5dd;
        }

        .dash-v3-snapshot span {
          display:block;
          color:#667085;
          font-size:9px;
          font-weight:650;
        }

        .dash-v3-snapshot strong {
          display:block;
          margin-top:6px;
          color:#101828;
          font-size:15px;
        }

        .dash-v3-ranking {
          display:flex;
          flex-direction:column;
          gap:8px;
        }

        .dash-v3-rank {
          display:grid;
          grid-template-columns:26px minmax(0,1fr) auto;
          align-items:center;
          gap:9px;
          padding:10px;
          border:1px solid #f0f2f5;
          border-radius:9px;
        }

        .dash-v3-rank > b {
          width:24px;
          height:24px;
          display:flex;
          align-items:center;
          justify-content:center;
          border-radius:7px;
          background:#f2f4f7;
          color:#475467;
          font-size:10px;
        }

        .dash-v3-rank span {
          min-width:0;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          color:#344054;
          font-size:11px;
          font-weight:600;
        }

        .dash-v3-rank strong {
          color:#101828;
          font-size:11px;
        }

        .dash-v3-empty {
          padding:25px;
          text-align:center;
          color:#98a2b3;
          font-size:11px;
        }

        .dash-v3-table-wrap {
          overflow-x:auto;
        }

        .dash-v3-table {
          width:100%;
          border-collapse:collapse;
          min-width:620px;
        }

        .dash-v3-table th {
          padding:10px;
          text-align:left;
          background:#f8fafc;
          border-bottom:1px solid #eaecf0;
          color:#667085;
          font-size:9px;
          text-transform:uppercase;
          letter-spacing:.4px;
        }

        .dash-v3-table td {
          padding:12px 10px;
          border-bottom:1px solid #f2f4f7;
          color:#475467;
          font-size:11px;
        }

        .dash-v3-table td strong {
          color:#101828;
        }

        .dash-v3-type {
          display:inline-block;
          padding:4px 7px;
          border-radius:6px;
          background:#f2f4f7;
          color:#475467;
          font-size:9px;
          font-weight:650;
        }

        .dash-v3-actions {
          display:grid;
          grid-template-columns:repeat(6,1fr);
          gap:10px;
        }

        .dash-v3-actions button {
          min-height:70px;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:7px;
          border:1px solid #e4e7ec;
          border-radius:11px;
          background:#fff;
          color:#344054;
          cursor:pointer;
          font-size:10px;
          font-weight:700;
        }

        .dash-v3-actions button:hover {
          transform:translateY(-1px);
          background:#f9fafb;
          border-color:#98a2b3;
        }

        .dash-v3-actions b {
          font-size:18px;
          font-weight:500;
        }

        @media(max-width:1050px) {
          .dash-v3-kpis {
            grid-template-columns:repeat(2,1fr);
          }

          .dash-v3-main-grid {
            grid-template-columns:1fr;
          }

          .dash-v3-actions {
            grid-template-columns:repeat(3,1fr);
          }
        }

        @media(max-width:700px) {
          .dash-v3-header {
            align-items:stretch;
            flex-direction:column;
          }

          .dash-v3-controls {
            width:100%;
          }

          .dash-v3-controls select,
          .dash-v3-controls button {
            flex:1;
          }

          .dash-v3-kpis,
          .dash-v3-two-grid {
            grid-template-columns:1fr;
          }

          .dash-v3-performance {
            grid-template-columns:1fr;
            gap:15px;
          }

          .dash-v3-actions {
            grid-template-columns:repeat(2,1fr);
          }
        }

        @media(max-width:430px) {
          .dash-v3-header h1 {
            font-size:24px;
          }

          .dash-v3-card {
            padding:15px;
            border-radius:13px;
          }

          .dash-v3-chart {
            gap:3px;
          }

          .dash-v3-bar {
            width:7px;
          }
        }

      </style>
    `;

    const periodSelect =
      document.getElementById("dash-v3-period");

    if (periodSelect) {
      periodSelect.value = String(currentPeriod);

      periodSelect.addEventListener("change", function () {
        currentPeriod = Number(this.value) || 30;
        renderDashboard();
      });
    }

    const refresh =
      document.getElementById("dash-v3-refresh");

    if (refresh) {
      refresh.addEventListener("click", function () {
        renderDashboard();
      });
    }

    content
      .querySelectorAll("[data-dash-v3-page]")
      .forEach(button => {
        button.addEventListener("click", function () {
          navigate(button.dataset.dashV3Page);
        });
      });
  }

  window.renderLiveDashboard = renderDashboard;

  /*
   * Dashboard navigation
   */
  document.addEventListener("click", function (event) {
    const button =
      event.target.closest('[data-page="dashboard"]');

    if (!button) return;

    setTimeout(function () {
      renderDashboard();
    }, 80);
  });

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
