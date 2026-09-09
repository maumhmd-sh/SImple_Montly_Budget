# Monthly Budget

> Modern full-stack personal finance management for income, expenses, budgets, accounts, categories, savings, reports, notifications, user preferences, and AI-powered financial analysis.

---

## ✨ Features

- 🔐 **Authentication** — JWT login/logout, protected routes, automatic redirect when unauthenticated, profile management, and password change.
- 📊 **Dashboard** — financial overview, income/expense summary, cashflow, account balance, category spending, budget progress, and savings movement.
- 💰 **Income** — create, view, update, and delete income records.
- 💸 **Expense** — create, view, update, and delete expense records with account/category support.
- 🎯 **Budget** — monthly category budgets with amount, month, year, usage percentage, warning state, and over-budget detection.
- 🏦 **Accounts** — create, view, update, and delete financial accounts with balance tracking.
- 🏷️ **Categories** — income/expense categories with icons and colors; full CRUD.
- 🐷 **Savings** — target and free savings, current balance, target amount, target date, status, description, and routine saving.
- 💵 **Savings Deposit** — add money to a saving and record the activity in savings history.
- 🔄 **Savings Withdrawal** — withdraw money from savings with balance validation and account transfer support.
- 📜 **Savings History** — view opening balance, deposit, withdrawal, description, and transaction date history.
- 🔁 **Routine Savings** — weekly, monthly, and yearly recurring saving configuration.
- 🔔 **Notifications** — activity notifications, unread counter, read/unread state, and notification center.
- ⚙️ **Settings** — profile, password/account settings, theme, and accent preferences.
- 🌓 **Themes** — light, dark, and system preference with persistence.
- 🎨 **Accent Colors** — blue, purple, green, orange, red, and pink.
- 📈 **Reports & Analytics** — financial reporting, income/expense comparison, category analysis, budget analysis, savings summary, and financial health.
- 🤖 **AI Financial Analyst (BETA)** — AI-powered interpretation of financial data using Gemini, with deterministic backend financial health scoring.
- ❤️ **Financial Health Score** — 0–100 score based on cashflow, expense control, saving rate, budget discipline, and liquidity.
- 🧭 **UX** — collapsible sidebar, responsive layout, live clock, active navigation, user display, loading states, and feedback states.
- 🚫 **Custom 404** — dedicated not-found page for invalid routes.

### Notification Events

Examples include:

- `Profile berhasil diperbarui`
- `Password berhasil diubah`
- `Income berhasil ditambahkan`
- `Expense berhasil dicatat`
- `Budget baru berhasil dibuat`
- `Account baru ditambahkan`
- `Tabungan baru dibuat`
- `Tabungan bertambah`
- `Tabungan berkurang`

---

## 🧱 Tech Stack

**Frontend:** Vue 3, Vite, Vue Router, Pinia, Axios, Bootstrap 5, Bootstrap Icons

**Backend:** Node.js, Express 5, Sequelize, MySQL/MariaDB, JWT, bcrypt/bcryptjs, CORS, dotenv

**AI:** Google Gemini API, `@google/genai`

---

## 📁 Structure

```text
monthly-budget/
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   └── aiFinancialService.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── router/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── views/
│   │   │   ├── DashboardView.vue
│   │   │   ├── IncomeView.vue
│   │   │   ├── ExpenseView.vue
│   │   │   ├── BudgetView.vue
│   │   │   ├── SavingsView.vue
│   │   │   ├── AccountsView.vue
│   │   │   ├── CategoriesView.vue
│   │   │   ├── ReportsView.vue
│   │   │   ├── AIAnalystView.vue
│   │   │   ├── SettingsView.vue
│   │   │   ├── LoginView.vue
│   │   │   ├── RegisterView.vue
│   │   │   └── NotFoundView.vue
│   │   ├── App.vue
│   │   └── main.js
│   └── package.json
│
├── package.json
└── README.md
```

---

## 🚀 Run

