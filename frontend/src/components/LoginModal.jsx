import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  alpha,
  useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginModal = ({ open, onClose, onSwitchToRegister }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Validate email on change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  // Check if form is valid
  const isFormValid = email && password && !emailError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      onClose();
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setError("");
    setEmailError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "transparent",
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: isDark
            ? "rgba(15, 23, 42, 0.5)"
            : "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${
            isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
          }`,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogContent sx={{ p: 4, position: "relative" }}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: isDark ? "#94a3b8" : "#374151",
          }}
        >
          <Close />
        </IconButton>

        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 1,
              color: isDark ? "#f8fafc" : "#111827",
            }}
          >
            Welcome Back
          </Typography>
          <Typography sx={{ color: isDark ? "#94a3b8" : "#374151" }}>
            Sign in to continue managing your finances
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
            error={!!emailError}
            helperText={emailError}
            sx={{
              mb: 2,
              "& .MuiInputLabel-root": {
                color: isDark ? "#94a3b8" : "#1f2937",
              },
              "& .MuiOutlinedInput-root": {
                color: isDark ? "#f8fafc" : "#111827",
                "& fieldset": {
                  borderColor: isDark
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.3)",
                },
              },
              "& .MuiFormHelperText-root": {
                color: isDark ? "#94a3b8" : "#374151",
              },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              mb: 3,
              "& .MuiInputLabel-root": {
                color: isDark ? "#94a3b8" : "#1f2937",
              },
              "& .MuiOutlinedInput-root": {
                color: isDark ? "#f8fafc" : "#111827",
                "& fieldset": {
                  borderColor: isDark
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.3)",
                },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || !isFormValid}
            sx={{ py: 1.5, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Sign In"}
          </Button>
        </form>

        <Typography
          textAlign="center"
          sx={{ color: isDark ? "#94a3b8" : "#374151" }}
        >
          Don't have an account?{" "}
          <Box
            component="span"
            sx={{
              color: "primary.main",
              fontWeight: 600,
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={() => {
              handleClose();
              onSwitchToRegister();
            }}
          >
            Sign Up
          </Box>
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
