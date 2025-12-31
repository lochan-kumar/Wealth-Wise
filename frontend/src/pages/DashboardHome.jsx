import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Button,
  Chip,
  Collapse,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  Avatar,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  ExpandMore,
  ExpandLess,
  Receipt,
  Restaurant,
  DirectionsCar,
  ShoppingBag,
  Movie,
  LocalHospital,
  School,
  MoreHoriz,
  Home,
  Flight,
  Checkroom,
  FitnessCenter,
  Pets,
  CardGiftcard,
  AttachMoney,
  Work,
  Savings,
  Flag,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  getDashboardSummary,
  getByCategory,
  getTransactions,
  getCategorySummary,
  getByDate,
  getAccounts,
} from "../services/api";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c43",
];

// Mapping of predefined category names to MUI icons
const categoryIcons = {
  Bills: Receipt,
  Food: Restaurant,
  Transport: DirectionsCar,
  Shopping: ShoppingBag,
  Entertainment: Movie,
  Health: LocalHospital,
  Education: School,
  Other: MoreHoriz,
  Housing: Home,
  Travel: Flight,
  Clothing: Checkroom,
  Fitness: FitnessCenter,
  Pets: Pets,
  Gifts: CardGiftcard,
  Income: AttachMoney,
  Salary: Work,
  Savings: Savings,
  Goals: Flag,
};

// Get icon component for a category
const getCategoryIcon = (categoryName) => {
  return categoryIcons[categoryName] || null;
};

