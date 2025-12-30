import { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert, Slide, Box } from "@mui/material";

// Generate unique ID
let toastId = 0;
const generateId = () => ++toastId;

// Slide transition from right
const SlideTransition = (props) => {
  return <Slide {...props} direction="left" />;
};

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    (message, severity = "success", duration = 3000) => {
      const id = generateId();
      setToasts((prev) => [...prev, { id, message, severity, duration }]);
      return id;
    },
    []
  );

  const hideToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message, duration) => showToast(message, "success", duration),
    [showToast]
  );
  const error = useCallback(
    (message, duration) => showToast(message, "error", duration),
    [showToast]
  );
  const warning = useCallback(
    (message, duration) => showToast(message, "warning", duration),
    [showToast]
  );
  const info = useCallback(
    (message, duration) => showToast(message, "info", duration),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, hideToast, success, error, warning, info }}
    >
      {children}
      {/* Toast Container */}
      <Box
        sx={{
          position: "fixed",
          bottom: 80,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column-reverse", // New toasts appear at bottom
          gap: 1,
        }}
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </Box>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const [open, setOpen] = useState(true);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={toast.duration}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      sx={{
        position: "relative",
        bottom: "auto !important",
        right: "auto !important",
        left: "auto !important",
        top: "auto !important",
        transform: "none !important",
      }}
    >
      <Alert
        severity={toast.severity}
        onClose={handleClose}
        sx={{
          width: "100%",
          minWidth: 280,
          boxShadow: 3,
          transition: "transform 0.2s ease",
          "&:hover": {
            transform: "scale(1.02)",
          },
        }}
      >
        {toast.message}
      </Alert>
    </Snackbar>
  );
};

export default ToastProvider;
