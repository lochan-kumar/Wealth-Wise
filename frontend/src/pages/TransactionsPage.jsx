import { useState, useEffect, useRef, useCallback } from "react";
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
  CircularProgress,
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
} from "@mui/icons-material";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAccounts,
  getCategories,
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const toast = useToast();

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  // Intersection Observer ref for infinite scroll
  const observerRef = useRef();
  const lastTransactionRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreTransactions();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loadingMore, hasMore]
  );

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

  // Check if form is valid
  const isFormValid = form.account && form.amount && !amountError;

  useEffect(() => {
    fetchInitialData();
  }, [filters]);

  const fetchInitialData = async () => {
    setLoading(true);
    setPage(1);
    try {
      const [txRes, accRes, catRes] = await Promise.all([
        getTransactions({ ...filters, limit, page: 1 }),
        getAccounts(),
        getCategories(),
      ]);
      setTransactions(txRes.data.data);
      setHasMore(txRes.data.data.length >= limit);
      setAccounts(accRes.data.data);
      setCategories(catRes.data.data);
      if (!form.account && accRes.data.data.length > 0) {
        const defaultAcc =
          accRes.data.data.find((a) => a.isDefault) || accRes.data.data[0];
        setForm((prev) => ({ ...prev, account: defaultAcc._id }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTransactions = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const txRes = await getTransactions({
        ...filters,
        limit,
        page: nextPage,
      });
      const newTransactions = txRes.data.data;
      setTransactions((prev) => [...prev, ...newTransactions]);
      setPage(nextPage);
      setHasMore(newTransactions.length >= limit);
    } catch (error) {
      console.error("Error loading more:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleOpenDialog = (tx = null) => {
    if (tx) {
      setEditingTx(tx);
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
      setEditingTx(null);
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
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTx(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...form,
        amount: parseFloat(form.amount),
      };

      if (editingTx) {
        await updateTransaction(editingTx._id, data);
        toast.success("Transaction updated!");
      } else {
        await createTransaction(data);
        toast.success("Transaction added!");
      }
      handleCloseDialog();
      fetchInitialData();
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
        setTransactions((prev) => prev.filter((tx) => tx._id !== id));
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
  const TransactionCard = ({ tx, isLast }) => {
    const color = getCategoryColor(tx.category);
    const isIncome = tx.type === "income";

    return (
      <Card
        ref={isLast ? lastTransactionRef : null}
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
            {transactions.length} transactions loaded
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
              sx={{ borderRadius: 2 }}
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
          {transactions.map((tx, index) => (
            <TransactionCard
              key={tx._id}
              tx={tx}
              isLast={index === transactions.length - 1}
            />
          ))}

          {/* Loading More Indicator */}
          {loadingMore && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={32} />
            </Box>
          )}

          {/* End of List */}
          {!hasMore && transactions.length > 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 3 }}
            >
              You've reached the end
            </Typography>
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
                onChange={(e) => setForm({ ...form, category: e.target.value })}
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
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid}
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
