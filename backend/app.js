const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const connectDB = require("./config/db");
const swaggerSpec = require("./swagger/swagger");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "WealthWise API Docs",
    customCss: ".swagger-ui .topbar { display: none }",
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/accounts", require("./routes/accounts"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/budgets", require("./routes/budgets"));
app.use("/api/goals", require("./routes/goals"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/export", require("./routes/export"));
app.use("/api/recurring-expenses", require("./routes/recurringExpenses"));
app.use("/api/debts", require("./routes/debts"));
app.use("/api/changelog", require("./routes/changelog"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/bank", require("./routes/bank"));

// Welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to WealthWise API v2.1",
    version: "2.1.0",
    features: [
      "Income & Expense tracking",
      "Multiple bank accounts",
      "Account balances",
      "Dynamic user-defined categories",
      "Budget limits with spending alerts",
      "Financial goals with expense linking",
      "Recurring expenses",
      "Debt tracking",
      "Change tracking for sync",
    ],
    documentation: "/api-docs",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚀 WealthWise Server v2.0 Running!                      ║
  ║                                                           ║
  ║   📍 Server:  http://localhost:${PORT}                       ║
  ║   📚 API Docs: http://localhost:${PORT}/api-docs             ║
  ║                                                           ║
  ║   ✨ New Features:                                        ║
  ║      • Income + Expense transactions                      ║
  ║      • Multiple bank accounts                             ║
  ║      • Optimized budget tracking                          ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