Install root dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
npm --prefix backend install
```

Install frontend dependencies:

```bash
npm --prefix frontend install
```

### Run backend + frontend together

```bash
npm run dev
```

### Run separately

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev:frontend
```

Or directly:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

### Build frontend

```bash
npm run build
```

---

## 🌐 Development URLs

Frontend:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:3000
```

API base:

```text
http://localhost:3000/api
```

---

# 🔌 API

> All protected endpoints require a valid JWT unless otherwise noted.

## 🔐 Authentication & Profile

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current authenticated user |
| GET | `/api/auth/profile` | Get profile |
| PUT/PATCH | `/api/auth/profile` | Update profile |
| PUT/PATCH | `/api/auth/password` | Change password |
| POST | `/api/auth/logout` | Logout |

---

## 📊 Dashboard

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dashboard` | Get current financial dashboard |
| GET | `/api/dashboard?month=YYYY-MM` | Get dashboard for selected month |

Example:

```text
GET /api/dashboard?month=2026-09
```

Dashboard can return:

- `totalIncome`
- `totalExpense`
- `netCashflow`
- `balance`
- `saving`
- `expenseRate`
- `savingRate`
- `totalTransfer`
- `totalSavingsDeposit`
- `totalSavingsWithdrawal`
- `netSavingsMovement`
- `categoryExpenses`
- `budgetProgress`
- account information

---

## 🏦 Accounts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/accounts` | List accounts |
| POST | `/api/accounts` | Create account |
| PUT | `/api/accounts/:id` | Update account |
| DELETE | `/api/accounts/:id` | Delete account |

---

## 🏷️ Categories

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

Category types:

```text
income
expense
```

---

## 💰 Income

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/incomes` | List income |
| POST | `/api/incomes` | Create income |
| GET | `/api/incomes/:id` | Get income |
| PUT | `/api/incomes/:id` | Update income |
| DELETE | `/api/incomes/:id` | Delete income |

Example filter:

```text
GET /api/incomes?month=2026-09
```

---

## 💸 Expense

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/expenses` | List expenses |
| POST | `/api/expenses` | Create expense |
| GET | `/api/expenses/:id` | Get expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

Example filter:

```text
GET /api/expenses?month=2026-09
```

---

## 🎯 Budgets

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/budgets` | List monthly budgets |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/:id` | Update budget |
| DELETE | `/api/budgets/:id` | Delete budget |

Budget is associated with:

- User
- Category
- Month
- Year
- Amount

Budget usage:

```text
Budget Usage = Actual Expense / Budget Limit × 100
```

---

## 🐷 Savings

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/savings` | List savings |
| POST | `/api/savings` | Create saving |
| GET | `/api/savings/:id` | Get saving detail |
| PUT | `/api/savings/:id` | Update saving |
| DELETE | `/api/savings/:id` | Delete saving |
| POST | `/api/savings/:id/deposit` | Deposit to saving |
| POST | `/api/savings/:id/withdraw` | Withdraw from saving |
| GET | `/api/savings/:id/transactions` | Get saving transaction history |

### Savings Types

```text
target
free
```

### Savings Status

```text
active
completed
```

### Routine Frequency

```text
weekly
monthly
yearly
```

Routine day validation:

```text
weekly  → 1–7
monthly → 1–31
yearly  → 1–12
```

---

## 🔔 Notifications

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PUT | `/api/notifications/:id/read` | Mark notification as read |
| PUT | `/api/notifications/read-all` | Mark all notifications as read |

The notification list is scoped to the authenticated user.

---

## 🤖 AI Financial Analyst

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/ai/financial-analysis` | Generate AI financial analysis |

Example:

```text
GET /api/ai/financial-analysis?month=2026-09
```

Authentication:

```http
Authorization: Bearer <TOKEN>
```

The endpoint prepares financial data from:

- Income
- Expense
- Account balance
- Category spending
- Monthly budget
- Savings deposit
- Savings withdrawal
- Previous-month comparison

