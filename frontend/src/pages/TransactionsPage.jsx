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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
} from "@mui/material";
import { Add, Edit, Delete, FilterList, Search } from "@mui/icons-material";
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

// Categories are now fetched from API

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const toast = useToast();

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
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [txRes, accRes, catRes] = await Promise.all([
        getTransactions(filters),
        getAccounts(),
        getCategories(),
      ]);
      setTransactions(txRes.data.data);
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
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving transaction");
    }
  };

  const handleDelete = async (id) => {
    console.log("Delete clicked for transaction:", id);
    const confirmed = window.confirm("Delete this transaction?");
    console.log("Confirm result:", confirmed);
    if (confirmed) {
      try {
        console.log("Calling delete API...");
        await deleteTransaction(id);
        console.log("Delete successful!");
        toast.success("Transaction deleted!");
        fetchData();
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(
          error.response?.data?.message || "Error deleting transaction"
        );
      }
    }
  };

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
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Transactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Transaction
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
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
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
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
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
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
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="From"
                InputLabelProps={{ shrink: true }}
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() =>
                  setFilters({
                    type: "",
                    category: "",
                    account: "",
                    startDate: "",
                    endDate: "",
                  })
                }
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Payee</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Account</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No transactions found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx._id} hover>
                  <TableCell>
                    {new Date(tx.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={tx.type}
                      color={tx.type === "income" ? "success" : "error"}
                    />
                  </TableCell>
                  <TableCell>{tx.payee || "-"}</TableCell>
                  <TableCell>{tx.category}</TableCell>
                  <TableCell>{tx.account?.name || "-"}</TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 600,
                      color:
                        tx.type === "income" ? "success.main" : "error.main",
                    }}
                  >
                    {tx.type === "income" ? "+" : "-"}₹
                    {tx.amount.toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(tx)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(tx._id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
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
              {form.account && (
                <Typography
                  variant="caption"
                  sx={{ mt: 0.5, color: "success.main" }}
                >
                  Balance: ₹
                  {(
                    accounts.find((a) => a._id === form.account)?.balance || 0
                  ).toLocaleString()}
                </Typography>
              )}
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
          >
            {editingTx ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionsPage;
