import { useState, useEffect, useRef } from "react";
import { Snackbar, Alert, Slide } from "@mui/material";

// Slide transition from right
const SlideTransition = (props) => {
  return <Slide {...props} direction="left" />;
};

const AnimatedSnackbar = ({
  open,
  onClose,
  message,
  severity = "success",
  autoHideDuration = 3000,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);
  const remainingTimeRef = useRef(autoHideDuration);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (open && !isHovered) {
      // Start or resume timer
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        onClose();
      }, remainingTimeRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [open, isHovered, onClose]);

  useEffect(() => {
    // Reset remaining time when snackbar opens
    if (open) {
      remainingTimeRef.current = autoHideDuration;
    }
  }, [open, autoHideDuration]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Pause timer and calculate remaining time
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(
        remainingTimeRef.current - elapsed,
        500
      );
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Timer will resume via useEffect
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    remainingTimeRef.current = autoHideDuration;
    onClose();
  };

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        "& .MuiSnackbarContent-root": {
          transition: "all 0.3s ease",
        },
      }}
    >
      <Alert
        severity={severity}
        onClose={handleClose}
        sx={{
          width: "100%",
          boxShadow: 3,
          transition: "transform 0.2s ease",
          "&:hover": {
            transform: "scale(1.02)",
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AnimatedSnackbar;