The backend then calculates the deterministic financial health score and sends structured financial data to Gemini for interpretation.

---

# 🤖 AI Financial Analyst — BETA

AI Analyst is a dedicated feature separate from Reports.

Frontend route:

```text
/ai-analyst
```

Backend endpoint:

```text
/api/ai/financial-analysis
```

The feature is designed to answer questions such as:

- How healthy is the current financial condition?
- Is spending under control?
- How strong is the monthly cashflow?
- How much of income is being saved?
- Are budgets being respected?
- Is current account liquidity sufficient?
- What are the most important financial risks?
- What practical actions can be taken next?

---

## 🧠 AI Processing Flow

```text
Frontend
   │
   │ Axios + JWT
   ▼
GET /api/ai/financial-analysis
   │
   ▼
Backend
   │
   ├── Income
   ├── Expense
   ├── Accounts
   ├── Budgets
   ├── Savings
   ├── Transfers
   └── Previous Month
   │
   ▼
Deterministic Financial Health Score
   │
   ▼
Gemini Financial Analysis
   │
   ▼
Structured JSON
   │
   ▼
AI Analyst UI
```

---

## ❤️ Financial Health Score

The financial health score has a maximum of:

```text
100
```

Current scoring components:

| Component | Maximum |
|---|---:|
| Cashflow | 25 |
| Expense Control | 20 |
| Saving Rate | 25 |
| Budget Discipline | 15 |
| Liquidity | 15 |
| **Total** | **100** |

Health labels:

| Score | Label |
|---:|---|
| 90–100 | Sangat Sehat |
| 80–89 | Sehat |
| 70–79 | Cukup Sehat |
| 60–69 | Perlu Perhatian |
| 0–59 | Berisiko |

The score is calculated by the backend.

Gemini does **not** decide or overwrite the score.

---

## 📊 AI Metrics

Important metrics include:

```text
total_income
total_expense
net_cashflow
expense_rate
saving_rate
cashflow_margin
total_balance
total_transfer
```

### Expense Rate

```text
Expense Rate =
Total Expense / Total Income × 100
```

### Net Cashflow

```text
Net Cashflow =
Total Income - Total Expense
```

Transfers are not treated as expenses.

### Net Savings Movement

```text
Net Savings Movement =
Total Savings Deposit - Total Savings Withdrawal
```

### Available Balance Concept

```text
Available Balance =
Income - Expense - Net Savings Movement
```

The exact current account balance is also calculated from account balances.

---

## 🔄 Transfer Rules

A transfer is a movement of money, not income or consumption.

```text
Transfer ≠ Income
Transfer ≠ Expense
```

Savings deposit:

```text
Savings Deposit ≠ Expense
```

Savings withdrawal:

```text
Savings Withdrawal ≠ Income
```

This distinction is important so Dashboard, Reports, and AI Analyst do not inflate income or expense figures when money is simply moved between accounts/savings.

---

## 📦 AI Response Structure

The AI service can return structured sections such as:

```text
executive_summary
headline
health_score
health_label
financial_position
cashflow_analysis
spending_analysis
budget_analysis
savings_analysis
trend_analysis
highlights
risks
opportunities
recommendations
outlook
```

The AI should:

- Use only the financial data supplied by the backend.
- Avoid inventing transactions or balances.
- Preserve the backend financial health score.
- Distinguish income, expense, transfer, and savings movement.
- Explain why a metric matters.
- Identify meaningful risks.
- Suggest practical budgeting and financial-management actions.
- Use Indonesian language.
- Avoid unsupported claims.
- Avoid presenting itself as a licensed financial advisor.

> **AI Financial Analyst is an informational feature and should not be considered a substitute for professional financial advice.**

---

# 🗄️ Database

Database engine:

```text
MySQL / MariaDB
```

ORM:

```text
Sequelize
```

Recommended development database:

```text
monthly_budget
```

Create the database:

