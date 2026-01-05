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
  Grid,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Add,
  AccountBalance,
  Delete,
  CheckCircle,
  Link as LinkIcon,
  Edit,
} from "@mui/icons-material";
import {
  getAccounts,
  getAvailableBanks,
  linkBankAccount,
  unlinkAccount,
  updateAccountBalance,
} from "../services/api";
import { useToast } from "../context/ToastContext";

const AccountsPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [accounts, setAccounts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cashDialogOpen, setCashDialogOpen] = useState(false);
  const [cashBalance, setCashBalance] = useState("");
  const toast = useToast();

  const [form, setForm] = useState({
    bankName: "",
    accountNumber: "",
  });

  // Validation error
  const [accountError, setAccountError] = useState("");

  // Validation function
  const validateAccountNumber = (value) => {
    if (value && !/^\d+$/.test(value))
      return "Account number must contain only digits";
    if (value && value.length < 8)
      return "Account number must be at least 8 digits";
    return "";
  };

  // Check if form is valid
  const isFormValid = form.bankName && form.accountNumber && !accountError;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accRes, banksRes] = await Promise.all([
        getAccounts(),
        getAvailableBanks(),
      ]);
      setAccounts(accRes.data.data);
      setBanks(banksRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setForm({ bankName: "", accountNumber: "" });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const res = await linkBankAccount(form.bankName, form.accountNumber);
      toast.success(
        `Bank linked! ${res.data.data.transactionsImported} transactions imported.`
      );
      handleCloseDialog();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error linking bank");
    }
  };

  const handleUnlink = async (id) => {
    if (window.confirm("Unlink this bank account?")) {
      try {
        await unlinkAccount(id);
        toast.success("Account unlinked!");
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Error unlinking account");
      }
    }
  };

  const handleOpenCashDialog = () => {
    setCashBalance(cashAccount?.balance?.toString() || "0");
    setCashDialogOpen(true);
  };

  const handleCloseCashDialog = () => {
    setCashDialogOpen(false);
  };

  const handleUpdateCashBalance = async () => {
    try {
      const balance = parseFloat(cashBalance) || 0;
      await updateAccountBalance(cashAccount._id, balance);
      toast.success("Cash balance updated!");
      handleCloseCashDialog();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating balance");
    }
  };

  const cashAccount = accounts.find((a) => a.type === "cash");
  const bankAccounts = accounts.filter((a) => a.type === "bank");

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
          Accounts
        </Typography>
        <Button
          variant="contained"
          startIcon={<LinkIcon />}
          onClick={handleOpenDialog}
        >
          Link Bank Account
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Cash Account */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                💵 Cash Account
                <Chip label="Default" size="small" color="primary" />
              </Typography>
              {cashAccount ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "success.light",
                      color: "success.contrastText",
                    }}
                  >
                    <AccountBalance fontSize="large" />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{cashAccount.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      For cash transactions • Cannot be deleted
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, color: "success.main" }}
                    >
                      ₹{(cashAccount.balance || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Balance
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={handleOpenCashDialog}
                      sx={{ mt: 0.5 }}
                    >
                      Set Balance
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No cash account found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Bank Accounts */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🏦 Linked Bank Accounts
              </Typography>
              {bankAccounts.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    No bank accounts linked
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleOpenDialog}
                  >
                    Link Your First Bank
                  </Button>
                </Box>
              ) : (
                <List>
                  {bankAccounts.map((account, index) => (
                    <Box key={account._id}>
                      <ListItem>
                        <ListItemIcon>
                          <AccountBalance color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={account.name}
                          secondary={account.bankName}
                        />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, color: "success.main", mr: 2 }}
                        >
                          ₹{(account.balance || 0).toLocaleString()}
                        </Typography>
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleUnlink(account._id)}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < bankAccounts.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Info Card */}
        <Grid size={{ xs: 12 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>How bank linking works:</strong> When you link a bank
              account, we simulate fetching your recent transactions and import
              them automatically. You can then select this account when adding
              new transactions.
            </Typography>
          </Alert>
        </Grid>
      </Grid>

      {/* Link Bank Dialog */}
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
        <DialogTitle sx={{ fontWeight: 600 }}>Link Bank Account</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Bank</InputLabel>
              <Select
                value={form.bankName}
                label="Select Bank"
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              >
                {banks.map((bank) => (
                  <MenuItem key={bank} value={bank}>
                    {bank}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Account Number"
              value={form.accountNumber}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, accountNumber: value });
                setAccountError(validateAccountNumber(value));
              }}
              placeholder="Enter your account number (min 8 digits)"
              error={!!accountError}
              helperText={accountError}
            />
            <Alert severity="info" sx={{ mt: 1 }}>
              This is a simulation. Enter any account number to link and import
              dummy transactions.
            </Alert>
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
            Link Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Cash Balance Dialog */}
      <Dialog
        open={cashDialogOpen}
        onClose={handleCloseCashDialog}
        maxWidth="xs"
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
        <DialogTitle sx={{ fontWeight: 600 }}>Set Cash Balance</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Current Cash Balance"
              type="number"
              value={cashBalance}
              onChange={(e) => setCashBalance(e.target.value)}
              placeholder="Enter your current cash amount"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Enter the amount of cash you currently have. This will be your
              starting balance for cash transactions.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseCashDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateCashBalance}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            }}
          >
            Update Balance
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountsPage;
