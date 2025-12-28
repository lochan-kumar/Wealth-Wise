import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  alpha,
  useTheme,
  Box,
} from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { useThemeMode } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useThemeMode();
  const { user } = useAuth();
  const theme = useTheme();

  const isLandingPage = location.pathname === "/";
  const isDark = mode === "dark";

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        ...(isLandingPage && {
          background: alpha(isDark ? "#1e293b" : "#ffffff", 0.1),
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${alpha(
            isDark ? "#ffffff" : "#000000",
            0.1
          )}`,
        }),
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexGrow: 1,
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
            variant="h5"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.5px",
            }}
          >
            WealthWise
          </Typography>
        </Box>
        <IconButton
          onClick={toggleTheme}
          sx={{
            mr: 2,
            color: isLandingPage ? (isDark ? "#ffffff" : "#1e293b") : undefined,
            "&:hover": {
              backgroundColor: isLandingPage
                ? alpha(isDark ? "#ffffff" : "#000000", 0.1)
                : undefined,
            },
          }}
        >
          {mode === "dark" ? <LightMode /> : <DarkMode />}
        </IconButton>
        {user ? (
          <Button
            variant="contained"
            onClick={() => navigate("/dashboard")}
            sx={{
              ...(isLandingPage && {
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                color: "#000",
                fontWeight: 600,
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)",
                },
              }),
            }}
          >
            Go to Dashboard
          </Button>
        ) : (
          <>
            <Button
              onClick={() => navigate("/login")}
              sx={{
                mr: 1,
                color: isLandingPage
                  ? isDark
                    ? "#ffffff"
                    : "#1e293b"
                  : undefined,
                "&:hover": {
                  backgroundColor: isLandingPage
                    ? alpha(isDark ? "#ffffff" : "#000000", 0.1)
                    : undefined,
                },
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate("/register")}
              sx={{
                ...(isLandingPage && {
                  background:
                    "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  color: "#000",
                  fontWeight: 600,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)",
                  },
                }),
              }}
            >
              Get Started
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