```sql
CREATE DATABASE monthly_budget
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

---

# 🧱 Data Models

Main models:

- User
- Account
- Category
- Transaction
- MonthlyBudget
- Savings
- SavingsTransaction
- Notification

---

## 👤 User

Stores authenticated user information.

Typical fields:

```text
id
name
email
password
created_at
updated_at
```

Password is stored as a bcrypt/bcryptjs hash rather than plaintext.

Relationship:

```text
User 1 ─── N Account
User 1 ─── N Category
User 1 ─── N Transaction
User 1 ─── N MonthlyBudget
User 1 ─── N Savings
User 1 ─── N Notification
```

---

## 🏦 Account

Represents a financial account or money location.

Typical fields:

```text
id
user_id
name
type
balance
created_at
updated_at
```

Examples:

```text
Bank
Cash
E-Wallet
```

Relationship:

```text
User 1 ─── N Account
Account 1 ─── N Transaction
```

---

## 🏷️ Category

Groups income and expense transactions.

Typical fields:

```text
id
user_id
name
type
icon
color
created_at
updated_at
```

Types:

```text
income
expense
```

Relationship:

```text
User 1 ─── N Category
Category 1 ─── N Transaction
Category 1 ─── N MonthlyBudget
```

---

## 💳 Transaction

Stores the application's main financial movements.

Typical fields:

```text
id
user_id
category_id
account_id
saving_id
type
amount
description
transaction_date
created_at
updated_at
```

Main transaction types:

```text
income
expense
transfer
```

### Income

```text
type = income
```

Represents money received.

### Expense

```text
type = expense
```

Represents money spent.

### Transfer

```text
type = transfer
```

Represents movement of money between financial locations.

Transfers are not counted as income or expense.

---

## 🎯 MonthlyBudget

Stores category-based monthly budgets.

Typical fields:

```text
id
user_id
category_id
month
year
amount
created_at
updated_at
```

Relationship:

```text
User 1 ─── N MonthlyBudget
Category 1 ─── N MonthlyBudget
```

Budget progress is calculated from actual expense for the selected category and period.

---

## 🐷 Savings

Stores saving goals and free savings.

Typical fields:

```text
id
user_id
name
type
target_amount
current_amount
routine_amount
routine_frequency
routine_day
target_date
description
status
created_at
updated_at
```

Types:

```text
target
free
```

Target savings can contain:

```text
target_amount
target_date
```

Free savings can be used without a target amount.

Relationship:

```text
User 1 ─── N Savings
Savings 1 ─── N SavingsTransaction
```

---

## 📜 SavingsTransaction

Stores saving activity history.

Typical fields:

```text
id
user_id
saving_id
type
amount
description
transaction_date
created_at
updated_at
```

Types:

```text
opening_balance
deposit
withdrawal
```

Relationship:

```text
User 1 ─── N SavingsTransaction
Savings 1 ─── N SavingsTransaction
```

---

## 🔔 Notification

Stores activity notifications.

Typical fields:

```text
id
user_id
type
title
message
is_read
created_at
updated_at
```

Relationship:

```text
User 1 ─── N Notification
```

---

# 🔗 Database Relationship Overview

```text
                         ┌──────────────┐
                         │     User     │
                         └──────┬───────┘
                                │
            ┌───────────────────┼────────────────────┐
            │                   │                    │
            ▼                   ▼                    ▼
      ┌───────────┐      ┌────────────┐       ┌────────────┐
      │  Account  │      │  Category  │       │   Savings  │
      └─────┬─────┘      └──────┬─────┘       └─────┬──────┘
            │                   │                   │
            │                   │                   ▼
            │                   │            ┌──────────────────┐
            │                   │            │SavingsTransaction│
            │                   │            └──────────────────┘
            │                   │
            └─────────┬─────────┘
                      │
                      ▼
               ┌─────────────┐
               │ Transaction │
               └─────────────┘
                      │
                      │
               ┌──────┴───────┐
               │              │
               ▼              ▼
       ┌──────────────┐  ┌───────────────┐
       │MonthlyBudget │  │ Notification  │
       └──────────────┘  └───────────────┘
