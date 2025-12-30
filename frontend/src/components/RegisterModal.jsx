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

// Validation regex patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const RegisterModal = ({ open, onClose, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Validation handlers
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (value && value.length < 2) {
      setNameError("Name must be at least 2 characters");
    } else if (value && value.length > 50) {
      setNameError("Name must be less than 50 characters");
    } else {
      setNameError("");
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value && !passwordRegex.test(value)) {
      setPasswordError(
        "8+ chars, 1 upper, 1 lower, 1 number, 1 special (@$!%*?&)"
      );
    } else {
      setPasswordError("");
    }
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value && value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  // Check if form is valid
  const isFormValid =
    name &&
    email &&
    password &&
    confirmPassword &&
    !nameError &&
    !emailError &&
    !passwordError &&
    !confirmPasswordError &&
    password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isFormValid) return;

    setLoading(true);
    const result = await register(name, email, password);

    if (result.success) {
      onClose();
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
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
            Create Account
          </Typography>
          <Typography sx={{ color: isDark ? "#94a3b8" : "#374151" }}>
            Start your financial journey today
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
            label="Full Name"
            value={name}
            onChange={handleNameChange}
            required
            error={!!nameError}
            helperText={nameError}
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
            onChange={handlePasswordChange}
            required
            error={!!passwordError}
            helperText={
              passwordError || "8+ chars, 1 upper, 1 lower, 1 number, 1 special"
            }
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
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
            error={!!confirmPasswordError}
            helperText={confirmPasswordError}
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
              "& .MuiFormHelperText-root": {
                color: isDark ? "#94a3b8" : "#374151",
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
            {loading ? <CircularProgress size={24} /> : "Create Account"}
          </Button>
        </form>

        <Typography
          textAlign="center"
          sx={{ color: isDark ? "#94a3b8" : "#374151" }}
        >
          Already have an account?{" "}
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
              onSwitchToLogin();
            }}
          >
            Sign In
          </Box>
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;