const DashboardHome = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [accountSummary, setAccountSummary] = useState({});
  const [expandedCards, setExpandedCards] = useState({});

  // Daily Spending Trend Filters
  const [trendPeriod, setTrendPeriod] = useState("month");
  const [trendCategory, setTrendCategory] = useState("all");
  const [trendAccount, setTrendAccount] = useState("all");
  const [trendType, setTrendType] = useState("expense");
  const [trendLoading, setTrendLoading] = useState(false);

  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Salary",
    "Investment",
    "Other",
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        summaryRes,
        categoryRes,
        incomeCatRes,
        transactionsRes,
        categorySummaryRes,
        dailyRes,
        accountsRes,
        allTransactionsRes,
      ] = await Promise.all([
        getDashboardSummary(),
        getByCategory({ type: "expense", period: "month" }),
        getByCategory({ type: "income", period: "month" }),
        getTransactions({ limit: 5 }),
        getCategorySummary(),
        getByDate({ period: "month" }),
        getAccounts(),
        getTransactions({ period: "month", limit: 1000 }),
      ]);

      setSummary(summaryRes.data.data);
      setCategoryData(
        categoryRes.data.data.map((item) => ({
          name: item._id,
          value: item.total,
        }))
      );
      setIncomeData(
        incomeCatRes.data.data.map((item) => ({
          name: item._id,
          value: item.total,
        }))
      );
      // Transform daily data: filter for expenses and restructure for chart
      const rawDailyData = dailyRes.data.data || [];
      const transformedDaily = rawDailyData
        .filter((item) => item._id.type === "expense")
        .map((item) => ({
          _id: item._id.date,
          total: item.total,
        }))
        .sort((a, b) => a._id.localeCompare(b._id));
      setDailyData(transformedDaily);
      setRecentTransactions(transactionsRes.data.data.slice(0, 5));

      // Transform category summary for budget display - filter only categories with budgetLimit
      const categoryData = categorySummaryRes.data.data || [];
      const budgetsWithLimits = categoryData
        .filter((cat) => cat.budgetLimit && cat.budgetLimit > 0)
        .map((cat) => ({
          _id: cat._id,
          category: cat.name,
          limit: cat.budgetLimit,
          currentSpent: cat.currentSpent || 0,
          percentage: cat.percentage || 0,
          isOverBudget: cat.isOverBudget || false,
          isNearLimit: cat.percentage >= 80,
        }));
      console.log("Budget data from categories:", budgetsWithLimits);
      setBudgetData(budgetsWithLimits);
      setBudgetAlerts(
        budgetsWithLimits.filter((b) => b.isNearLimit || b.isOverBudget)
      );

      // Set accounts
      const accountsList = accountsRes.data.data || [];
      setAccounts(accountsList);

      // Calculate per-account summary
      const allTx = allTransactionsRes.data.data || [];
      const accSummary = {};
      accountsList.forEach((acc) => {
        const accTransactions = allTx.filter(
          (tx) => tx.account === acc._id || tx.account?._id === acc._id
        );
        const income = accTransactions
          .filter((tx) => tx.type === "income")
          .reduce((sum, tx) => sum + tx.amount, 0);
        const expense = accTransactions
          .filter((tx) => tx.type === "expense")
          .reduce((sum, tx) => sum + tx.amount, 0);
        accSummary[acc._id] = {
          name: acc.name,
          income,
          expense,
          net: acc.balance || 0, // Use actual account balance
        };
      });
      setAccountSummary(accSummary);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardExpand = (cardType) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardType]: !prev[cardType],
    }));
  };

  // Fetch filtered trend data
  const fetchFilteredTrendData = async () => {
    setTrendLoading(true);
    try {
      const params = { period: trendPeriod };
      if (trendCategory !== "all") params.category = trendCategory;
      if (trendAccount !== "all") params.account = trendAccount;

      const dailyRes = await getByDate(params);
      const rawDailyData = dailyRes.data.data || [];

      // Filter by type and transform
      const transformedDaily = rawDailyData
        .filter((item) => item._id.type === trendType)
        .map((item) => ({
          _id: item._id.date,
          total: item.total,
        }))
        .sort((a, b) => a._id.localeCompare(b._id));

      setDailyData(transformedDaily);
    } catch (error) {
      console.error("Error fetching trend data:", error);
    } finally {
      setTrendLoading(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    if (!loading) {
      fetchFilteredTrendData();
    }
  }, [trendPeriod, trendCategory, trendAccount, trendType]);

  const SummaryCard = ({ title, amount, icon, color, cardType, dataKey }) => {
    const isExpanded = expandedCards[cardType] || false;
    const hasAccounts = accounts.length > 0;

    // Create gradient based on color
    const gradientBg = `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`;

    return (
      <Card
        sx={{
          width: "100%",
          background: gradientBg,
          borderLeft: `4px solid ${color}`,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: `0 8px 25px ${color}25`,
          },
        }}
      >
        <CardContent sx={{ pb: isExpanded ? 1 : 2, pt: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{
                  mb: 1,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: 0.5,
                }}
              >
                {title}
              </Typography>
              {loading ? (
                <Skeleton width={120} height={48} />
              ) : (
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color,
                    letterSpacing: "-1px",
                    fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                  }}
                >
                  ₹{amount?.toLocaleString() || 0}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${color}30 0%, ${color}15 100%)`,
                  color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 12px ${color}20`,
                }}
              >
                {icon}
              </Box>
              {hasAccounts && !loading && (
                <IconButton
                  size="small"
                  onClick={() => handleCardExpand(cardType)}
                  sx={{
                    color: "text.secondary",
                    bgcolor: "action.hover",
                    "&:hover": { bgcolor: `${color}20` },
                  }}
                >
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              )}
            </Box>
          </Box>
        </CardContent>
        <Collapse in={isExpanded}>
          <Divider sx={{ borderColor: `${color}20` }} />
          <Box sx={{ px: 2, py: 2, bgcolor: `${color}05` }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mb: 1.5,
                display: "block",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              By Account
            </Typography>
            {accounts.map((acc) => {
              const accData = accountSummary[acc._id];
              const value = accData ? accData[dataKey] : 0;
              return (
                <Box
                  key={acc._id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                    px: 1.5,
                    mb: 0.5,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:last-child": { mb: 0 },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {acc.name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color }}>
                    ₹{Math.abs(value).toLocaleString()}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Collapse>
      </Card>
    );
  };

  return (
    <Box>
      {/* Summary Cards */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          mb: 4,
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ flex: 1, width: "100%" }}>
          <SummaryCard
            title="Total Income (This Month)"
            amount={summary?.thisMonth?.totalIncome}
            icon={<TrendingUp />}
            color="#2e7d32"
            cardType="income"
            dataKey="income"
          />
        </Box>
        <Box sx={{ flex: 1, width: "100%" }}>
          <SummaryCard
            title="Total Expense (This Month)"
            amount={summary?.thisMonth?.totalExpense}
            icon={<TrendingDown />}
            color="#d32f2f"
            cardType="expense"
            dataKey="expense"
          />
        </Box>
        <Box sx={{ flex: 1, width: "100%" }}>
          <SummaryCard
            title="Net Balance"
            amount={summary?.thisMonth?.netBalance}
            icon={<AccountBalance />}
            color="#1976d2"
            cardType="net"
            dataKey="net"
          />
        </Box>
      </Box>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <Card
          sx={{
            mb: 4,
            background:
              "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderLeft: "4px solid #f59e0b",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(90deg, rgba(245, 158, 11, 0.1) 0%, transparent 50%)",
              pointerEvents: "none",
            },
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "rgba(245, 158, 11, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": { boxShadow: "0 0 0 0 rgba(245, 158, 11, 0.4)" },
                    "70%": { boxShadow: "0 0 0 10px rgba(245, 158, 11, 0)" },
                    "100%": { boxShadow: "0 0 0 0 rgba(245, 158, 11, 0)" },
                  },
                }}
              >
                <Typography sx={{ fontSize: 20 }}>⚠️</Typography>
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: isDark ? "#f59e0b" : "#b45309",
                  }}
                >
                  Budget Alerts
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: isDark ? "#fbbf24" : "#92400e" }}
                >
                  {budgetAlerts.length} categor
                  {budgetAlerts.length === 1 ? "y" : "ies"} need attention
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {budgetAlerts.map((alert) => (
                <Box
                  key={alert._id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alert.isOverBudget
                      ? "rgba(239, 68, 68, 0.15)"
                      : "rgba(245, 158, 11, 0.15)",
                    border: `1px solid ${
                      alert.isOverBudget
                        ? "rgba(239, 68, 68, 0.3)"
                        : "rgba(245, 158, 11, 0.3)"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    minWidth: 180,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      bgcolor: alert.isOverBudget ? "#ef4444" : "#f59e0b",
                    }}
                  >
                    {getCategoryIcon(alert.category)
                      ? (() => {
                          const IconComponent = getCategoryIcon(alert.category);
                          return <IconComponent sx={{ fontSize: 18 }} />;
                        })()
                      : alert.category.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: alert.isOverBudget
                          ? isDark
                            ? "#f87171"
                            : "#dc2626"
                          : isDark
                          ? "#fbbf24"
                          : "#b45309",
                      }}
                    >
                      {alert.category}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: alert.isOverBudget
                          ? isDark
                            ? "#fca5a5"
                            : "#b91c1c"
                          : isDark
                          ? "#fcd34d"
                          : "#92400e",
                      }}
                    >
                      {alert.percentage}% used{" "}
                      {alert.isOverBudget && "• Over budget!"}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Expense by Category */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 380 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Expenses by Category
              </Typography>
              {loading ? (
                <Skeleton
                  variant="circular"
                  width={200}
                  height={200}
                  sx={{ mx: "auto" }}
                />
              ) : categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography color="text.secondary">
                    No expense data
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Income by Category */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 380 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Income by Category
              </Typography>
              {loading ? (
                <Skeleton
                  variant="circular"
                  width={200}
                  height={200}
                  sx={{ mx: "auto" }}
                />
              ) : incomeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={incomeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {incomeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography color="text.secondary">No income data</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2 - Daily Spending Trend with Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          {/* Header with Filters */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              gap: 2,
              mb: 3,
            }}
          >
            <Typography variant="h6">
              Daily {trendType === "expense" ? "Spending" : "Income"} Trend
            </Typography>

            {/* Filters Row */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "center",
              }}
            >
              {/* Type Toggle */}
              <ToggleButtonGroup
                value={trendType}
                exclusive
                onChange={(e, val) => val && setTrendType(val)}
                size="small"
              >
                <ToggleButton value="expense" sx={{ px: 2 }}>
                  Expense
                </ToggleButton>
                <ToggleButton value="income" sx={{ px: 2 }}>
                  Income
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Period Selector */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Period</InputLabel>
                <Select
                  value={trendPeriod}
                  label="Period"
                  onChange={(e) => setTrendPeriod(e.target.value)}
                >
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="quarter">Last 3 Months</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                </Select>
              </FormControl>

              {/* Category Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={trendCategory}
                  label="Category"
                  onChange={(e) => setTrendCategory(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Account Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Account</InputLabel>
                <Select
                  value={trendAccount}
                  label="Account"
                  onChange={(e) => setTrendAccount(e.target.value)}
                >
                  <MenuItem value="all">All Accounts</MenuItem>
                  {accounts.map((acc) => (
                    <MenuItem key={acc._id} value={acc._id}>
                      {acc.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Chart */}
          {loading || trendLoading ? (
            <Skeleton variant="rectangular" height={280} />
          ) : dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={trendType === "expense" ? "#ef4444" : "#22c55e"}
                  fill={trendType === "expense" ? "#ef4444" : "#22c55e"}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography color="text.secondary">
                No {trendType} data for selected filters
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions & Budget Overview */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 380 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Recent Transactions</Typography>
                <Button
                  size="small"
                  onClick={() => navigate("/dashboard/transactions")}
                >
                  View All
                </Button>
              </Box>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <Skeleton key={i} height={50} sx={{ mb: 1 }} />
                ))
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <Box
                    key={tx._id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1.5,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {tx.payee || tx.category}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tx.category} • {new Date(tx.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color:
                          tx.type === "income" ? "success.main" : "error.main",
                      }}
                    >
                      {tx.type === "income" ? "+" : "-"}₹
                      {tx.amount.toLocaleString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <Typography color="text.secondary">
                    No transactions yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 380 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Budget Status</Typography>
                <Button
                  size="small"
                  onClick={() => navigate("/dashboard/budgets")}
                >
                  Manage
                </Button>
              </Box>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <Skeleton key={i} height={60} sx={{ mb: 1 }} />
                ))
              ) : budgetData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={budgetData.slice(0, 5)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis
                      type="category"
                      dataKey="category"
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value}% (₹${props.payload.currentSpent.toLocaleString()} / ₹${props.payload.limit.toLocaleString()})`,
                        "Usage",
                      ]}
                    />
                    <Bar
                      dataKey="percentage"
                      fill="#8b5cf6"
                      radius={[0, 4, 4, 0]}
                    >
                      {budgetData.slice(0, 5).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.isOverBudget
                              ? "#ef4444"
                              : entry.isNearLimit
                              ? "#f59e0b"
                              : "#22c55e"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography color="text.secondary">
                    No budgets set yet
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => navigate("/dashboard/budgets")}
                  >
                    Create Budget
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