```

---

# 🔑 Authentication

Protected requests use:

```http
Authorization: Bearer <TOKEN>
```

Example:

```bash
export TOKEN="YOUR_TOKEN"

curl -s http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

The backend validates the JWT and uses the authenticated user ID to scope financial data.

---

# 🧪 API Examples

## Register

```bash
curl -X POST \
  http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Example User",
    "email": "user@example.com",
    "password": "your_password"
  }'
```

## Login

```bash
curl -X POST \
  http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'
```

## Dashboard

```bash
curl -s \
  "http://localhost:3000/api/dashboard?month=2026-09" \
  -H "Authorization: Bearer $TOKEN"
```

## Savings

```bash
curl -s \
  http://localhost:3000/api/savings \
  -H "Authorization: Bearer $TOKEN"
```

## Notifications

```bash
curl -s \
  http://localhost:3000/api/notifications \
  -H "Authorization: Bearer $TOKEN"
```

## AI Financial Analyst

```bash
curl -s \
  "http://localhost:3000/api/ai/financial-analysis?month=2026-09" \
  -H "Authorization: Bearer $TOKEN"
```

---

# 🔑 Environment Variables

Create:

```text
backend/.env
```

Example:

```env
# ==========================================
# SERVER
# ==========================================

PORT=3000


# ==========================================
# DATABASE
# ==========================================

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=monthly_budget
DB_USER=your_database_user
DB_PASSWORD=your_database_password


# ==========================================
# JWT
# ==========================================

JWT_SECRET=replace_with_a_long_random_secret


# ==========================================
# GEMINI AI
# ==========================================

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.1-pro-preview
```

Create frontend environment file if needed:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:3000/api
```

The frontend API service can fall back to:

```text
http://localhost:3000/api
```

when `VITE_API_URL` is not provided.

---

# 🗃️ Database Configuration

The backend uses Sequelize with MySQL/MariaDB.

Example configuration:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=monthly_budget
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

After configuring the database, start the backend.

The backend verifies the database connection before starting the API server.

---

# 🛡️ Data Ownership

Financial data is scoped to the authenticated user.

The backend uses the user ID from the JWT for operations involving:

- Accounts
- Categories
- Income
- Expenses
- Transactions
- Budgets
- Savings
- Savings Transactions
- Notifications
- AI Financial Analysis

Conceptually:

```text
JWT
 │
 ▼
Authenticated User
 │
 └── user_id
       │
       ├── Accounts
       ├── Categories
       ├── Transactions
       ├── Budgets
       ├── Savings
       └── Notifications
```

A user should only be able to access their own financial records.

---

# 📐 Financial Calculation Rules

## Net Cashflow

```text
Net Cashflow =
Total Income - Total Expense
```

Transfer does not count as expense.

---

## Expense Rate

```text
Expense Rate =
Total Expense / Total Income × 100
```

If income is zero, the rate is treated as zero by the backend calculation.

---

## Savings Movement

```text
Net Savings Movement =
Savings Deposit - Savings Withdrawal
```

Positive value:

```text
More money entered savings.
```

Negative value:

```text
More money left savings.
```

---

## Budget Usage

```text
Budget Usage =
Actual Expense / Budget Amount × 100
```

Budget classification used by the application includes:

```text
Healthy
Warning
Over Budget
```

with the backend/reporting logic using the percentage of actual spending against the configured budget.

---

## Liquidity

AI Financial Analyst uses total account balance as one of its inputs for liquidity analysis.

Conceptually:

```text
Liquidity Coverage =
Total Account Balance / Monthly Expense
```

The backend health score considers coverage levels when calculating the liquidity component.

---

# ❤️ Financial Health Scoring Details

The backend deterministic health score uses five components.

## 1. Cashflow — 25 points

Higher positive cashflow margin receives a higher score.

```text
Cashflow Margin =
Net Cashflow / Total Income × 100
```

---

## 2. Expense Control — 20 points

Lower expense rate receives a higher score.

```text
Expense Rate =
Total Expense / Total Income × 100
```

---

## 3. Saving Rate — 25 points

Higher positive savings rate receives a higher score.

The AI endpoint uses net positive savings movement relative to income when calculating the saving-rate component.

---

## 4. Budget Discipline — 15 points

Budget performance is evaluated from:

```text
Healthy budgets
Warning budgets
Over-budget budgets
```

Having no configured budget is handled separately rather than being treated as perfect budget discipline.

---

## 5. Liquidity — 15 points

Liquidity considers:

```text
Total Account Balance
Monthly Expense
```

Higher expense coverage results in a stronger liquidity score.

---

# 📊 Reports

Reports provide a broader view of the selected financial period.

Available analysis includes:

- Total income
- Total expense
- Net cashflow
- Expense rate
- Savings activity
- Account balance
- Income vs expense comparison
- Category expense analysis
- Budget progress
- Financial health
- Savings summary
- Target progress
- Monthly deposit activity
- Monthly withdrawal activity

Reports and AI Analyst serve different purposes:

```text
Reports
  ↓
