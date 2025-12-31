import { createTheme, alpha } from "@mui/material/styles";

// Professional color palette - Emerald + Gold + Slate
const colors = {
  primary: "#059669", // Emerald green - trust, growth, prosperity
  secondary: "#475569", // Slate gray - professionalism
  success: "#22c55e", // Bright green
  error: "#dc2626", // Clear red
  warning: "#f59e0b", // Amber gold
  accent: "#f59e0b", // Gold accent for branding
};

// Light theme - Clean, minimal, professional
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: colors.primary,
      light: "#10b981",
      dark: "#047857",
      contrastText: "#ffffff",
    },
    secondary: {
      main: colors.secondary,
      light: "#64748b",
      dark: "#334155",
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
      default: "transparent",
      paper: "rgba(240, 253, 244, 0.85)",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
    divider: "rgba(0, 0, 0, 0.1)",
  },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 700, color: "#1e293b" },
    h2: { fontWeight: 700, color: "#1e293b" },
    h3: { fontWeight: 600, color: "#1e293b" },
    h4: { fontWeight: 600, color: "#1e293b" },
    h5: { fontWeight: 600, color: "#1e293b" },
    h6: { fontWeight: 600, color: "#1e293b" },
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
          borderRadius: 16,
          background:
            "linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(16, 185, 129, 0.04) 50%, rgba(255, 255, 255, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderLeft: "4px solid #10b981",
          boxShadow:
            "0 4px 30px rgba(5, 150, 105, 0.12), inset 0 0 60px rgba(16, 185, 129, 0.05)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow:
              "0 12px 40px rgba(5, 150, 105, 0.18), inset 0 0 60px rgba(16, 185, 129, 0.08)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background:
            "linear-gradient(135deg, rgba(240, 253, 244, 0.9) 0%, rgba(236, 253, 245, 0.85) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        },
        elevation0: {
          boxShadow: "none",
        },
        elevation1: {
          boxShadow: "0 4px 20px 0 rgba(5, 150, 105, 0.08)",
          border: "1px solid rgba(5, 150, 105, 0.25)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(240, 253, 244, 0.95)",
          color: "#111827",
          boxShadow: "none",
          borderBottom: "1px solid rgba(5, 150, 105, 0.1)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background:
            "linear-gradient(180deg, rgba(240, 253, 244, 0.98) 0%, rgba(236, 253, 245, 0.95) 100%)",
          borderRight: "1px solid rgba(5, 150, 105, 0.1)",
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
            color: "#1e293b",
            "& fieldset": {
              borderColor: "rgba(0, 0, 0, 0.2)",
              borderWidth: 1,
            },
            "&:hover fieldset": {
              borderColor: "rgba(0, 0, 0, 0.3)",
            },
            "&.Mui-focused fieldset": {
              borderWidth: 2,
              borderColor: "#059669",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#64748b",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#059669",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          color: "#1e293b",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.2)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.3)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#059669",
          },
        },
        icon: {
          color: "#64748b",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#64748b",
          "&.Mui-focused": {
            color: "#059669",
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
          backgroundColor: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "2px 0",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
          "&.Mui-selected": {
            backgroundColor: colors.primary,
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#047857",
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
          backgroundColor: "rgba(0, 0, 0, 0.03)",
          color: "#374151",
        },
        root: {
          borderColor: "rgba(0, 0, 0, 0.08)",
          color: "#1e293b",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.02)",
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
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#94a3b8",
      light: "#cbd5e1",
      dark: "#64748b",
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
          borderRadius: 16,
          background:
            "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.03) 50%, rgba(30, 41, 59, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderLeft: "4px solid #10b981",
          boxShadow:
            "0 4px 30px rgba(0, 0, 0, 0.4), inset 0 0 60px rgba(16, 185, 129, 0.05)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow:
              "0 12px 40px rgba(0, 0, 0, 0.5), inset 0 0 60px rgba(16, 185, 129, 0.1)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "rgba(30, 41, 59, 0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        },
        elevation0: {
          boxShadow: "none",
        },
        elevation1: {
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
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
              borderColor: "#10b981",
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
            borderColor: "#10b981",
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
              borderColor: "#10b981",
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
            backgroundColor: "#10b981",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#059669",
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
          backgroundColor: "#10b981",
          color: "#ffffff",
        },
      },
    },
  },
});
