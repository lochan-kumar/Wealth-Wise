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
} from "@mui/material";
import { TrendingUp, TrendingDown, AccountBalance } from "@mui/icons-material";
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
  getBudgetStatus,
  getByDate,
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

const DashboardHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [budgetData, setBudgetData] = useState([]);

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
        budgetRes,
        dailyRes,
      ] = await Promise.all([
        getDashboardSummary(),
        getByCategory({ type: "expense", period: "month" }),
        getByCategory({ type: "income", period: "month" }),
        getTransactions({ limit: 5 }),
        getBudgetStatus(),
        getByDate({ period: "month" }),
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
      setBudgetData(budgetRes.data.data || []);
      setBudgetAlerts(
        budgetRes.data.data.filter((b) => b.isNearLimit || b.isOverBudget)
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const SummaryCard = ({ title, amount, icon, color }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={100} height={40} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 700, color }}>
                ₹{amount?.toLocaleString() || 0}
              </Typography>
            )}
          </Box>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}20`, color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Total Income (This Month)"
            amount={summary?.thisMonth?.totalIncome}
            icon={<TrendingUp />}
            color="#2e7d32"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Total Expense (This Month)"
            amount={summary?.thisMonth?.totalExpense}
            icon={<TrendingDown />}
            color="#d32f2f"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Net Balance"
            amount={summary?.thisMonth?.netBalance}
            icon={<AccountBalance />}
            color="#1976d2"
          />
        </Grid>
      </Grid>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <Card
          sx={{
            mb: 4,
            bgcolor: "warning.light",
            color: "warning.contrastText",
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              ⚠️ Budget Alerts
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {budgetAlerts.map((alert) => (
                <Chip
                  key={alert._id}
                  label={`${alert.category}: ${alert.percentage}% used`}
                  color={alert.isOverBudget ? "error" : "warning"}
                  variant="filled"
                />
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

      {/* Charts Row 2 - Daily Spending Trend */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ height: 350 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Daily Spending Trend (This Month)
              </Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={250} />
              ) : dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography color="text.secondary">No daily data</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
                  <BarChart data={budgetData.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis
                      type="category"
                      dataKey="category"
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="percentage" fill="#8884d8" />
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