Visualize and summarize financial data

AI Analyst
  ↓
Interpret financial data and provide structured insights
```

---

# 🐷 Savings Rules

## Opening Balance

An initial saving balance is treated as the starting balance of the saving.

It should not be interpreted as:

```text
Income
Expense
Monthly deposit activity
```

---

## Deposit

Deposit increases the saving balance.

```text
SavingsTransaction
type = deposit
```

---

## Withdrawal

Withdrawal decreases the saving balance.

```text
SavingsTransaction
type = withdrawal
```

A withdrawal cannot exceed the available saving balance.

When withdrawal transfers funds back to an account, the related main transaction can use:

```text
type = transfer
```

rather than `income`.

---

# 🎨 Frontend Preferences

The UI supports:

### Theme

```text
light
dark
system
```

### Accent

```text
blue
purple
green
orange
red
pink
```

Preferences are persisted so the selected UI configuration can survive page reloads.

---

# 🧭 Navigation

The application contains dedicated areas for:

```text
Dashboard
Pemasukan
Pengeluaran
Budget
Accounts
Categories
Savings
Reports
AI Analyst (BETA)
Settings
```

AI Analyst is intentionally separated from Reports to provide a dedicated analysis experience.

---

# 📦 Dependencies

## Frontend

Core dependencies:

```text
vue
vite
vue-router
pinia
axios
bootstrap
bootstrap-icons
```

## Backend

Core dependencies:

```text
express
sequelize
mysql2
jsonwebtoken
bcryptjs
cors
dotenv
```

## AI

```text
@google/genai
```

---

# 🔒 Security

Before making the repository public:

- Never commit JWT tokens.
- Never commit Gemini API keys.
- Never commit database passwords.
- Never commit `.env` files.
- Never hard-code production credentials.
- Use environment variables for secrets.
- Use a strong random `JWT_SECRET`.
- Rotate credentials that were previously exposed.
- Keep Gemini API keys on the backend.
- Do not expose Gemini API keys in frontend code.
- Review CORS configuration for production.
- Use HTTPS in production.
- Restrict database access in production.
- Consider API rate limiting before production deployment.
- Avoid returning internal error details outside development.

Recommended `.gitignore`:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
*.log
```

---

# 🧰 Development Notes

## Backend

The backend is CommonJS-based and uses Sequelize for database access.

Database connection is verified during server startup.

Expected development API:

```text
http://localhost:3000
```

---

## Frontend

The frontend uses Vue 3 with Vite.

Axios is used for API communication.

Authenticated API requests use:

```text
monthly_budget_token
```

from local browser storage and send it as a Bearer token.

---

# 🧪 Testing Checklist

Before considering a development build ready:

### Authentication

- [ ] Register works
- [ ] Login works
- [ ] Invalid credentials are rejected
- [ ] Protected route redirects unauthenticated users
- [ ] Profile update works
- [ ] Password change works
- [ ] Logout works

