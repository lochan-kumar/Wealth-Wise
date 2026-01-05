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
  alpha,
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
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";
import AddTransactionDialog from "./AddTransactionDialog";

const drawerWidthExpanded = 260;
const drawerWidthCollapsed = 72;

const menuItems = [
  {
    text: "Dashboard",
    icon: <Dashboard />,
    path: "/dashboard",
    color: "#10b981",
  },
  {
    text: "Transactions",
    icon: <Receipt />,
    path: "/dashboard/transactions",
    color: "#f59e0b",
  },
  {
    text: "Budgets",
    icon: <Savings />,
    path: "/dashboard/budgets",
    color: "#8b5cf6",
  },
  {
    text: "Accounts",
    icon: <AccountBalance />,
    path: "/dashboard/accounts",
    color: "#3b82f6",
  },
  { text: "Goals", icon: <Flag />, path: "/dashboard/goals", color: "#ec4899" },
  {
    text: "Recurring",
    icon: <Repeat />,
    path: "/dashboard/recurring",
    color: "#14b8a6",
  },
  {
    text: "Debts",
    icon: <Handshake />,
    path: "/dashboard/debts",
    color: "#f97316",
  },
  {
    text: "Profile",
    icon: <Person />,
    path: "/dashboard/profile",
    color: "#6366f1",
  },
];

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  const [mobileOpen, setMobileOpen] = useState(false);
  // Persist sidebar state in localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });
  const [anchorEl, setAnchorEl] = useState(null);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  const drawerWidth = sidebarCollapsed
    ? drawerWidthCollapsed
    : drawerWidthExpanded;

  // Hide FAB on transactions page
  const showFab = location.pathname !== "/dashboard/transactions";

  // Add Transaction Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const isDark = theme.palette.mode === "dark";

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar
        sx={{ justifyContent: sidebarCollapsed ? "center" : "flex-start" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer",
            transition: "transform 0.2s",
            "&:hover": {
              transform: "scale(1.02)",
            },
          }}
          onClick={() => navigate("/")}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(251, 191, 36, 0.4)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 512 512"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M256 128L360 216L256 400L152 216L256 128Z"
                fill="black"
                fillOpacity="0.2"
              />
              <path
                d="M256 148L340 226L256 380L172 226L256 148Z"
                fill="black"
              />
              <path d="M256 148L340 226L256 266L256 148Z" fill="#78350F" />
              <path d="M172 226L256 148L256 266L172 226Z" fill="#92400E" />
            </svg>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.5px",
              opacity: sidebarCollapsed ? 0 : 1,
              width: sidebarCollapsed ? 0 : "auto",
              overflow: "hidden",
              whiteSpace: "nowrap",
              transition: "opacity 0.3s ease-in-out, width 0.3s ease-in-out",
            }}
          >
            WealthWise
          </Typography>
        </Box>
      </Toolbar>
      <Divider
        sx={{
          borderColor: isDark
            ? alpha("#ffffff", 0.1)
            : "rgba(5, 150, 105, 0.25)",
          borderWidth: 1.5,
        }}
      />
      <List sx={{ flex: 1, px: sidebarCollapsed ? 1 : 2, py: 1 }}>
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
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                px: sidebarCollapsed ? 1.5 : 2,
                color: isDark ? "#f8fafc" : "#334155",
                "&:hover": {
                  bgcolor: isDark
                    ? alpha("#ffffff", 0.1)
                    : alpha("#000000", 0.05),
                },
                "&.Mui-selected": {
                  bgcolor: `${item.color}20`,
                  color: item.color,
                  "&:hover": { bgcolor: `${item.color}30` },
                },
              }}
              title={sidebarCollapsed ? item.text : ""}
            >
              <ListItemIcon
                sx={{
                  minWidth: sidebarCollapsed ? 0 : 40,
                  color:
                    location.pathname === item.path ? item.color : item.color,
                  mr: sidebarCollapsed ? 0 : 1.5,
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: `${item.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  opacity: sidebarCollapsed ? 0 : 1,
                  width: sidebarCollapsed ? 0 : "auto",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  transition:
                    "opacity 0.3s ease-in-out, width 0.3s ease-in-out",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider
        sx={{
          borderColor: isDark
            ? alpha("#ffffff", 0.1)
            : "rgba(5, 150, 105, 0.25)",
          borderWidth: 1.5,
        }}
      />
      <Box sx={{ p: sidebarCollapsed ? 1 : 2 }}>
        {/* Theme Toggle */}
        <ListItemButton
          onClick={toggleTheme}
          sx={{
            borderRadius: 2,
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
            px: sidebarCollapsed ? 1.5 : 2,
            mb: 1,
            color: isDark ? "#f8fafc" : "#334155",
            "&:hover": {
              bgcolor: isDark ? alpha("#ffffff", 0.1) : alpha("#000000", 0.05),
            },
          }}
          title={
            sidebarCollapsed
              ? mode === "dark"
                ? "Light Mode"
                : "Dark Mode"
              : ""
          }
        >
          <ListItemIcon
            sx={{
              minWidth: sidebarCollapsed ? 0 : 40,
              mr: sidebarCollapsed ? 0 : 1.5,
              color: isDark ? "#fbbf24" : "#6366f1",
            }}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: isDark
                  ? "rgba(251, 191, 36, 0.15)"
                  : "rgba(99, 102, 241, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {mode === "dark" ? <LightMode /> : <DarkMode />}
            </Box>
          </ListItemIcon>
          <ListItemText
            primary={mode === "dark" ? "Light Mode" : "Dark Mode"}
            sx={{
              opacity: sidebarCollapsed ? 0 : 1,
              width: sidebarCollapsed ? 0 : "auto",
              overflow: "hidden",
              whiteSpace: "nowrap",
              transition: "opacity 0.3s ease-in-out, width 0.3s ease-in-out",
            }}
          />
        </ListItemButton>

        {/* Collapse Toggle - Desktop only */}
        {!isMobile && (
          <ListItemButton
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            sx={{
              borderRadius: 2,
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              px: sidebarCollapsed ? 1.5 : 2,
              color: isDark ? "#f8fafc" : "#334155",
              "&:hover": {
                bgcolor: isDark
                  ? alpha("#ffffff", 0.1)
                  : alpha("#000000", 0.05),
              },
            }}
            title={sidebarCollapsed ? "Expand Sidebar" : ""}
          >
            <ListItemIcon
              sx={{
                minWidth: sidebarCollapsed ? 0 : 40,
                mr: sidebarCollapsed ? 0 : 1.5,
                color: "#64748b",
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "rgba(100, 116, 139, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
              </Box>
            </ListItemIcon>
            <ListItemText
              primary="Collapse"
              sx={{
                opacity: sidebarCollapsed ? 0 : 1,
                width: sidebarCollapsed ? 0 : "auto",
                overflow: "hidden",
                whiteSpace: "nowrap",
                transition: "opacity 0.3s ease-in-out, width 0.3s ease-in-out",
              }}
            />
          </ListItemButton>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dashboard content wrapper */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          position: "relative",
        }}
      >
        {/* Gradient Background */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
            background: isDark
              ? "linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #0f172a 100%)"
              : "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f8fafc 100%)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: isDark
                ? "radial-gradient(ellipse at 20% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(245, 158, 11, 0.12) 0%, transparent 50%)"
                : "radial-gradient(ellipse at 20% 80%, rgba(5, 150, 105, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)",
              animation: "pulse 15s ease-in-out infinite",
            },
            "@keyframes pulse": {
              "0%, 100%": { transform: "translate(0, 0)" },
              "50%": { transform: "translate(-5%, -5%)" },
            },
          }}
        />

        {/* Floating Orbs */}
        <Box
          sx={{
            position: "fixed",
            top: "10%",
            right: "10%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: isDark
              ? "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(5, 150, 105, 0.15) 0%, transparent 70%)",
            filter: "blur(20px)",
            animation: "float 8s ease-in-out infinite",
            zIndex: 0,
            pointerEvents: "none",
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0)" },
              "50%": { transform: "translateY(-30px)" },
            },
          }}
        />
        <Box
          sx={{
            position: "fixed",
            bottom: "20%",
            left: "30%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: isDark
              ? "radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)",
            filter: "blur(15px)",
            animation: "float 10s ease-in-out infinite reverse",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            bgcolor: isDark
              ? alpha("#1e293b", 0.8)
              : "rgba(240, 253, 244, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            color: isDark ? "#f8fafc" : "#1e293b",
            borderBottom: `3px solid ${
              isDark ? alpha("#ffffff", 0.1) : "rgba(5, 150, 105, 0.25)"
            }`,
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
              {menuItems.find((item) => item.path === location.pathname)
                ?.text || "Dashboard"}
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
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                borderRadius: 0,
                bgcolor: isDark
                  ? alpha("#1e293b", 0.95)
                  : "rgba(240, 253, 244, 0.95)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRight: `3px solid ${
                  isDark ? alpha("#ffffff", 0.1) : "rgba(5, 150, 105, 0.25)"
                }`,
              },
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
                borderRadius: 0,
                bgcolor: isDark
                  ? alpha("#1e293b", 0.8)
                  : "rgba(240, 253, 244, 0.85)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRight: `3px solid ${
                  isDark ? alpha("#ffffff", 0.1) : "rgba(5, 150, 105, 0.25)"
                }`,
                transition: "width 0.3s ease-in-out",
                overflowX: "hidden",
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
            bgcolor: "transparent",
            minHeight: "calc(100vh - 64px)",
            position: "relative",
            zIndex: 1,
            transition: "width 0.3s ease-in-out, margin 0.3s ease-in-out",
          }}
        >
          <Outlet />
        </Box>

        {/* Global FAB for Quick Add */}
        {showFab && (
          <Fab
            color="primary"
            aria-label="add transaction"
            sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1200 }}
            onClick={() => setDialogOpen(true)}
          >
            <Add />
          </Fab>
        )}

        {/* Add Transaction Dialog */}
        <AddTransactionDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => window.location.reload()}
        />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
