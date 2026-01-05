import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  useTheme,
} from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
  AccountBalanceWallet,
  Flag,
  Person,
} from "@mui/icons-material";
import {
  createTransaction,
  updateTransaction,
  getAccounts,
  getCategories,
  getGoals,
  updateGoalProgress,
  getDebtPersons,
  addDebtTransaction,
} from "../services/api";
import { useToast } from "../context/ToastContext";
import { getISTDateTime } from "../utils/dateUtils";

/**
 * Unified Add Transaction Dialog Component
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether dialog is open
 * @param {function} props.onClose - Called when dialog closes
 * @param {function} props.onSuccess - Called after successful transaction add/edit
 * @param {Object} props.editingTx - Transaction being edited (null for new)
 * @param {string} props.initialMode - Initial mode: "normal", "goal", or "debt"
 * @param {string} props.initialPersonId - Pre-selected person for debt mode
 * @param {string} props.initialGoalId - Pre-selected goal for goal mode
 */
const AddTransactionDialog = ({
  open,
  onClose,
  onSuccess,
  editingTx = null,
  initialMode = "normal",
  initialPersonId = "",
  initialGoalId = "",
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const toast = useToast();

  // Data state
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [debtPersons, setDebtPersons] = useState([]);

  // Form state
  const [transactionMode, setTransactionMode] = useState(initialMode);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(initialPersonId);
  const [debtType, setDebtType] = useState("borrowed");
  const [amountError, setAmountError] = useState("");

  const [form, setForm] = useState({
    account: "",
    type: "expense",
    amount: "",
    category: "Other",
    payee: "",
    description: "",
    date: getISTDateTime(),
  });

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
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      fetchMetadata();
      // Reset form for new transaction
      if (!editingTx) {
        setTransactionMode(initialMode);
        setSelectedPerson(initialPersonId);
        setSelectedGoal(initialGoalId);
        setDebtType("borrowed");
        setAmountError("");
      }
    }
  }, [open, editingTx, initialMode, initialPersonId, initialGoalId]);

  // Set editing data
  useEffect(() => {
    if (editingTx && open) {
      setTransactionMode("normal");
      setForm({
        account: editingTx.account?._id || editingTx.account,
        type: editingTx.type,
        amount: editingTx.amount.toString(),
        category: editingTx.category,
        payee: editingTx.payee || "",
        description: editingTx.description || "",
        date: new Date(editingTx.date).toISOString().slice(0, 16),
      });
    } else if (open && !editingTx) {
      // Reset form for new transaction
      setForm({
        account: "",
        type: "expense",
        amount: "",
        category: "Other",
        payee: "",
        description: "",
        date: getISTDateTime(),
      });
    }
  }, [editingTx, open]);

  // Set default account when accounts load
  useEffect(() => {
    if (accounts.length > 0 && !form.account) {
      const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];
      setForm((prev) => ({ ...prev, account: defaultAcc._id }));
    }
  }, [accounts, form.account]);

  const validateAmount = (value) => {
    const num = parseFloat(value);
    if (!value) return "";
    if (isNaN(num) || num <= 0) return "Amount must be greater than 0";
    return "";
  };

  const isFormValid = () => {
    if (transactionMode === "goal") {
      return selectedGoal && form.amount && !amountError;
    }
    if (transactionMode === "debt") {
      return selectedPerson && form.amount && !amountError;
    }
    // Normal mode
    return form.account && form.amount && !amountError;
  };

  const handleSubmit = async () => {
    try {
      const amount = parseFloat(form.amount);

      if (transactionMode === "goal") {
        if (!selectedGoal) {
          toast.error("Please select a goal");
          return;
        }
        const res = await updateGoalProgress(
          selectedGoal,
          amount,
          form.account,
          form.date || new Date().toISOString()
        );
        toast.success(res.data.message || "Added to goal!");
      } else if (transactionMode === "debt") {
        if (!selectedPerson) {
          toast.error("Please select a person");
          return;
        }
        await addDebtTransaction(selectedPerson, {
          type: debtType,
          amount: amount,
          description: form.description,
          accountId: form.account || null,
          date: form.date || new Date().toISOString(),
        });
        toast.success("Debt transaction added!");
      } else {
        // Normal transaction
        const data = {
          ...form,
          amount: amount,
          date: form.date || new Date().toISOString(),
        };

        if (editingTx) {
          await updateTransaction(editingTx._id, data);
          toast.success("Transaction updated!");
        } else {
          await createTransaction(data);
          toast.success("Transaction added!");
        }
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving transaction");
    }
  };

  const handleClose = () => {
    setAmountError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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

          {/* NORMAL MODE FIELDS */}
          {(transactionMode === "normal" || editingTx) && (
            <>
              <FormControl fullWidth>
                <InputLabel>Account</InputLabel>
                <Select
                  value={form.account}
                  label="Account"
                  onChange={(e) =>
                    setForm({ ...form, account: e.target.value })
                  }
                >
                  {accounts.map((acc) => (
                    <MenuItem key={acc._id} value={acc._id}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <span>{acc.name}</span>
                        <span
                          style={{
                            color: acc.balance >= 0 ? "#16a34a" : "#dc2626",
                            fontWeight: 600,
                          }}
                        >
                          ₹{(acc.balance || 0).toLocaleString()}
                        </span>
                      </Box>
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
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  {categories
                    .filter(
                      (cat) =>
                        cat.type === "both" ||
                        cat.type === form.type ||
                        !cat.type
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
                label="Description (Optional)"
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
          {transactionMode === "goal" && !editingTx && (
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
              <FormControl fullWidth>
                <InputLabel>Account (Optional)</InputLabel>
                <Select
                  value={form.account}
                  label="Account (Optional)"
                  onChange={(e) =>
                    setForm({ ...form, account: e.target.value })
                  }
                >
                  <MenuItem value="">
                    <em>No Account</em>
                  </MenuItem>
                  {accounts.map((acc) => (
                    <MenuItem key={acc._id} value={acc._id}>
                      {acc.name} (₹{(acc.balance || 0).toLocaleString()})
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

          {/* DEBT MODE FIELDS */}
          {transactionMode === "debt" && !editingTx && (
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
                  renderValue={(value) => {
                    const options = {
                      borrowed: "I Borrowed",
                      lent: "I Lent",
                      repaid: "I Repaid",
                      received: "I Received",
                    };
                    return options[value] || value;
                  }}
                >
                  <MenuItem value="borrowed">
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <ArrowDownward sx={{ color: "#ef4444" }} />
                      <Box>
                        <Typography fontWeight={600}>I Borrowed</Typography>
                        <Typography variant="caption" color="text.secondary">
                          You took money from them
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <MenuItem value="lent">
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <ArrowUpward sx={{ color: "#10b981" }} />
                      <Box>
                        <Typography fontWeight={600}>I Lent</Typography>
                        <Typography variant="caption" color="text.secondary">
                          You gave money to them
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <MenuItem value="repaid">
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <ArrowUpward sx={{ color: "#10b981" }} />
                      <Box>
                        <Typography fontWeight={600}>I Repaid</Typography>
                        <Typography variant="caption" color="text.secondary">
                          You paid back what you owed
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <MenuItem value="received">
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <ArrowDownward sx={{ color: "#ef4444" }} />
                      <Box>
                        <Typography fontWeight={600}>I Received</Typography>
                        <Typography variant="caption" color="text.secondary">
                          They paid back what they owed
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Account (Optional)</InputLabel>
                <Select
                  value={form.account}
                  label="Account (Optional)"
                  onChange={(e) =>
                    setForm({ ...form, account: e.target.value })
                  }
                >
                  <MenuItem value="">
                    <em>No Account</em>
                  </MenuItem>
                  {accounts.map((acc) => (
                    <MenuItem key={acc._id} value={acc._id}>
                      {acc.name} (₹{(acc.balance || 0).toLocaleString()})
                    </MenuItem>
                  ))}
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
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
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
  );
};

export default AddTransactionDialog;
