# WealthWise - Complete Feature Documentation

### Personal Finance Management Application

---

## Table of Contents

1. [User Authentication](#1-user-authentication)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Bank Account Management](#3-bank-account-management)
4. [Transaction Management](#4-transaction-management)
5. [Category & Budget Management](#5-category--budget-management)
6. [Financial Goals](#6-financial-goals)
7. [Recurring Expenses](#7-recurring-expenses)
8. [Debt Tracking](#8-debt-tracking)
9. [Reports & Export](#9-reports--export)
10. [Theme & UI Features](#10-theme--ui-features)

---

## 1. User Authentication

### 1.1 User Registration Flow

**UI Location:** Landing Page → "Get Started" or "Sign Up" button

**Frontend Flow:**

1. User clicks "Sign Up" on Landing Page
2. `RegisterModal` component opens
3. User fills: Name, Email, Password, Confirm Password
4. Frontend validates:
   - Email format
   - Password strength (8+ chars, uppercase, lowercase, number, special char)
   - Password match
5. On submit, calls `axios.post('/api/auth/register')`

**Backend Flow:**

```
routes/auth.js → POST /register
    ↓
authController.register()
    ↓
1. Check if email already exists in User collection
2. Hash password using bcrypt (10 salt rounds)
3. Create new User document in MongoDB
4. Generate JWT token (expires in 30 days)
5. Return { success: true, token, user }
```

**Data Stored:**

```javascript
{
  _id: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  password: "$2b$10$...", // bcrypt hash
  createdAt: Date
}
```

---

### 1.2 User Login Flow

**UI Location:** Landing Page → "Sign In" button

**Frontend Flow:**

1. User clicks "Sign In"
2. `LoginModal` opens
3. User enters Email & Password
4. Calls `axios.post('/api/auth/login')`
5. On success:
   - Token stored in `AuthContext`
   - Token saved to `localStorage`
   - User redirected to `/dashboard`

**Backend Flow:**

```
routes/auth.js → POST /login
    ↓
authController.login()
    ↓
1. Find user by email
2. Compare password with bcrypt.compare()
3. If valid, generate JWT with user ID
4. Return { success: true, token, user }
```

**Token Structure:**

```javascript
JWT.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });
```

---

### 1.3 Authentication Middleware

**How Protected Routes Work:**

Every API request (except login/register) goes through:

```
Request with Header: "Authorization: Bearer <token>"
    ↓
middleware/auth.js → protect()
    ↓
1. Extract token from header
2. Verify token with jwt.verify()
3. Decode user ID from token
4. Fetch user from database
5. Attach user to req.user
6. Call next() to proceed
```

**Frontend Axios Interceptor:**

```javascript
// AuthContext.jsx sets up interceptor
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 2. Dashboard Overview

### 2.1 Dashboard Data Loading

**UI Location:** `/dashboard` (DashboardHome.jsx)

**On Page Load - Multiple API Calls:**

```javascript
Promise.all([
  getDashboardSummary(), // Summary cards
  getByCategory({ type: "expense" }), // Pie chart
  getByCategory({ type: "income" }), // Income breakdown
  getTransactions({ limit: 5 }), // Recent transactions
  getCategorySummary(), // Budget alerts
  getByDate({ period: "month" }), // Daily trend
  getAccounts(), // Account list
  getTransactions({ period: "month" }), // For per-account summary
]);
```

---

### 2.2 Summary Cards (Income/Expense/Balance)

**What They Show:**

- **Total Income (This Month):** Sum of all income transactions this month
- **Total Expense (This Month):** Sum of all expense transactions this month
- **Total Balance:** Sum of all account balances

**Backend Calculation (dashboardController.getSummary):**

```javascript
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const userId = new mongoose.Types.ObjectId(req.user.id);

// Aggregate transactions for this month
const monthlyData = await Transaction.aggregate([
  { $match: { user: userId, date: { $gte: startOfMonth } } },
  { $group: { _id: "$type", total: { $sum: "$amount" } } },
]);
```

**Per-Account Breakdown:**

- Clicking expand arrow shows income/expense per account
- Calculated on frontend by filtering transactions by account

---

### 2.3 Budget Alerts

**What It Shows:** Categories where spending > 80% of budget limit

**How It Works:**

1. Frontend calls `getCategorySummary()`
2. Backend aggregates spending per category for current month
3. Compares with `budgetLimit` field on Category model
4. Frontend filters categories where `percentage >= 80`
5. Displays as amber (warning) or red (over budget) alerts

---

### 2.4 Expense Pie Chart

**Data Source:** `/api/dashboard/by-category?type=expense&period=month`

**Backend Aggregation:**

```javascript
await Transaction.aggregate([
  { $match: { user: userId, type: "expense", date: { $gte: startDate } } },
  { $group: { _id: "$category", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } },
]);
```

**Frontend Rendering:** Uses Recharts `PieChart` component with custom colors per category

---

### 2.5 Daily Spending Trend Chart

**Data Source:** `/api/dashboard/by-date?period=month`

**Shows:** Bar chart of daily expenses for the current month

**User Can Filter By:**

- Time period (Week/Month/Year)
- Category
- Account
- Transaction type (Expense/Income)

---

## 3. Bank Account Management

### 3.1 Adding a Bank Account

**UI Location:** `/dashboard/accounts` → "Link Bank Account"

**Flow:**

1. User clicks "Link Bank Account"
2. Dialog shows list of available banks (simulated)
3. User selects bank and enters account number
4. Calls `linkBankAccount(bankName, accountNumber)`

**Backend Flow:**

```
POST /api/accounts/link-bank
    ↓
accountController.linkBankAccount()
    ↓
1. Simulate bank lookup (bankSimulator.js)
2. Create Account document:
   {
     user: userId,
     name: "State Bank of India - ****1234",
     type: "bank",
     balance: 0,
     bankName: "State Bank of India",
     accountNumber: "****1234",
     isLinked: true
   }
3. Generate 100 dummy transactions spanning 1 year
4. Insert transactions with random dates/amounts
5. Update account balance based on transactions
```

**Dummy Transaction Generation (bankSimulator.js):**

- 30% income transactions (Salary, Freelance, Interest)
- 70% expense transactions (Food, Transport, Shopping, etc.)
- Random amounts based on category
- 30% chance for transactions in current month (so dashboard shows data)

---

### 3.2 Account Balance Updates

**Automatic Updates:**

- Creating transaction → Updates account balance
- Deleting transaction → Reverses balance change
- Adding to goal → Creates expense, updates balance

**Manual Update:**

- User can edit balance directly on Accounts page
- Calls `updateAccountBalance(id, newBalance)`

---

## 4. Transaction Management

### 4.1 Creating a Transaction

**UI Location:**

- Floating Action Button (FAB) → Quick Add
- `/dashboard/transactions` → "Add Transaction"

**Frontend Form Fields:**

- Account (dropdown)
- Type (Income/Expense)
- Amount
- Category (filtered by type)
- Payee
- Description
- Date/Time

**Backend Flow:**

```
POST /api/transactions
    ↓
transactionController.createTransaction()
    ↓
1. Validate required fields
2. Create Transaction document
3. Update Account balance:
   - Income: balance += amount
   - Expense: balance -= amount
4. Return created transaction
```

---

### 4.2 Editing a Transaction

**Flow:**

1. User clicks edit icon on transaction
2. Dialog opens with current values
3. User modifies and submits
4. Backend:
   - Reverses old balance change
   - Applies new balance change
   - Updates transaction document

---

### 4.3 Deleting a Transaction

**Flow:**

```
DELETE /api/transactions/:id
    ↓
1. Find transaction
2. Reverse balance change on account
3. If transaction has linkedDebtTransaction:
   - Delete the linked debt transaction too
4. Delete the transaction
```

---

### 4.4 Transaction Filters

**Available Filters:**

- Date range (From/To)
- Category
- Account
- Transaction type (Income/Expense/All)
- Search by payee/description

**Backend Query Building:**

```javascript
const query = { user: req.user.id };
if (category) query.category = category;
if (type) query.type = type;
if (account) query.account = account;
if (startDate || endDate) {
  query.date = {};
  if (startDate) query.date.$gte = new Date(startDate);
  if (endDate) query.date.$lte = new Date(endDate);
}
```

---

## 5. Category & Budget Management

### 5.1 Creating a Category

**UI Location:** `/dashboard/budgets` → "Add Category"

**Form Fields:**

- Name
- Type (Income/Expense)
- Color (color picker)
- Budget Limit (optional)

**Backend:**

```
POST /api/categories
    ↓
categoryController.createCategory()
    ↓
1. Check if category name already exists for user
2. Create Category document:
   {
     user: userId,
     name: "Groceries",
     type: "expense",
     color: "#22c55e",
     budgetLimit: 10000
   }
```

---

### 5.2 Budget Tracking

**How It Works:**

1. Each category can have a `budgetLimit`
2. When viewing budgets page, backend calculates `currentSpent`:
   ```javascript
   const currentSpent = await Transaction.aggregate([
     {
       $match: {
         user: userId,
         category: cat.name,
         type: "expense",
         date: { $gte: startOfMonth },
       },
     },
     { $group: { _id: null, total: { $sum: "$amount" } } },
   ]);
   ```
3. Frontend displays progress bar: `(currentSpent / budgetLimit) * 100`

**Visual Indicators:**

- Green: < 80% used
- Amber: 80-99% used
- Red: 100%+ (over budget)

---

### 5.3 Category Icons

**Predefined Categories with MUI Icons:**
| Category | Icon |
|----------|------|
| Bills | Receipt |
| Food | Restaurant |
| Transport | DirectionsCar |
| Shopping | ShoppingBag |
| Entertainment | Movie |
| Health | LocalHospital |
| Education | School |
| Housing | Home |
| Travel | Flight |

**User-Defined Categories:** Show first letter as avatar

---

## 6. Financial Goals

### 6.1 Creating a Goal

**UI Location:** `/dashboard/goals` → "Create Goal"

**Form Fields:**

- Goal Name (e.g., "Emergency Fund")
- Target Amount
- Deadline
- Category

**Backend:**

```
POST /api/goals
    ↓
goalController.createGoal()
    ↓
Create Goal document:
{
  user: userId,
  name: "Emergency Fund",
  targetAmount: 100000,
  currentAmount: 0,
  deadline: "2026-12-31",
  status: "active"
}
```

---

### 6.2 Adding Money to Goal

**Flow:**

1. User clicks "Add Money" on goal card
2. Dialog asks for amount and source account
3. Backend creates an expense transaction:
   ```javascript
   const transaction = new Transaction({
     user: userId,
     account: accountId,
     type: "expense",
     amount: amount,
     category: "Savings",
     payee: `Goal: ${goal.name}`,
     description: `Contribution to goal: ${goal.name}`,
   });
   ```
4. Updates account balance (decreases)
5. Updates goal's currentAmount (increases)
6. If currentAmount >= targetAmount → status = "completed"

---

## 7. Recurring Expenses

### 7.1 Creating Recurring Expense

**UI Location:** `/dashboard/recurring` → "Add Recurring Expense"

**Form Fields:**

- Name (e.g., "Netflix Subscription")
- Amount
- Category
- Account
- Frequency (Daily/Weekly/Monthly/Yearly)
- Start Date

**Backend:**

```
POST /api/recurring-expenses
    ↓
Create RecurringExpense document:
{
  user: userId,
  name: "Netflix Subscription",
  amount: 499,
  category: "Entertainment",
  account: accountId,
  frequency: "monthly",
  nextDueDate: Date,
  isActive: true
}
```

---

### 7.2 Processing Recurring Expenses

**Manual Processing:**

- User clicks "Process Now" on a recurring expense
- Creates a transaction for that expense
- Updates `nextDueDate` based on frequency

**Processing Logic:**

```javascript
const transaction = new Transaction({
  user: expense.user,
  account: expense.account,
  type: "expense",
  amount: expense.amount,
  category: expense.category,
  payee: expense.name,
  description: `Recurring: ${expense.name}`,
  isRecurring: true,
});

// Update next due date
switch (expense.frequency) {
  case "daily":
    nextDue.setDate(nextDue.getDate() + 1);
    break;
  case "weekly":
    nextDue.setDate(nextDue.getDate() + 7);
    break;
  case "monthly":
    nextDue.setMonth(nextDue.getMonth() + 1);
    break;
  case "yearly":
    nextDue.setFullYear(nextDue.getFullYear() + 1);
    break;
}
```

---

## 8. Debt Tracking

### 8.1 Creating a Debt Person

**UI Location:** `/dashboard/debts` → "Add Person"

**Form Fields:**

- Person Name
- Initial Amount
- Type (I Owe Them / They Owe Me)
- Description

**Backend:**

```
POST /api/debts
    ↓
debtPersonController.createDebtPerson()
    ↓
Create DebtPerson document:
{
  user: userId,
  name: "John Doe",
  transactions: [{
    amount: 5000,
    type: "borrowed", // or "lent"
    description: "Lunch money",
    date: Date
  }]
}
```

---

### 8.2 Adding Debt Transaction

**Flow:**

1. User clicks "Add Transaction" on person card
2. Enters amount, description, and type (gave/received)
3. Backend:
   - Adds transaction to person's transactions array
   - Creates a main transaction (income or expense)
   - Links them bidirectionally

**Bidirectional Linking:**

```javascript
// Debt transaction stores reference to main transaction
debtTransaction.linkedMainTransaction = mainTransaction._id;

// Main transaction stores reference to debt transaction
mainTransaction.linkedDebtTransaction = debtTransaction._id;
```

**Auto-Delete:** Deleting either transaction deletes both

---

### 8.3 Balance Calculation

```javascript
// Virtual field on DebtPerson model
DebtPersonSchema.virtual("totalBalance").get(function () {
  return this.transactions.reduce((sum, t) => {
    if (t.type === "lent" || t.type === "gave") {
      return sum + t.amount; // They owe me
    } else {
      return sum - t.amount; // I owe them
    }
  }, 0);
});
```

---

## 9. Reports & Export

### 9.1 Export to Excel

**UI Location:** `/dashboard/profile` → Export section

**Flow:**

1. User selects format "Excel" and date range
2. Calls `exportToExcel({ startDate, endDate })`
3. Backend uses ExcelJS to create workbook:
   - Header row with styling
   - Transaction rows
   - Summary (Total Income, Total Expense, Net Balance)
4. Returns Excel file as blob
5. Frontend creates download link

---

### 9.2 Export to PDF

**Similar to Excel but uses PDFKit:**

- Creates PDF document
- Adds title and date
- Table with transactions
- Summary at bottom

---

### 9.3 Custom Spending Report (Advanced PDF)

**UI Location:** `/dashboard/profile` → Custom Reports section

**User Selects:**

- Report Type (Full/Summary/Category Analysis)
- Date Range (This Month/Last Month/Last 3 Months/Custom)

**PDF Contains:**

1. **Header Banner** - Green gradient with WealthWise branding

2. **Summary Cards** - Three colored boxes:

   - Total Income (green)
   - Total Expenses (red)
   - Net Savings (blue)

3. **Savings Rate Bar** - Progress bar with color coding:

   - Green: ≥20%
   - Amber: 10-19%
   - Red: <10%

4. **Category Breakdown Chart** - Horizontal bar chart showing:

   - Category name
   - Colored bar (proportional to amount)
   - Amount and percentage

5. **Top 5 Categories** - Ranked list with amounts

6. **Budget vs Actual** - For each budgeted category:

   - Progress bar
   - Status: OK / WARNING / OVER

7. **Monthly Trend Chart** - Vertical bar chart of monthly spending

8. **Key Insights** - Personalized tips based on data:
   - Savings rate feedback
   - Top spending category highlight

---

## 10. Theme & UI Features

### 10.1 Dark/Light Mode Toggle

**Storage:** `localStorage.getItem('themeMode')`

**Implementation:**

```javascript
// ThemeContext.jsx
const [mode, setMode] = useState(() => {
  return localStorage.getItem("themeMode") || "dark";
});

const toggleTheme = () => {
  const newMode = mode === "dark" ? "light" : "dark";
  setMode(newMode);
  localStorage.setItem("themeMode", newMode);
};
```

**Theme Application:**

- `theme.js` exports `lightTheme` and `darkTheme`
- `App.jsx` wraps with `<ThemeProvider theme={theme}>`

---

### 10.2 Glassmorphism Effect

**CSS Properties:**

```javascript
{
  background: "linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, ...)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderLeft: "4px solid #10b981",
  boxShadow: "0 4px 30px rgba(5, 150, 105, 0.12), inset 0 0 60px ..."
}
```

---

### 10.3 Sidebar Animation

**State Persistence:**

```javascript
const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
  return localStorage.getItem("sidebarCollapsed") === "true";
});

useEffect(() => {
  localStorage.setItem("sidebarCollapsed", sidebarCollapsed);
}, [sidebarCollapsed]);
```

**Smooth Animation:**

```javascript
// Drawer
transition: "width 0.3s ease-in-out"

// Text elements
opacity: sidebarCollapsed ? 0 : 1,
transition: "opacity 0.3s ease-in-out, width 0.3s ease-in-out"

// Main content
transition: "width 0.3s ease-in-out, margin 0.3s ease-in-out"
```

---

### 10.4 Toast Notifications

**Implementation:** Custom `ToastContext` with stacking support

**Usage:**

```javascript
const toast = useToast();
toast.success("Transaction created!");
toast.error("Failed to save");
toast.info("Processing...");
```

**Features:**

- Auto-dismiss after 3 seconds
- Stack multiple toasts
- Different colors for success/error/info/warning

---

### 10.5 Page-Specific Accent Colors

Each dashboard page has a unique accent color matching its sidebar icon:

| Page         | Color   | Hex     |
| ------------ | ------- | ------- |
| Dashboard    | Emerald | #10b981 |
| Transactions | Blue    | #3b82f6 |
| Budgets      | Purple  | #8b5cf6 |
| Accounts     | Blue    | #3b82f6 |
| Goals        | Pink    | #ec4899 |
| Recurring    | Teal    | #14b8a6 |
| Debts        | Orange  | #f97316 |
| Profile      | Indigo  | #6366f1 |

Applied as left border and gradient tint on cards.

---

## Quick Reference: API Endpoints

| Feature                | Method | Endpoint                              |
| ---------------------- | ------ | ------------------------------------- |
| Register               | POST   | `/api/auth/register`                  |
| Login                  | POST   | `/api/auth/login`                     |
| Get Accounts           | GET    | `/api/accounts`                       |
| Link Bank              | POST   | `/api/accounts/link-bank`             |
| Get Transactions       | GET    | `/api/transactions`                   |
| Create Transaction     | POST   | `/api/transactions`                   |
| Update Transaction     | PUT    | `/api/transactions/:id`               |
| Delete Transaction     | DELETE | `/api/transactions/:id`               |
| Get Categories         | GET    | `/api/categories`                     |
| Get Category Summary   | GET    | `/api/categories/summary`             |
| Get Dashboard Summary  | GET    | `/api/dashboard/summary`              |
| Get Goals              | GET    | `/api/goals`                          |
| Update Goal Progress   | PUT    | `/api/goals/:id/progress`             |
| Get Recurring Expenses | GET    | `/api/recurring-expenses`             |
| Process Recurring      | POST   | `/api/recurring-expenses/:id/process` |
| Get Debt Persons       | GET    | `/api/debts`                          |
| Add Debt Transaction   | POST   | `/api/debts/:id/transaction`          |
| Export Excel           | GET    | `/api/export/excel`                   |
| Export PDF             | GET    | `/api/export/pdf`                     |
| Spending Report        | GET    | `/api/export/spending-report`         |

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Application:** WealthWise Personal Finance Manager
