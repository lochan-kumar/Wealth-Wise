import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  Receipt,
  AccountBalance,
  Savings,
  Flag,
  DarkMode,
  LightMode,
  Logout,
  Person,
  Add,
  Repeat,
  Handshake,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";
import { createTransaction, getAccounts } from "../services/api";
import AnimatedSnackbar from "./AnimatedSnackbar";
import { getISTDateTime } from "../utils/dateUtils";

const drawerWidth = 260;

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

const menuItems = [
  { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { text: "Transactions", icon: <Receipt />, path: "/dashboard/transactions" },
  { text: "Budgets", icon: <Savings />, path: "/dashboard/budgets" },
  { text: "Accounts", icon: <AccountBalance />, path: "/dashboard/accounts" },
  { text: "Goals", icon: <Flag />, path: "/dashboard/goals" },
  { text: "Recurring", icon: <Repeat />, path: "/dashboard/recurring" },
  { text: "Debts", icon: <Handshake />, path: "/dashboard/debts" },
  { text: "Profile", icon: <Person />, path: "/dashboard/profile" },
];

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Quick Add Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [form, setForm] = useState({
    account: "",
    type: "expense",
    amount: "",
    category: "Other",
    payee: "",
    description: "",
    date: getISTDateTime(),
  });

  // Hide FAB on transactions page
  const showFab = location.pathname !== "/dashboard/transactions";

  useEffect(() => {
    if (dialogOpen && accounts.length === 0) {
      fetchAccounts();
    }
  }, [dialogOpen]);

  const fetchAccounts = async () => {
    try {
      const res = await getAccounts();
      setAccounts(res.data.data);
      if (res.data.data.length > 0) {
        const defaultAcc =
          res.data.data.find((a) => a.isDefault) || res.data.data[0];
        setForm((prev) => ({ ...prev, account: defaultAcc._id }));
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const handleQuickAdd = async () => {
    try {
      await createTransaction({
        ...form,
        amount: parseFloat(form.amount),
      });
      setSnackbar({
        open: true,
        message: "Transaction added!",
        severity: "success",
      });
      setDialogOpen(false);
      setForm((prev) => ({
        ...prev,
        amount: "",
        payee: "",
        description: "",
        date: getISTDateTime(),
      }));
      // Trigger a page refresh by navigating to current location
      window.location.reload();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error adding transaction",
        severity: "error",
      });
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "primary.main", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          💰 WealthWise
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  "& .MuiListItemIcon-root": { color: "white" },
                  "&:hover": { bgcolor: "primary.dark" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={toggleTheme} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            {mode === "dark" ? <LightMode /> : <DarkMode />}
          </ListItemIcon>
          <ListItemText
            primary={mode === "dark" ? "Light Mode" : "Dark Mode"}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
          borderRadius: 0,
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems.find((item) => item.path === location.pathname)?.text ||
              "Dashboard"}
          </Typography>
          <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
            <Avatar
              sx={{
                bgcolor: "transparent",
                border: "2px solid",
                borderColor: "primary.main",
                color: "primary.main",
                width: 38,
                height: 38,
                fontWeight: 600,
                borderRadius: 1,
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: {
                mt: 1,
                boxShadow: 3,
                borderRadius: 1,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/dashboard/profile");
              }}
            >
              <Person sx={{ mr: 1.5 }} /> Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1.5 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth, borderRadius: 0 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              borderRight: "1px solid",
              borderColor: "divider",
              borderRadius: 0,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: "background.default",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Outlet />
      </Box>

      {/* Global FAB for Quick Add - hidden on Transactions page */}
      {showFab && (
        <Fab
          color="primary"
          aria-label="add transaction"
          sx={{ position: "fixed", bottom: 24, right: 24 }}
          onClick={() => setDialogOpen(true)}
        >
          <Add />
        </Fab>
      )}

      {/* Quick Add Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Quick Add Transaction</DialogTitle>
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
                    {acc.name}
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
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.category}
                label="Category"
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
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
              placeholder="Add notes about this transaction"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Date & Time"
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleQuickAdd}
            disabled={!form.amount || !form.account}
          >
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <AnimatedSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default DashboardLayout;
