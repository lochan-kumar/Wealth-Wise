import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Skeleton,
  Avatar,
  Pagination,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  TrendingUp,
  TrendingDown,
  ArrowUpward,
  ArrowDownward,
  CalendarToday,
  AccountBalanceWallet,
  Category as CategoryIcon,
  Flag,
  Person,
} from "@mui/icons-material";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAccounts,
  getCategories,
  getGoals,
  updateGoalProgress,
  getDebtPersons,
  addDebtTransaction,
} from "../services/api";
import { useToast } from "../context/ToastContext";
import { getISTDateTime } from "../utils/dateUtils";

// Category colors for visual appeal
const categoryColors = {
  Food: "#f59e0b",
  Transport: "#3b82f6",
  Shopping: "#ec4899",
  Bills: "#8b5cf6",
  Entertainment: "#10b981",
  Health: "#ef4444",
  Education: "#6366f1",
  Salary: "#22c55e",
  Investment: "#14b8a6",
  Freelance: "#f97316",
  Other: "#64748b",
};

const TransactionsPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const toast = useToast();

  // Transaction mode state (normal, goal, debt)
  const [transactionMode, setTransactionMode] = useState("normal");
  const [goals, setGoals] = useState([]);
  const [debtPersons, setDebtPersons] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("");
  const [debtType, setDebtType] = useState("borrowed");

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  // Filters
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    account: "",
    startDate: "",
    endDate: "",
  });

  // Form state
  const [form, setForm] = useState({
    account: "",
    type: "expense",
    amount: "",
    category: "Other",
    payee: "",
    description: "",
    date: getISTDateTime(),
  });

  // Validation error state
  const [amountError, setAmountError] = useState("");

  // Validation function
  const validateAmount = (value) => {
    const num = parseFloat(value);
    if (value && (isNaN(num) || num < 0)) return "Amount cannot be negative";
    return "";
  };

  // Check if form is valid based on transaction mode
  const isFormValid = () => {
    const hasAmount = form.amount && !amountError;
    if (transactionMode === "goal") {
      return form.account && selectedGoal && hasAmount;
    } else if (transactionMode === "debt") {
      return selectedPerson && hasAmount;
    }
    return form.account && hasAmount;
  };

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [filters, page]);

  useEffect(() => {
    // Fetch accounts, categories, goals, and debt persons only once on mount
    const fetchMetadata = async () => {
      try {
        const [accRes, catRes, goalsRes, debtsRes] = await Promise.all([
          getAccounts(),
          getCategories(),
          getGoals(),
          getDebtPersons(),
        ]);
        setAccounts(accRes.data.data);
        setCategories(catRes.data.data);
        setGoals(goalsRes.data.data.filter((g) => g.status === "active"));
        setDebtPersons(debtsRes.data.data);
        if (!form.account && accRes.data.data.length > 0) {
          const defaultAcc =
            accRes.data.data.find((a) => a.isDefault) || accRes.data.data[0];
          setForm((prev) => ({ ...prev, account: defaultAcc._id }));
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };
    fetchMetadata();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const txRes = await getTransactions({ ...filters, limit, page });
      setTransactions(txRes.data.data);
      // Calculate total pages from response
      const total = txRes.data.total || txRes.data.data.length;
      setTotalCount(total);
      setTotalPages(Math.ceil(total / limit) || 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    // Scroll to top of transactions list
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenDialog = (tx = null) => {
    if (tx) {
      // Editing mode - only supports normal transactions
      setEditingTx(tx);
      setTransactionMode("normal");
      setForm({
        account: tx.account?._id || tx.account,
        type: tx.type,
        amount: tx.amount.toString(),
        category: tx.category,
        payee: tx.payee || "",
        description: tx.description || "",
        date: new Date(tx.date).toISOString().split("T")[0],
      });
    } else {
      // New transaction - reset all state
      setEditingTx(null);
      setTransactionMode("normal");
      const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];
      setForm({
        account: defaultAcc?._id || "",
        type: "expense",
        amount: "",
        category: "Other",
        payee: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setSelectedGoal("");
      setSelectedPerson("");
      setDebtType("borrowed");
      setAmountError("");
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTx(null);
  };

  const handleSubmit = async () => {
    try {
      const amount = parseFloat(form.amount);

      if (transactionMode === "goal") {
        // Goal contribution
        if (!selectedGoal) {
          toast.error("Please select a goal");
          return;
        }
        const res = await updateGoalProgress(
          selectedGoal,
          amount,
          form.account
        );
        toast.success(res.data.message || "Added to goal!");
        fetchData();
      } else if (transactionMode === "debt") {
        // Debt transaction
        if (!selectedPerson) {
          toast.error("Please select a person");
          return;
        }
        await addDebtTransaction(selectedPerson, {
          type: debtType,
          amount: amount,
          description: form.description,
          accountId: form.account || null,
        });
        toast.success("Debt transaction added!");
        fetchData();
      } else {
        // Normal transaction
        const data = {
          ...form,
          amount: amount,
          // Use current date/time if not specified
          date: form.date || new Date().toISOString(),
        };

        if (editingTx) {
          await updateTransaction(editingTx._id, data);
          toast.success("Transaction updated!");
          fetchData();
        } else {
          await createTransaction(data);
          toast.success("Transaction added!");
          setPage(1);
          if (page === 1) fetchData();
        }
      }
      handleCloseDialog();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving transaction");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this transaction?");
    if (confirmed) {
      try {
        await deleteTransaction(id);
        toast.success("Transaction deleted!");
        fetchData(); // Refetch to update pagination correctly
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Error deleting transaction"
        );
      }
    }
  };

  const getCategoryColor = (category) => {
    return categoryColors[category] || categoryColors.Other;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  // Transaction Card Component
  const TransactionCard = ({ tx }) => {
    const color = getCategoryColor(tx.category);
    const isIncome = tx.type === "income";

    return (
      <Card
        sx={{
          mb: 2,
          background: isDark
            ? `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(
                color,
                0.05
              )} 100%)`
            : `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(
                color,
                0.02
              )} 100%)`,
          borderLeft: `4px solid ${color}`,
        }}
      >
        <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Icon */}
            <Avatar
              sx={{
                bgcolor: alpha(color, 0.2),
                color: color,
                width: 48,
                height: 48,
              }}
            >
              {isIncome ? <TrendingUp /> : <TrendingDown />}
            </Avatar>

            {/* Main Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tx.payee || tx.category}
                </Typography>
                <Chip
                  size="small"
                  label={tx.category}
                  sx={{
                    bgcolor: alpha(color, 0.15),
                    color: color,
                    fontWeight: 500,
                    fontSize: "0.7rem",
                    height: 22,
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  color: "text.secondary",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <CalendarToday sx={{ fontSize: 14 }} />
                  {formatDate(tx.date)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <AccountBalanceWallet sx={{ fontSize: 14 }} />
                  {tx.account?.name || "Unknown"}
                </Typography>
              </Box>
              {tx.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tx.description}
                </Typography>
              )}
            </Box>

            {/* Amount */}
            <Box sx={{ textAlign: "right" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: isIncome ? "#22c55e" : "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                {isIncome ? (
                  <ArrowUpward sx={{ fontSize: 18 }} />
                ) : (
                  <ArrowDownward sx={{ fontSize: 18 }} />
                )}
                ₹{tx.amount.toLocaleString()}
              </Typography>
            </Box>

            {/* Actions */}
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => handleOpenDialog(tx)}
                sx={{
                  color: "text.secondary",
                  "&:hover": { bgcolor: alpha(color, 0.1) },
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDelete(tx._id)}
                sx={{
                  color: "error.main",
                  "&:hover": { bgcolor: alpha("#ef4444", 0.1) },
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Loading skeleton
  const TransactionSkeleton = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="60%" height={24} />
            <Skeleton width="40%" height={20} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton width={80} height={28} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Transactions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalCount} transactions total
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1.5,
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            },
          }}
        >
          Add Transaction
        </Button>
      </Box>

      {/* Category Summary Card - Current Month Only */}
      {!loading &&
        transactions.length > 0 &&
        (() => {
          // Get current month boundaries
          const now = new Date();
          const currentMonthStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
          );
          const currentMonthEnd = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59
          );
          const monthName = now.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          });

          // Calculate spending by category from current month transactions (only expenses)
          const categorySummary = transactions
            .filter((tx) => {
              const txDate = new Date(tx.date);
              return (
                tx.type === "expense" &&
                txDate >= currentMonthStart &&
                txDate <= currentMonthEnd
              );
            })
            .reduce((acc, tx) => {
              const category = tx.category || "Other";
              acc[category] = (acc[category] || 0) + tx.amount;
              return acc;
            }, {});

          const sortedCategories = Object.entries(categorySummary).sort(
            (a, b) => b[1] - a[1]
          );

          const totalSpent = sortedCategories.reduce(
            (sum, [, amount]) => sum + amount,
            0
          );

          if (sortedCategories.length === 0) return null;

          return (
            <Card
              sx={{
                mb: 3,
                background: isDark
                  ? `linear-gradient(135deg, ${alpha(
                      "#8b5cf6",
                      0.15
                    )} 0%, ${alpha("#6366f1", 0.08)} 100%)`
                  : `linear-gradient(135deg, ${alpha(
                      "#8b5cf6",
                      0.1
                    )} 0%, ${alpha("#6366f1", 0.05)} 100%)`,
                borderLeft: `4px solid #8b5cf6`,
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
                  <Avatar
                    sx={{
                      bgcolor: alpha("#8b5cf6", 0.2),
                      color: "#8b5cf6",
                      width: 40,
                      height: 40,
                    }}
                  >
                    <CategoryIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Spending by Category
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {monthName} • Total: ₹{totalSpent.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  {sortedCategories.map(([category, amount]) => {
                    const color = getCategoryColor(category);
                    return (
                      <Grid item xs={6} sm={4} md={3} key={category}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: isDark
                              ? alpha(color, 0.15)
                              : alpha(color, 0.1),
                            border: `1px solid ${alpha(color, 0.3)}`,
                            transition: "transform 0.2s, box-shadow 0.2s",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: `0 4px 12px ${alpha(color, 0.25)}`,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: color,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}
                            >
                              {category.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                color: isDark ? "#ffffff" : "text.primary",
                              }}
                            >
                              {category}
                            </Typography>
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: color }}
                          >
                            ₹{amount.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          );
        })()}

      {/* Filters */}
      <Card
        sx={{
          mb: 3,
          background: isDark ? alpha("#ffffff", 0.05) : alpha("#000000", 0.02),
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: isDark
                    ? alpha("#ffffff", 0.3)
                    : alpha("#000000", 0.23),
                },
                "&:hover fieldset": {
                  borderColor: isDark
                    ? alpha("#ffffff", 0.5)
                    : alpha("#000000", 0.4),
                },
                "&.Mui-focused fieldset": {
                  borderColor: isDark ? "#10b981" : "#059669",
                },
              },
              "& .MuiInputLabel-root": {
                color: isDark ? alpha("#ffffff", 0.7) : "text.secondary",
              },
              "& .MuiSelect-icon": {
                color: isDark ? alpha("#ffffff", 0.7) : "inherit",
              },
            }}
          >
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
              >
                <MenuItem value="">All</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Account</InputLabel>
              <Select
                value={filters.account}
                label="Account"
                onChange={(e) =>
                  setFilters({ ...filters, account: e.target.value })
                }
              >
                <MenuItem value="">All</MenuItem>
                {accounts.map((acc) => (
                  <MenuItem key={acc._id} value={acc._id}>
                    {acc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              type="date"
              label="From"
              InputLabelProps={{ shrink: true }}
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              sx={{ width: 150 }}
            />

            <TextField
              size="small"
              type="date"
              label="To"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              sx={{ width: 150 }}
            />

            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                setFilters({
                  type: "",
                  category: "",
                  account: "",
                  startDate: "",
                  endDate: "",
                })
              }
              sx={{
                borderRadius: 2,
                borderColor: isDark ? alpha("#ffffff", 0.3) : undefined,
                color: isDark ? alpha("#ffffff", 0.7) : undefined,
                "&:hover": {
                  borderColor: isDark ? alpha("#ffffff", 0.5) : undefined,
                },
              }}
            >
              Clear
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Transactions List */}
      {loading ? (
        [...Array(5)].map((_, i) => <TransactionSkeleton key={i} />)
      ) : transactions.length === 0 ? (
        <Card sx={{ py: 8, textAlign: "center" }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No transactions found
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Your First Transaction
          </Button>
        </Card>
      ) : (
        <>
          {transactions.map((tx) => (
            <TransactionCard key={tx._id} tx={tx} />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                py: 3,
                mt: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing {(page - 1) * limit + 1} -{" "}
                {Math.min(page * limit, totalCount)} of {totalCount}
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: isDark ? "#ffffff" : "text.primary",
                    borderColor: isDark ? alpha("#ffffff", 0.3) : undefined,
                    "&.Mui-selected": {
                      background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "#ffffff",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      },
                    },
                    "&:hover": {
                      bgcolor: isDark
                        ? alpha("#ffffff", 0.1)
                        : alpha("#000000", 0.04),
                    },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: isDark
              ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingTx ? "Edit Transaction" : "Add Transaction"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Transaction Mode Selector - Only show for new transactions */}
            {!editingTx && (
              <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                <Chip
                  icon={<AccountBalanceWallet />}
                  label="Normal"
                  onClick={() => setTransactionMode("normal")}
                  color={transactionMode === "normal" ? "primary" : "default"}
                  variant={transactionMode === "normal" ? "filled" : "outlined"}
                  sx={{ flex: 1, py: 2.5 }}
                />
                <Chip
                  icon={<Flag />}
                  label="Goal"
                  onClick={() => setTransactionMode("goal")}
                  color={transactionMode === "goal" ? "primary" : "default"}
                  variant={transactionMode === "goal" ? "filled" : "outlined"}
                  sx={{ flex: 1, py: 2.5 }}
                  disabled={goals.length === 0}
                />
                <Chip
                  icon={<Person />}
                  label="Debt"
                  onClick={() => setTransactionMode("debt")}
                  color={transactionMode === "debt" ? "primary" : "default"}
                  variant={transactionMode === "debt" ? "filled" : "outlined"}
                  sx={{ flex: 1, py: 2.5 }}
                  disabled={debtPersons.length === 0}
                />
              </Box>
            )}

            {/* Account Selector - Common for all modes */}
            <FormControl fullWidth>
              <InputLabel>Account</InputLabel>
              <Select
                value={form.account}
                label="Account"
                onChange={(e) => setForm({ ...form, account: e.target.value })}
              >
                {accounts.map((acc) => (
                  <MenuItem key={acc._id} value={acc._id}>
                    {acc.name} (₹{(acc.balance || 0).toLocaleString()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* NORMAL MODE FIELDS */}
            {transactionMode === "normal" && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={form.type}
                    label="Type"
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <MenuItem value="expense">Expense</MenuItem>
                    <MenuItem value="income">Income</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={form.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({ ...form, amount: value });
                    setAmountError(validateAmount(value));
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  error={!!amountError}
                  helperText={amountError}
                />
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={form.category}
                    label="Category"
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {categories
                      .filter((cat) =>
                        form.type === "income"
                          ? cat.type !== "expense"
                          : cat.type !== "income"
                      )
                      .map((cat) => (
                        <MenuItem key={cat._id} value={cat.name}>
                          {cat.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Payee"
                  value={form.payee}
                  onChange={(e) => setForm({ ...form, payee: e.target.value })}
                  placeholder="Who did you pay or receive from?"
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  multiline
                  rows={2}
                />
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Date & Time"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}

            {/* GOAL MODE FIELDS */}
            {transactionMode === "goal" && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Select Goal</InputLabel>
                  <Select
                    value={selectedGoal}
                    label="Select Goal"
                    onChange={(e) => setSelectedGoal(e.target.value)}
                  >
                    {goals.map((goal) => (
                      <MenuItem key={goal._id} value={goal._id}>
                        {goal.name} (₹
                        {(goal.currentAmount || 0).toLocaleString()} / ₹
                        {goal.targetAmount.toLocaleString()})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Amount to Add"
                  type="number"
                  value={form.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({ ...form, amount: value });
                    setAmountError(validateAmount(value));
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  error={!!amountError}
                  helperText={
                    amountError ||
                    (selectedGoal
                      ? `Remaining: ₹${(
                          (goals.find((g) => g._id === selectedGoal)
                            ?.targetAmount || 0) -
                          (goals.find((g) => g._id === selectedGoal)
                            ?.currentAmount || 0)
                        ).toLocaleString()}`
                      : "Select a goal first")
                  }
                />
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Notes about this contribution"
                />
              </>
            )}

            {/* DEBT MODE FIELDS */}
            {transactionMode === "debt" && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Select Person</InputLabel>
                  <Select
                    value={selectedPerson}
                    label="Select Person"
                    onChange={(e) => setSelectedPerson(e.target.value)}
                  >
                    {debtPersons.map((person) => (
                      <MenuItem key={person._id} value={person._id}>
                        {person.name} (Balance: ₹
                        {Math.abs(person.balance || 0).toLocaleString()}{" "}
                        {person.balance > 0
                          ? "they owe"
                          : person.balance < 0
                          ? "you owe"
                          : "settled"}
                        )
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Transaction Type</InputLabel>
                  <Select
                    value={debtType}
                    label="Transaction Type"
                    onChange={(e) => setDebtType(e.target.value)}
                  >
                    <MenuItem value="borrowed">
                      I Borrowed (They gave me)
                    </MenuItem>
                    <MenuItem value="lent">I Lent (I gave them)</MenuItem>
                    <MenuItem value="repaid">I Repaid (Paying back)</MenuItem>
                    <MenuItem value="received">
                      I Received (They paid back)
                    </MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={form.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({ ...form, amount: value });
                    setAmountError(validateAmount(value));
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  error={!!amountError}
                  helperText={amountError}
                />
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="What was this for?"
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid()}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            }}
          >
            {editingTx ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionsPage;
