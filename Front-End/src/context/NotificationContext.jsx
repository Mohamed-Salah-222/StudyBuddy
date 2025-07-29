import { createContext, useState, useContext, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();

  // Toast notifications
  const [notification, setNotification] = useState(null);

  // Reminder notifications
  const [reminderNotifications, setReminderNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastChecked, setLastChecked] = useState(new Date());

  // Replace localStorage with React state
  const [readNotifications, setReadNotifications] = useState([]);

  // Show toast notification
  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  // Fetch reminders from your existing API
  const fetchReminderNotifications = useCallback(async () => {
    if (!token || !user) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reminder`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reminders = await response.json();

      // Filter for recently notified reminders (last 24 hours) to show as notifications
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const recentNotifications = reminders.filter((reminder) => reminder.notified && new Date(reminder.updatedAt) > last24Hours && new Date(reminder.updatedAt) > lastChecked);

      // Show toast for new notifications since last check
      if (recentNotifications.length > 0) {
        recentNotifications.forEach((reminder) => {
          showNotification(`⏰ Reminder: ${reminder.title}`, "info");
        });
      }

      // Set all recently notified reminders as notification items
      const notificationItems = reminders
        .filter((reminder) => reminder.notified)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 20) // Keep last 20 notifications
        .map((reminder) => ({
          _id: reminder._id,
          title: reminder.title,
          message: `Reminder: ${reminder.title}`,
          dueTime: reminder.dueDateTime,
          type: reminder.type,
          isRead: readNotifications.includes(reminder._id), // Use state instead of localStorage
          createdAt: reminder.updatedAt, // Use updatedAt as notification time
          reminderId: reminder._id,
        }));

      setReminderNotifications(notificationItems);

      // Count unread notifications (those not in readNotifications state)
      const unreadItems = notificationItems.filter((item) => !readNotifications.includes(item._id));
      setUnreadCount(unreadItems.length);

      setLastChecked(new Date());
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  }, [token, user, lastChecked, showNotification, readNotifications]);

  // Mark notification as read (using React state instead of localStorage)
  const markAsRead = useCallback(async (notificationId) => {
    try {
      setReadNotifications((prev) => {
        if (!prev.includes(notificationId)) {
          const updated = [...prev, notificationId];

          // Update the notification item to mark as read
          setReminderNotifications((prevNotifs) => prevNotifs.map((notif) => (notif._id === notificationId ? { ...notif, isRead: true } : notif)));

          // Decrease unread count
          setUnreadCount((prevCount) => Math.max(0, prevCount - 1));

          return updated;
        }
        return prev;
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const allNotificationIds = reminderNotifications.map((notif) => notif._id);
      setReadNotifications(allNotificationIds);

      setReminderNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, [reminderNotifications]);

  // Clear old notifications (older than 7 days) from state
  const clearOldNotifications = useCallback(() => {
    try {
      const currentNotificationIds = reminderNotifications.map((notif) => notif._id);

      // Keep only read status for current notifications
      setReadNotifications((prev) => prev.filter((id) => currentNotificationIds.includes(id)));
    } catch (error) {
      console.error("Error clearing old notifications:", error);
    }
  }, [reminderNotifications]);

  // Reset notifications when user changes
  useEffect(() => {
    if (!user || !token) {
      setReminderNotifications([]);
      setUnreadCount(0);
      setReadNotifications([]);
      return;
    }
  }, [user, token]);

  // Auto-fetch notifications every 30 seconds when user is active
  useEffect(() => {
    if (!user || !token) {
      return;
    }

    // Initial fetch
    fetchReminderNotifications();

    // Set up interval for periodic checking (every 1 minute for reminders)
    const interval = setInterval(fetchReminderNotifications, 60000); // 1 minute

    // Clean up old notifications daily
    const dailyCleanup = setInterval(clearOldNotifications, 24 * 60 * 60 * 1000); // 24 hours

    return () => {
      clearInterval(interval);
      clearInterval(dailyCleanup);
    };
  }, [user, token, fetchReminderNotifications, clearOldNotifications]);

  // Listen for page visibility changes to fetch when user returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user && token) {
        fetchReminderNotifications();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchReminderNotifications, user, token]);

  const value = {
    // Toast notifications
    notification,
    showNotification,

    // Reminder notifications
    reminderNotifications,
    unreadCount,
    fetchReminderNotifications,
    markAsRead,
    markAllAsRead,
    clearOldNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
