import { useState } from "react";
import {
  Box,
  IconButton,
  Badge,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  useTheme,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Notifications,
  NotificationsActive,
  GroupAdd,
  Check,
  Close,
  Warning,
  ErrorOutline,
  AttachMoney,
  PersonRemove,
  Delete,
  MarkEmailRead,
} from "@mui/icons-material";
import { useNotifications } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const getNotificationIcon = (type) => {
  switch (type) {
    case "group_invite":
      return <GroupAdd color="primary" />;
    case "invite_accepted":
      return <Check color="success" />;
    case "invite_declined":
      return <Close color="error" />;
    case "expense_added":
      return <AttachMoney color="info" />;
    case "budget_alert":
      return <Warning color="warning" />;
    case "budget_exceeded":
      return <ErrorOutline color="error" />;
    case "member_left":
      return <PersonRemove color="warning" />;
    case "group_deleted":
      return <Delete color="error" />;
    default:
      return <Notifications color="action" />;
  }
};

const NotificationDropdown = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllRead,
    refresh,
  } = useNotifications();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    refresh();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.data?.groupId) {
      navigate("/dashboard/split-groups");
    } else if (
      notification.type === "budget_alert" ||
      notification.type === "budget_exceeded"
    ) {
      navigate("/dashboard/budgets");
    }

    handleClose();
  };

  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "just now";
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          {unreadCount > 0 ? <NotificationsActive /> : <Notifications />}
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            borderRadius: 3,
            background: isDark
              ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            border: isDark
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(0,0,0,0.1)",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<MarkEmailRead />}
              onClick={markAllRead}
              sx={{ textTransform: "none" }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        {/* Notifications List */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Notifications
              sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
            />
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <List sx={{ py: 0, maxHeight: 380, overflow: "auto" }}>
            {notifications.map((notification, index) => (
              <Box key={notification._id}>
                <ListItem
                  alignItems="flex-start"
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    cursor: "pointer",
                    bgcolor: notification.read
                      ? "transparent"
                      : isDark
                      ? "rgba(59, 130, 246, 0.1)"
                      : "rgba(59, 130, 246, 0.05)",
                    "&:hover": {
                      bgcolor: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.02)",
                    },
                    py: 1.5,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: notification.read ? 400 : 600,
                            flex: 1,
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "primary.main",
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {formatTime(notification.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

export default NotificationDropdown;
