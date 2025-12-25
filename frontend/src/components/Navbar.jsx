import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, IconButton } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { useThemeMode } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();
  const { user } = useAuth();

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar>
        <Typography
          variant="h5"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            color: "primary.main",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          💰 WealthWise
        </Typography>
        <IconButton onClick={toggleTheme} sx={{ mr: 2 }}>
          {mode === "dark" ? <LightMode /> : <DarkMode />}
        </IconButton>
        {user ? (
          <Button variant="contained" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        ) : (
          <>
            <Button onClick={() => navigate("/login")} sx={{ mr: 1 }}>
              Login
            </Button>
            <Button variant="contained" onClick={() => navigate("/register")}>
              Get Started
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
