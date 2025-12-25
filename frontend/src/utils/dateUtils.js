// Helper functions for Indian Standard Time (IST, UTC+05:30)

/**
 * Get current date/time in IST formatted for datetime-local input
 * @returns {string} Date string in format "YYYY-MM-DDTHH:MM"
 */
export const getISTDateTime = () => {
  const now = new Date();
  // IST is UTC + 5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  return istTime.toISOString().slice(0, 16);
};

/**
 * Get current date in IST formatted for date input
 * @returns {string} Date string in format "YYYY-MM-DD"
 */
export const getISTDate = () => {
  return getISTDateTime().slice(0, 10);
};

/**
 * Format a date to IST locale string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatISTDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format a date/time to IST locale string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date/time string
 */
export const formatISTDateTime = (date) => {
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
