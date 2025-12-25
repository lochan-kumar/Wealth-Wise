import { createTheme, alpha } from "@mui/material/styles";

// Professional color palette - clean and trustworthy
const colors = {
  primary: "#1a56db", // Deep professional blue
  secondary: "#6b7280", // Neutral gray
  success: "#059669", // Confident green
  error: "#dc2626", // Clear red
  warning: "#d97706", // Warm amber
};

// Light theme - Clean, minimal, professional
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: colors.primary,
      light: "#3b82f6",
      dark: "#1e40af",
      contrastText: "#ffffff",
    },
    secondary: {
      main: colors.secondary,
      light: "#9ca3af",
      dark: "#4b5563",
    },
    success: {
      main: colors.success,
      light: "#10b981",
      dark: "#047857",
    },
    error: {
      main: colors.error,
      light: "#ef4444",
      dark: "#b91c1c",
    },
    warning: {
      main: colors.warning,
      light: "#f59e0b",
      dark: "#b45309",
    },
    background: {
      default: "#f1f5f9",
      paper: "#f8fafc",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 700, color: "#111827" },
    h2: { fontWeight: 700, color: "#111827" },
    h3: { fontWeight: 600, color: "#111827" },
    h4: { fontWeight: 600, color: "#111827" },
    h5: { fontWeight: 600, color: "#111827" },
    h6: { fontWeight: 600, color: "#111827" },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f1f5f9",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          padding: "10px 20px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#ffffff",
        },
        elevation0: {
          boxShadow: "none",
        },
        elevation1: {
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
          border: "1px solid #e5e7eb",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#111827",
          boxShadow: "none",
          borderBottom: "1px solid #e5e7eb",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e5e7eb",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          backgroundColor: "#ffffff",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)",
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "& fieldset": {
              borderColor: "#d1d5db",
              borderWidth: 1,
            },
            "&:hover fieldset": {
              borderColor: "#9ca3af",
            },
            "&.Mui-focused fieldset": {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#d1d5db",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#9ca3af",
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
          backgroundColor: "#e5e7eb",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "2px 0",
          "&:hover": {
            backgroundColor: "#f3f4f6",
          },
          "&.Mui-selected": {
            backgroundColor: colors.primary,
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#1e40af",
            },
            "& .MuiListItemIcon-root": {
              color: "#ffffff",
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: "#f9fafb",
          color: "#374151",
        },
        root: {
          borderColor: "#e5e7eb",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#f9fafb",
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.primary,
          color: "#ffffff",
        },
      },
    },
  },
});

// Dark theme - Sleek, professional dark mode
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#9ca3af",
      light: "#d1d5db",
      dark: "#6b7280",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
    },
    divider: "#334155",
  },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0f172a",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          padding: "10px 20px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.3)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.2)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#1e293b",
        },
        elevation0: {
          boxShadow: "none",
        },
        elevation1: {
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.2)",
          border: "1px solid #334155",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e293b",
          color: "#f8fafc",
          boxShadow: "none",
          borderBottom: "1px solid #334155",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1e293b",
          borderRight: "1px solid #334155",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          backgroundColor: "#0f172a",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: "1.25rem",
          paddingBottom: 8,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
          "&:hover": {
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "& fieldset": {
              borderColor: "#475569",
            },
            "&:hover fieldset": {
              borderColor: "#64748b",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#3b82f6",
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#475569",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#64748b",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#3b82f6",
            borderWidth: 2,
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "& fieldset": {
              borderColor: "#475569",
            },
            "&:hover fieldset": {
              borderColor: "#64748b",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#3b82f6",
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
          backgroundColor: "#334155",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "2px 0",
          "&:hover": {
            backgroundColor: "#334155",
          },
          "&.Mui-selected": {
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#2563eb",
            },
            "& .MuiListItemIcon-root": {
              color: "#ffffff",
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: "#1e293b",
          color: "#e2e8f0",
        },
        root: {
          borderColor: "#334155",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#334155",
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: "#3b82f6",
          color: "#ffffff",
        },
      },
    },
  },
});