### Income

- [ ] Create income
- [ ] Edit income
- [ ] Delete income
- [ ] Income appears on dashboard
- [ ] Income is associated with correct account/category

### Expense

- [ ] Create expense
- [ ] Edit expense
- [ ] Delete expense
- [ ] Expense affects account balance
- [ ] Expense appears in category analysis

### Budget

- [ ] Create budget
- [ ] Update budget
- [ ] Delete budget
- [ ] Budget percentage is correct
- [ ] Over-budget state is detected

### Savings

- [ ] Create target saving
- [ ] Create free saving
- [ ] Update saving
- [ ] Delete saving
- [ ] Opening balance works
- [ ] Deposit works
- [ ] Withdrawal works
- [ ] Withdrawal cannot exceed balance
- [ ] Transaction history works
- [ ] Routine saving validation works
- [ ] Target progress works

### Notifications

- [ ] Notifications appear after supported activities
- [ ] Unread count works
- [ ] Mark as read works
- [ ] Mark all as read works

### Reports

- [ ] Month selection works
- [ ] Income/expense summary works
- [ ] Category analysis works
- [ ] Budget analysis works
- [ ] Savings analysis works
- [ ] Financial health works

### AI Analyst

- [ ] AI endpoint requires authentication
- [ ] Selected month is respected
- [ ] Financial health score is deterministic
- [ ] Transfer is not treated as expense
- [ ] Savings deposit is not treated as expense
- [ ] Savings withdrawal is not treated as income
- [ ] Gemini response follows the structured schema
- [ ] AI does not invent unsupported financial data
- [ ] API key stays on backend

---

# 🛣️ Roadmap

Potential future improvements:

- 📊 Advanced financial forecasting
- 🤖 More detailed AI trend analysis
- 🎯 AI-assisted savings target planning
- 🔁 Recurring income and expense
- 🔁 Automated recurring transactions
- 💳 Debt management
- 🚨 Advanced budget alerts
- 📅 Automated monthly financial summaries
- 📄 PDF financial reports
- 📊 Advanced Excel export
- 🧾 Better transaction import/export
- 🔎 Advanced report filtering
- 🔔 Notification filtering and history
- 👨‍💼 Admin dashboard
- 👥 User/account administration
- 🧾 Audit logs
- 💾 Automated database backups
- 🐳 Docker deployment
- 🚀 Production deployment configuration
- 🛡️ API rate limiting
- 🧪 Automated backend/frontend tests
- 🗃️ Database migration system

---

# 📌 Status

**Active Development**

Current feature status:

```text
Authentication        ✅
Dashboard             ✅
Income                ✅
Expense               ✅
Accounts              ✅
Categories            ✅
Monthly Budget        ✅
Savings               ✅
Target Savings        ✅
Free Savings          ✅
Opening Balance       ✅
Savings Deposit       ✅
Savings Withdrawal    ✅
Savings History       ✅
Routine Savings       ✅
Notifications         ✅
Reports               ✅
Financial Health      ✅
Themes                ✅
Accent Colors         ✅
Responsive UI         ✅
Collapsible Sidebar   ✅
Custom 404            ✅
AI Financial Analyst  ✅ BETA
```

---

# ☕ Project

Monthly Budget is built as a practical full-stack personal finance application with a focus on:

```text
Simple data entry
       ↓
Accurate financial calculations
       ↓
Useful reports
       ↓
Actionable financial insights
```

Built with:

```text
Vue 3
Node.js
Express
Sequelize
MySQL/MariaDB
Gemini AI
```

and a lot of debugging, coffee, and `console.log()`. ☕🔥

---

# 📄 License

Add your preferred license here.

For example:

```text
MIT License
```

if the project is intended to use MIT licensing.

---

# 👨‍💻 Author

**Mola**

Monthly Budget — Personal Finance Management System.

> Manage money. Understand your habits. Build better financial decisions.
