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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Collapse,
  Alert,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  PersonAdd,
  ExpandMore,
  ExpandLess,
  TrendingUp,
  TrendingDown,
  ArrowUpward,
  ArrowDownward,
  SwapHoriz,
} from "@mui/icons-material";
import {
  getDebtPersons,
  getDebtSummary,
  createDebtPerson,
  updateDebtPerson,
  addDebtTransaction,
  deleteDebtTransaction,
  deleteDebtPerson,
  getAccounts,
} from "../services/api";
import AnimatedSnackbar from "../components/AnimatedSnackbar";

const transactionTypes = [
  {
    value: "borrowed",
    label: "I Borrowed",
    icon: <ArrowDownward color="error" />,
    description: "You took money from them",
  },
  {
    value: "lent",
    label: "I Lent",
    icon: <ArrowUpward color="success" />,
    description: "You gave money to them",
  },
  {
    value: "repaid",
    label: "I Repaid",
    icon: <ArrowUpward color="primary" />,
    description: "You paid back what you owed",
  },
  {
    value: "received",
    label: "I Received",
    icon: <ArrowDownward color="primary" />,
    description: "They paid back what they owed",
  },
];

const DebtsPage = () => {
  const [persons, setPersons] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState({
    theyOwe: { count: 0, total: 0 },
    youOwe: { count: 0, total: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [expandedPerson, setExpandedPerson] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [personForm, setPersonForm] = useState({
    name: "",
    phone: "",
    notes: "",
  });

  const [transactionForm, setTransactionForm] = useState({
    type: "borrowed",
    amount: "",
    description: "",
    accountId: "",
  });

  // Validation errors
  const [personErrors, setPersonErrors] = useState({
    name: "",
    phone: "",
  });
  const [txAmountError, setTxAmountError] = useState("");

  // Validation functions
  const validatePersonName = (value) => {
    if (value && value.length < 2) return "Name must be at least 2 characters";
    if (value && value.length > 50)
      return "Name must be less than 50 characters";
    return "";
  };

  const validatePhone = (value) => {
    if (value && !/^\d{10}$/.test(value)) return "Phone must be 10 digits";
    return "";
  };

  const validateTxAmount = (value) => {
    const num = parseFloat(value);
    if (value && (isNaN(num) || num < 0)) return "Amount cannot be negative";
    return "";
  };

  // Form validity checks
  const isPersonFormValid =
    personForm.name && !personErrors.name && !personErrors.phone;
  const isTxFormValid = transactionForm.amount && !txAmountError;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [personsRes, summaryRes, accountsRes] = await Promise.all([
        getDebtPersons(),
        getDebtSummary(),
        getAccounts(),
      ]);
      setPersons(personsRes.data.data);
      setSummary(summaryRes.data.data);
      setAccounts(accountsRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPersonDialog = (person = null) => {
    if (person) {
      setEditingPerson(person);
      setPersonForm({
        name: person.name,
        phone: person.phone || "",
        notes: person.notes || "",
      });
    } else {
      setEditingPerson(null);
      setPersonForm({ name: "", phone: "", notes: "" });
    }
    setPersonDialogOpen(true);
  };

  const handleOpenTransactionDialog = (person) => {
    setSelectedPerson(person);
    setTransactionForm({
      type: "borrowed",
      amount: "",
      description: "",
      accountId: accounts.length > 0 ? accounts[0]._id : "",
    });
    setTransactionDialogOpen(true);
  };

  const handleSavePerson = async () => {
    try {
      if (editingPerson) {
        await updateDebtPerson(editingPerson._id, personForm);
        setSnackbar({
          open: true,
          message: "Person updated!",
          severity: "success",
        });
      } else {
        await createDebtPerson(personForm);
        setSnackbar({
          open: true,
          message: "Person added!",
          severity: "success",
        });
      }
      setPersonDialogOpen(false);
      fetchData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error saving person",
        severity: "error",
      });
    }
  };

  const handleAddTransaction = async () => {
    try {
      await addDebtTransaction(selectedPerson._id, {
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount),
        description: transactionForm.description,
        accountId: transactionForm.accountId || null,
      });
      setSnackbar({
        open: true,
        message: "Transaction added!",
        severity: "success",
      });
      setTransactionDialogOpen(false);
      fetchData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error adding transaction",
        severity: "error",
      });
    }
  };

  const handleDeleteTransaction = async (personId, transactionId) => {
    if (window.confirm("Delete this transaction from debt history?")) {
      try {
        await deleteDebtTransaction(personId, transactionId);
        setSnackbar({
          open: true,
          message: "Transaction removed!",
          severity: "success",
        });
        fetchData();
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Error deleting transaction",
          severity: "error",
        });
      }
    }
  };

  const handleDeletePerson = async (id) => {
    if (window.confirm("Delete this person and all their debt history?")) {
      try {
        await deleteDebtPerson(id);
        setSnackbar({
          open: true,
          message: "Person deleted!",
          severity: "success",
        });
        fetchData();
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Error deleting person",
          severity: "error",
        });
      }
    }
  };

  const getBalanceDisplay = (person) => {
    const balance = person.balance;
    if (balance === 0)
      return { text: "Settled", color: "text.secondary", amount: 0 };
    if (balance > 0)
      return { text: "They owe you", color: "success.main", amount: balance };
    return {
      text: "You owe them",
      color: "error.main",
      amount: Math.abs(balance),
    };
  };

  const getTransactionIcon = (type) => {
    const found = transactionTypes.find((t) => t.value === type);
    return found?.icon || <SwapHoriz />;
  };

  const getTransactionLabel = (type) => {
    const found = transactionTypes.find((t) => t.value === type);
    return found?.label || type;
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
          Debt Tracker
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => handleOpenPersonDialog()}
        >
          Add Person
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "success.light",
                  color: "success.contrastText",
                }}
              >
                <TrendingUp />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Others Owe You
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: "success.main" }}
                >
                  ₹{summary.theyOwe?.total?.toLocaleString() || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary.theyOwe?.count || 0} people
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "error.light",
                  color: "error.contrastText",
                }}
              >
                <TrendingDown />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  You Owe Others
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: "error.main" }}
                >
                  ₹{summary.youOwe?.total?.toLocaleString() || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary.youOwe?.count || 0} people
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Persons List */}
      <Grid container spacing={3}>
        {persons.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ textAlign: "center", py: 6 }}>
              <PersonAdd
                sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
              />
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No people added yet
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => handleOpenPersonDialog()}
              >
                Add Your First Person
              </Button>
            </Card>
          </Grid>
        ) : (
          persons.map((person) => {
            const balanceInfo = getBalanceDisplay(person);
            const isExpanded = expandedPerson === person._id;

            return (
              <Grid size={{ xs: 12, md: 6 }} key={person._id}>
                <Card>
                  <CardContent>
                    {/* Person Header */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          {person.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{person.name}</Typography>
                          {person.phone && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {person.phone}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Chip
                        size="small"
                        label={
                          person.status === "settled"
                            ? "Settled"
                            : balanceInfo.text
                        }
                        color={
                          person.status === "settled"
                            ? "default"
                            : person.balance > 0
                            ? "success"
                            : "error"
                        }
                      />
                    </Box>

                    {/* Balance Display */}
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 600, color: balanceInfo.color, mb: 2 }}
                    >
                      ₹{balanceInfo.amount.toLocaleString()}
                    </Typography>

                    {person.notes && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {person.notes}
                      </Typography>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenTransactionDialog(person)}
                      >
                        Add Transaction
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenPersonDialog(person)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeletePerson(person._id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                      <Box sx={{ flex: 1 }} />
                      <IconButton
                        size="small"
                        onClick={() =>
                          setExpandedPerson(isExpanded ? null : person._id)
                        }
                      >
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>

                    {/* Transaction History */}
                    <Collapse in={isExpanded}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Transaction History ({person.transactions?.length || 0})
                      </Typography>
                      {person.transactions?.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No transactions yet
                        </Typography>
                      ) : (
                        <List dense disablePadding>
                          {person.transactions
                            ?.slice()
                            .reverse()
                            .map((tx) => (
                              <ListItem
                                key={tx._id}
                                disableGutters
                                secondaryAction={
                                  <IconButton
                                    edge="end"
                                    size="small"
                                    onClick={() =>
                                      handleDeleteTransaction(
                                        person._id,
                                        tx._id
                                      )
                                    }
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                }
                              >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  {getTransactionIcon(tx.type)}
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography variant="body2">
                                      {getTransactionLabel(tx.type)}: ₹
                                      {tx.amount.toLocaleString()}
                                      {tx.linkedTransaction && (
                                        <Chip
                                          size="small"
                                          label="In Txns"
                                          sx={{ ml: 1 }}
                                          variant="outlined"
                                        />
                                      )}
                                    </Typography>
                                  }
                                  secondary={
                                    <>
                                      {tx.description && `${tx.description} • `}
                                      {new Date(tx.date).toLocaleDateString()}
                                    </>
                                  }
                                />
                              </ListItem>
                            ))}
                        </List>
                      )}
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* Add/Edit Person Dialog */}
      <Dialog
        open={personDialogOpen}
        onClose={() => setPersonDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingPerson ? "Edit Person" : "Add Person"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={personForm.name}
              onChange={(e) => {
                const value = e.target.value;
                setPersonForm({ ...personForm, name: value });
                setPersonErrors({
                  ...personErrors,
                  name: validatePersonName(value),
                });
              }}
              placeholder="e.g., NKS, John Doe"
              error={!!personErrors.name}
              helperText={personErrors.name}
            />
            <TextField
              fullWidth
              label="Phone (Optional)"
              value={personForm.phone}
              onChange={(e) => {
                const value = e.target.value;
                setPersonForm({ ...personForm, phone: value });
                setPersonErrors({
                  ...personErrors,
                  phone: validatePhone(value),
                });
              }}
              placeholder="10 digit number"
              error={!!personErrors.phone}
              helperText={personErrors.phone}
            />
            <TextField
              fullWidth
              label="Notes (Optional)"
              value={personForm.notes}
              onChange={(e) =>
                setPersonForm({ ...personForm, notes: e.target.value })
              }
              placeholder="Any notes about this person"
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPersonDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSavePerson}
            disabled={!isPersonFormValid}
          >
            {editingPerson ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog
        open={transactionDialogOpen}
        onClose={() => setTransactionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Transaction with {selectedPerson?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Transaction Type</InputLabel>
              <Select
                value={transactionForm.type}
                label="Transaction Type"
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    type: e.target.value,
                  })
                }
              >
                {transactionTypes.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {t.icon}
                      <Box>
                        <Typography>{t.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={transactionForm.amount}
              onChange={(e) => {
                const value = e.target.value;
                setTransactionForm({
                  ...transactionForm,
                  amount: value,
                });
                setTxAmountError(validateTxAmount(value));
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
              error={!!txAmountError}
              helperText={txAmountError}
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              value={transactionForm.description}
              onChange={(e) =>
                setTransactionForm({
                  ...transactionForm,
                  description: e.target.value,
                })
              }
              placeholder="What was this for?"
            />
            <FormControl fullWidth>
              <InputLabel>Link to Account (Optional)</InputLabel>
              <Select
                value={transactionForm.accountId}
                label="Link to Account (Optional)"
                onChange={(e) =>
                  setTransactionForm({
                    ...transactionForm,
                    accountId: e.target.value,
                  })
                }
              >
                <MenuItem value="">
                  <em>Don't link to main transactions</em>
                </MenuItem>
                {accounts.map((acc) => (
                  <MenuItem key={acc._id} value={acc._id}>
                    {acc.name} (₹{acc.balance?.toLocaleString() || 0})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Alert severity="info">
              If you link to an account, this will also appear in your main
              Transactions and update the account balance.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setTransactionDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddTransaction}
            disabled={!isTxFormValid}
          >
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <AnimatedSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default DebtsPage;
