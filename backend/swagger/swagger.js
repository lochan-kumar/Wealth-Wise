const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WealthWise API",
      version: "2.0.0",
      description:
        "WealthWise - Daily expense management with income/expense tracking, multiple accounts, and budget alerts",
      contact: {
        name: "Team 10",
        email: "team10@wealthwise.com",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token obtained from login",
        },
      },
    },
    tags: [
      { name: "Authentication", description: "User registration and login" },
      { name: "Accounts", description: "Cash and bank account management" },
      { name: "Transactions", description: "Income and expense transactions" },
      { name: "Budgets", description: "Budget management with alerts" },
      { name: "Goals", description: "Financial goal tracking" },
      { name: "Dashboard", description: "Analytics and charts data" },
      { name: "Export", description: "Export data to Excel/PDF" },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
