const { detectCategory } = require("./categoryDetector");

// Simulated bank names
const bankNames = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
];

// Sample merchants for generating realistic expense transactions
const expenseMerchants = [
  { name: "Swiggy", category: "Food" },
  { name: "Zomato", category: "Food" },
  { name: "Amazon", category: "Shopping" },
  { name: "Flipkart", category: "Shopping" },
  { name: "Uber", category: "Transport" },
  { name: "Ola", category: "Transport" },
  { name: "Netflix", category: "Entertainment" },
  { name: "Spotify", category: "Entertainment" },
  { name: "Reliance Fresh", category: "Food" },
  { name: "Big Bazaar", category: "Shopping" },
  { name: "Apollo Pharmacy", category: "Health" },
  { name: "Airtel", category: "Bills" },
  { name: "Jio", category: "Bills" },
  { name: "Electricity Board", category: "Bills" },
  { name: "Shell Petrol", category: "Transport" },
  { name: "HP Petrol", category: "Transport" },
  { name: "PVR Cinemas", category: "Entertainment" },
  { name: "Udemy", category: "Education" },
  { name: "Coursera", category: "Education" },
  { name: "Gym Membership", category: "Health" },
];

// Sample income sources for generating realistic income transactions
const incomeSources = [
  { name: "Salary Credit", category: "Salary" },
  { name: "Company Payroll", category: "Salary" },
  { name: "Freelance Payment", category: "Freelance" },
  { name: "Client Payment", category: "Freelance" },
  { name: "Interest Credit", category: "Interest" },
  { name: "Bank Interest", category: "Interest" },
  { name: "Amazon Refund", category: "Refund" },
  { name: "Flipkart Refund", category: "Refund" },
  { name: "Cashback Credit", category: "Cashback" },
  { name: "Dividend Credit", category: "Investment" },
  { name: "Rental Income", category: "Rental" },
  { name: "Bonus Credit", category: "Salary" },
];

// Generate random amount based on category and transaction type
const getRandomAmount = (category, type = "expense") => {
  if (type === "income") {
    const incomeRanges = {
      Salary: { min: 30000, max: 100000 },
      Freelance: { min: 5000, max: 50000 },
      Interest: { min: 100, max: 2000 },
      Refund: { min: 200, max: 5000 },
      Cashback: { min: 50, max: 500 },
      Investment: { min: 1000, max: 10000 },
      Rental: { min: 10000, max: 30000 },
    };
    const range = incomeRanges[category] || { min: 1000, max: 10000 };
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  const expenseRanges = {
    Food: { min: 100, max: 2000 },
    Transport: { min: 50, max: 1500 },
    Shopping: { min: 200, max: 10000 },
    Bills: { min: 500, max: 5000 },
    Entertainment: { min: 100, max: 2000 },
    Health: { min: 200, max: 5000 },
    Education: { min: 500, max: 15000 },
    Other: { min: 100, max: 3000 },
  };

  const range = expenseRanges[category] || expenseRanges.Other;
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
};

// Generate random date within specified days (default 365 days = 1 year)
// Ensures some transactions are in the current month for demo purposes
const getRandomDate = (daysSpan = 365, includeRecent = true) => {
  const now = new Date();

  // 30% chance to get a date within the last 30 days (current month bias)
  if (includeRecent && Math.random() < 0.3) {
    const daysAgo = Math.floor(Math.random() * 30); // Within last 30 days
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  }

  const daysAgo = Math.floor(Math.random() * daysSpan);
  return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
};

// Simulate bank account lookup
const simulateBankLookup = (accountNumber) => {
  // Simulate that any account number works (for demo purposes)
  const bankIndex =
    Math.abs(
      accountNumber.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % bankNames.length;

  return {
    found: true,
    bankName: bankNames[bankIndex],
    accountNumber: accountNumber,
    accountHolder: "Account Holder",
  };
};

// Generate dummy transactions with both income and expense types
// Options: count (default 100), daysSpan (default 365), userCategories (optional array)
const generateTransactions = (count = 100, options = {}) => {
  const { daysSpan = 365, userCategories = [] } = options;
  const transactions = [];

  // Determine expense categories to use
  const defaultExpenseCategories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Other",
  ];
  const expenseCategories = userCategories
    .filter((c) => c.type === "expense")
    .map((c) => c.name);
  const finalExpenseCategories =
    expenseCategories.length > 0 ? expenseCategories : defaultExpenseCategories;

  // Determine income categories to use
  const defaultIncomeCategories = [
    "Salary",
    "Freelance",
    "Interest",
    "Investment",
    "Other",
  ];
  const incomeCategories = userCategories
    .filter((c) => c.type === "income")
    .map((c) => c.name);
  const finalIncomeCategories =
    incomeCategories.length > 0 ? incomeCategories : defaultIncomeCategories;

  // Generate ~30% income transactions and ~70% expense transactions
  const incomeCount = Math.floor(count * 0.3);
  const expenseCount = count - incomeCount;

  // Generate income transactions
  for (let i = 0; i < incomeCount; i++) {
    const category =
      finalIncomeCategories[
        Math.floor(Math.random() * finalIncomeCategories.length)
      ];
    const incomeSource =
      incomeSources.find((s) => s.category === category) ||
      incomeSources[Math.floor(Math.random() * incomeSources.length)];

    transactions.push({
      type: "income",
      amount: getRandomAmount(category, "income"),
      payee: incomeSource.name,
      category: category,
      description: `${incomeSource.name}`,
      date: getRandomDate(daysSpan),
      source: "bank",
    });
  }

  // Generate expense transactions
  for (let i = 0; i < expenseCount; i++) {
    const category =
      finalExpenseCategories[
        Math.floor(Math.random() * finalExpenseCategories.length)
      ];
    const merchantInfo =
      expenseMerchants.find((m) => m.category === category) ||
      expenseMerchants[Math.floor(Math.random() * expenseMerchants.length)];

    transactions.push({
      type: "expense",
      amount: getRandomAmount(category, "expense"),
      payee: merchantInfo.name,
      category: category,
      description: `Payment to ${merchantInfo.name}`,
      date: getRandomDate(daysSpan),
      source: "bank",
    });
  }

  // Sort by date descending
  return transactions.sort((a, b) => b.date - a.date);
};

module.exports = {
  simulateBankLookup,
  generateTransactions,
};
