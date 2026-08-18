# Monthly Budget

> Modern full-stack personal finance management for income, expenses, budgets, accounts, categories, reports, notifications, and user preferences.

## ✨ Features

- 🔐 **Authentication** — JWT login/logout, protected routes, automatic redirect when unauthenticated.
- 📊 **Dashboard** — financial overview and income/expense summary.
- 💰 **Income** — create, view, update, and delete income records.
- 💸 **Expense** — create, view, update, and delete expense records.
- 🎯 **Budget** — monthly category budgets with amount and period validation.
- 🏦 **Accounts** — create, view, update, and delete financial accounts.
- 🏷️ **Categories** — income/expense categories with icons and colors; full CRUD.
- 🔔 **Notifications** — activity notifications, unread counter, read/unread state, and notification center.
- ⚙️ **Settings** — profile, password/account settings, theme, and accent preferences.
- 🌓 **Themes** — light, dark, and system preference with persistence.
- 🎨 **Accent Colors** — blue, purple, green, orange, red, and pink.
- 📈 **Reports & Analytics** — financial reporting and income/expense analysis.
- 🧭 **UX** — collapsible sidebar, responsive layout, live clock, active navigation, and user display.
- 🚫 **Custom 404** — dedicated not-found page for invalid routes.

### Notification Events

Examples include:

- `Profile berhasil diperbarui`
- `Password berhasil diubah`
- `Income Rp500.000 ditambahkan`
- `Expense Rp75.000 dicatat`
- `Budget baru berhasil dibuat`
- `Account baru ditambahkan`

## 🧱 Tech Stack

**Frontend:** Vue 3, Vite, Vue Router, Pinia, Axios, Bootstrap 5, Bootstrap Icons

**Backend:** Node.js, Express 5, Sequelize, MySQL/MariaDB, JWT, bcrypt/bcryptjs, CORS, dotenv

## 📁 Structure

```text
monthly-budget/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── router/
│   │   ├── services/
│   │   ├── stores/
│   │   └── App.vue
│   └── package.json
├── package.json
└── README.md
```

## 🚀 Run

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

Run backend + frontend together:

```bash
npm run dev
```

Run separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Build frontend:

```bash
npm run build
```

## 🔌 API

### Authentication & Profile

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current authenticated user |
| GET | `/api/auth/profile` | Get profile |
| PUT/PATCH | `/api/auth/profile` | Update profile |
| PUT/PATCH | `/api/auth/password` | Change password |
| POST | `/api/auth/logout` | Logout |

### Accounts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/accounts` | List accounts |
| POST | `/api/accounts` | Create account |
| PUT | `/api/accounts/:id` | Update account |
| DELETE | `/api/accounts/:id` | Delete account |

### Categories

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Income

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/incomes` | List income |
| POST | `/api/incomes` | Create income |
| GET | `/api/incomes/:id` | Get income |
| PUT | `/api/incomes/:id` | Update income |
| DELETE | `/api/incomes/:id` | Delete income |

### Expense

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/expenses` | List expense |
| POST | `/api/expenses` | Create expense |
| GET | `/api/expenses/:id` | Get expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Budgets

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/budgets` | List budgets |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/:id` | Update budget |
| DELETE | `/api/budgets/:id` | Delete budget |

### Notifications

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

> Keep this API table synchronized with the current backend source before publishing public API documentation.

## 🔑 Authentication

Protected requests use:

```http
Authorization: Bearer <TOKEN>
```

Example:

```bash
export TOKEN_USER4="YOUR_TOKEN"

curl -s http://localhost:3000/api/notifications   -H "Authorization: Bearer $TOKEN_USER4"
```

## 🗄️ Data Models

- User
- Account
- Category
- Transaction
- MonthlyBudget

## 🔒 Security

Before making the repository public:

- Never commit JWT tokens.
- Never commit `.env` files.
- Never hard-code database credentials.
- Use environment variables for secrets.
- Rotate credentials that were previously exposed.
- Review CORS for production.
- Use HTTPS in production.

## 🛣️ Roadmap

- Admin Dashboard
- User/account administration
- Advanced analytics
- Extended reports
- Data export
- Notification history and filtering
- Production deployment configuration

## 📌 Status

**Active development**

Made with Vue, Node.js, Express, Sequelize, and a lot of caffeine. ☕
