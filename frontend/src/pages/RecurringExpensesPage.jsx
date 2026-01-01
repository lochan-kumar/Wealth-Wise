import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Add, Edit, Delete, Repeat, PlayArrow } from "@mui/icons-material";
import {
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  processSingleRecurringExpense,
  getAccounts,
  getCategories,
} from "../services/api";
import { useToast } from "../context/ToastContext";

// Categories are fetched from API

const RecurringExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "Bills",
    account: "",
    dayOfMonth: "",
    description: "",
    isActive: true,
  });

  // Validation errors
  const [formErrors, setFormErrors] = useState({
    name: "",
    amount: "",
    dayOfMonth: "",
  });

  // Validation functions
  const validateName = (value) => {
    if (value && value.length < 2) return "Name must be at least 2 characters";
    return "";
  };

  const validateAmount = (value) => {
    const num = parseFloat(value);
    if (value && (isNaN(num) || num < 0)) return "Amount cannot be negative";
    return "";
  };

  const validateDayOfMonth = (value) => {
    const num = parseInt(value);
    if (value && (isNaN(num) || num < 1 || num > 31))
      return "Day must be between 1 and 31";
    return "";
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      form.name &&
      form.amount &&
      form.account &&
      form.dayOfMonth &&
      !formErrors.name &&
      !formErrors.amount &&
      !formErrors.dayOfMonth
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expensesRes, accountsRes, catRes] = await Promise.all([
        getRecurringExpenses(),
        getAccounts(),
        getCategories(),
      ]);
      setExpenses(expensesRes.data.data);
      setAccounts(accountsRes.data.data);
      setCategories(catRes.data.data.filter((c) => c.type !== "income"));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setForm({
        name: expense.name,
        amount: expense.amount.toString(),
        category: expense.category,
        account: expense.account?._id || expense.account,
        dayOfMonth: expense.dayOfMonth.toString(),
        description: expense.description || "",
        isActive: expense.isActive,
      });
    } else {
      setEditingExpense(null);
      setForm({
        name: "",
        amount: "",
        category: "Bills",
        account: accounts.length > 0 ? accounts[0]._id : "",
        dayOfMonth: "",
        description: "",
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingExpense(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...form,
        amount: parseFloat(form.amount),
        dayOfMonth: parseInt(form.dayOfMonth),
      };

      if (editingExpense) {
        await updateRecurringExpense(editingExpense._id, data);
        toast.success("Recurring expense updated!");
      } else {
        await createRecurringExpense(data);
        toast.success("Recurring expense created!");
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error saving recurring expense"
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this recurring expense?")) {
      try {
        await deleteRecurringExpense(id);
        toast.success("Recurring expense deleted!");
        fetchData();
      } catch (error) {
        toast.error("Error deleting recurring expense");
      }
    }
  };

  const handleToggleActive = async (expense) => {
    try {
      await updateRecurringExpense(expense._id, {
        isActive: !expense.isActive,
      });
      toast.success(
        expense.isActive
          ? "Recurring expense paused"
          : "Recurring expense activated"
      );
      fetchData();
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  const handleProcessSingle = async (expense) => {
    try {
      const res = await processSingleRecurringExpense(expense._id);
      toast.success(res.data.message);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error processing expense");
    }
  };

  const getDaySuffix = (day) => {
    if (day >= 11 && day <= 13) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const totalMonthly = expenses
    .filter((e) => e.isActive)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Recurring Expenses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monthly total: ₹{totalMonthly.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Recurring
          </Button>
        </Box>
      </Box>

      {/* Expenses Grid */}
      <Grid container spacing={3}>
        {expenses.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ textAlign: "center", py: 6 }}>
              <Repeat sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No recurring expenses yet
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Add Your First Recurring Expense
              </Button>
            </Card>
          </Grid>
        ) : (
          expenses.map((expense) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={expense._id}>
              <Card sx={{ opacity: expense.isActive ? 1 : 0.6 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h6">{expense.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {expense.dayOfMonth}
                        {getDaySuffix(expense.dayOfMonth)} of every month
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={expense.isActive ? "Active" : "Paused"}
                      color={expense.isActive ? "success" : "default"}
                    />
                  </Box>

                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, color: "error.main", mb: 1 }}
                  >
                    ₹{expense.amount.toLocaleString()}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <Chip size="small" label={expense.category} />
                    <Chip
                      size="small"
                      label={expense.account?.name || "Unknown"}
                      variant="outlined"
                    />
                  </Box>

                  {expense.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {expense.description}
                    </Typography>
                  )}

                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={expense.isActive}
                          onChange={() => handleToggleActive(expense)}
                        />
                      }
                      label={expense.isActive ? "Active" : "Paused"}
                    />
                    <Box sx={{ flex: 1 }} />
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleProcessSingle(expense)}
                      title="Process this expense now"
                      disabled={!expense.isActive}
                    >
                      <PlayArrow fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(expense)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingExpense ? "Edit Recurring Expense" : "Add Recurring Expense"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={form.name}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, name: value });
                setFormErrors({ ...formErrors, name: validateName(value) });
              }}
              placeholder="e.g., Netflix, Rent, Insurance"
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, amount: value });
                setFormErrors({ ...formErrors, amount: validateAmount(value) });
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
              error={!!formErrors.amount}
              helperText={formErrors.amount}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.category}
                label="Category"
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Account</InputLabel>
              <Select
                value={form.account}
                label="Account"
                onChange={(e) => setForm({ ...form, account: e.target.value })}
              >
                {accounts.map((acc) => (
                  <MenuItem key={acc._id} value={acc._id}>
                    {acc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Day of Month"
              type="number"
              value={form.dayOfMonth}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, dayOfMonth: value });
                setFormErrors({
                  ...formErrors,
                  dayOfMonth: validateDayOfMonth(value),
                });
              }}
              inputProps={{ min: 1, max: 31 }}
              placeholder="1-31"
              error={!!formErrors.dayOfMonth}
              helperText={
                formErrors.dayOfMonth ||
                "Enter the day (1-31) when this expense occurs"
              }
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Add notes about this expense"
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            {editingExpense ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecurringExpensesPage;
