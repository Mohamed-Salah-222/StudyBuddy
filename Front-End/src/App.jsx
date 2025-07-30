import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import HomePage from "./components/HomePage";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import GoogleAuthCallbackPage from "./components/GoogleAuthCallbackPage";
import VerifyPage from "./components/VerifyPage";
import TasksPage from "./components/TasksPage";
import StudyResourceCollector from "./components/StudyResourceCollector";
import Notification from "./components/Notification";
import ReminderPage from "./components/ReminderPage";
import DiscussionForum from "./components/DiscussionForum";
import DiscussionDetails from "./components/DiscussionDetails";

// Utility function for VAPID key conversion
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// VAPID Public Key - Replace with your actual key
const VAPID_PUBLIC_KEY = "BBjKbsfZi6e5QAP5Pf3mQaD7IOJ8JC_-seZvU-SQKsHQiiGjhsb-_jFKJHSeYck8uXrZI4JVSnmtzaXYA_YRylc";

function App() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  // State for notification bell and tasks
  const [urgentHighTasks, setUrgentHighTasks] = useState([]);
  const [taskNotificationCount, setTaskNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks"); // 'tasks' or 'reminders'
  const notificationsRef = useRef(null);

  // State for reminder notifications - now fetched from API
  const [reminderNotifications, setReminderNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDeletingReminder, setIsDeletingReminder] = useState(null);

  // State for sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sidebarRef = useRef(null);

  // State for push notifications
  const [pushNotificationEnabled, setPushNotificationEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState(Notification.permission);
  const [pushMessage, setPushMessage] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Define features
  const features = [
    {
      title: "Smart Todo List",
      description: "Organize your tasks with intelligent prioritization and deadline tracking",
      icon: "📝",
      link: "/todo",
      gradient: "linear-gradient(135deg, #52796f 0%, #84a98c 100%)",
    },
    {
      title: "Resources Planner",
      description: "Organize your Resources with intelligent prioritization and deadline tracking.",
      icon: "📚",
      link: "/resources",
      gradient: "linear-gradient(135deg, #84a98c 0%, #d4a574 100%)",
    },
    {
      title: "Reminder Section",
      description: "Never forget an important date or a deadline ever again.",
      icon: "⏲️",
      link: "/reminder",
      gradient: "linear-gradient(135deg, #d4a574 0%, #52796f 100%)",
    },
    {
      title: "Study Groups",
      description: "Connect with friends and peers for collaborative learning sessions.",
      icon: "👥",
      link: "/study-groups",
      gradient: "linear-gradient(135deg, #52796f 0%, #d4a574 100%)",
    },
    {
      title: "Discussion Forum",
      description: "Post questions and get help from our community of learners and experts.",
      icon: "💬",
      link: "/forum",
      gradient: "linear-gradient(135deg, #84a98c 0%, #52796f 100%)",
    },
    {
      title: "Study Calendar",
      description: "Track your study sessions, assignments, exams, and important dates.",
      icon: "📅",
      link: "/calendar",
      gradient: "linear-gradient(135deg, #d4a574 0%, #84a98c 100%)",
    },
  ];

  // Function to fetch tasks from the backend
  const fetchTasks = async () => {
    if (!token) {
      setUrgentHighTasks([]);
      setTaskNotificationCount(0);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error("Authentication failed or token expired. Logging out.");
          logout();
          navigate("/login");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tasks = await response.json();
      const filteredTasks = tasks.filter((task) => (task.priority === "Urgent" || task.priority === "High") && !task.completed);

      setUrgentHighTasks(filteredTasks);
      setTaskNotificationCount(filteredTasks.length);
    } catch (error) {
      console.error("Error fetching tasks for notifications:", error);
    }
  };

  // Function to fetch reminder notifications from API
  const fetchReminderNotifications = async () => {
    if (!token) {
      setReminderNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reminder`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error("Authentication failed or token expired. Logging out.");
          logout();
          navigate("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reminders = await response.json();

      // Transform the reminders to match the notification format
      const transformedReminders = reminders.map((reminder) => ({
        _id: reminder._id,
        title: reminder.title || reminder.subject || "Reminder",
        type: reminder.type || "reminder",
        dueTime: reminder.reminderTime || reminder.createdAt,
        isRead: reminder.notified || false, // Use notified field as read status
        createdAt: reminder.createdAt,
        description: reminder.description,
        originalReminder: reminder, // Keep reference to original reminder object
      }));

      setReminderNotifications(transformedReminders);

      // Count unread notifications (where notified is false)
      const unreadReminders = transformedReminders.filter((n) => !n.isRead);
      setUnreadCount(unreadReminders.length);
    } catch (error) {
      console.error("Error fetching reminder notifications:", error);
      setReminderNotifications([]);
      setUnreadCount(0);
    }
  };

  // Function to delete a reminder
  const deleteReminder = async (reminderId) => {
    if (!token) return;

    setIsDeletingReminder(reminderId);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reminder/${reminderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error("Authentication failed or token expired. Logging out.");
          logout();
          navigate("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove the reminder from local state
      setReminderNotifications((prev) => {
        const updated = prev.filter((reminder) => reminder._id !== reminderId);
        // Update unread count
        const unreadReminders = updated.filter((n) => !n.isRead);
        setUnreadCount(unreadReminders.length);
        return updated;
      });
    } catch (error) {
      console.error("Error deleting reminder:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsDeletingReminder(null);
    }
  };

  // Push notification subscription function
  const subscribeUser = async () => {
    setIsSubscribing(true);
    setPushMessage("");

    try {
      // Check for Service Worker and Push API support
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setPushMessage("Push notifications are not supported by your browser.");
        setIsSubscribing(false);
        return;
      }

      // Check if Notification API is available
      if (!("Notification" in window)) {
        setPushMessage("This browser does not support notifications.");
        setIsSubscribing(false);
        return;
      }

      // Register Service Worker
      console.log("Registering service worker...");
      const registration = await navigator.serviceWorker.register("/service-worker.js");
      console.log("Service Worker registered:", registration);

      // Request Notification Permission - Handle both callback and promise styles
      let currentPermission;
      if (typeof Notification.requestPermission === "function") {
        try {
          // Modern promise-based approach
          currentPermission = await Notification.requestPermission();
        } catch (error) {
          // Fallback to callback approach for older browsers
          currentPermission = await new Promise((resolve) => {
            Notification.requestPermission((permission) => {
              resolve(permission);
            });
          });
        }
      } else {
        setPushMessage("Notification permission request is not supported.");
        setIsSubscribing(false);
        return;
      }

      setPushPermission(currentPermission);

      if (currentPermission !== "granted") {
        setPushMessage("Notification permission denied. Cannot subscribe.");
        setIsSubscribing(false);
        return;
      }

      // Subscribe to Push Notifications
      console.log("Subscribing to push notifications...");
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      };
      const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
      console.log("Push Subscription:", pushSubscription);

      // Send Subscription to Backend
      console.log("Sending subscription to backend...");
      if (!token) {
        setPushMessage("Authentication token not found. Please log in.");
        setIsSubscribing(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pushSubscription),
      });

      if (response.ok) {
        setPushMessage("Successfully subscribed to push notifications!");
        setPushNotificationEnabled(true);
      } else {
        const errorData = await response.json();
        setPushMessage(`Failed to send subscription to backend: ${errorData.message || response.statusText}`);
        console.error("Backend subscription error:", errorData);
      }
    } catch (error) {
      console.error("Push notification setup failed:", error);
      setPushMessage(`Error during setup: ${error.message}`);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Handle push notification toggle
  const handlePushNotificationToggle = async () => {
    if (!pushNotificationEnabled) {
      await subscribeUser();
    } else {
      // Disable notifications (you might want to implement unsubscribe logic here)
      setPushNotificationEnabled(false);
      setPushMessage("Push notifications disabled.");
    }
  };

  // Handle notification item click
  const handleNotificationClick = async (notification) => {
    // You can add navigation logic here if needed
    console.log("Notification clicked:", notification);
  };

  // Mark notification as read (for compatibility - not used with API approach)
  const markAsRead = async (notificationId) => {
    // Since we're using the API approach, we don't need this function
    // but keeping it for compatibility
    console.log("Mark as read not implemented for API-based reminders");
  };

  // Handle mark all as read (for compatibility - not used with API approach)
  const handleMarkAllAsRead = async () => {
    // Since we're using the API approach, we don't need this function
    // but keeping it for compatibility
    console.log("Mark all as read not implemented for API-based reminders");
  };

  // Calculate total notification count
  const totalNotificationCount = taskNotificationCount + reminderNotifications.length;

  // Effect to fetch tasks and reminders when the component mounts or user/token changes
  useEffect(() => {
    fetchTasks();
    fetchReminderNotifications();
    const intervalId = setInterval(() => {
      fetchTasks();
      fetchReminderNotifications();
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(intervalId);
  }, [user, token]);

  // Effect to handle clicks outside the notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Effect to close sidebar on clicks outside it (mobile only)
  useEffect(() => {
    const handleClickOutsideSidebar = (event) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest(".sidebar-toggle-button")) {
        setIsSidebarOpen(false);
      }
    };

    // Only add event listener on mobile
    if (window.innerWidth < 768) {
      document.addEventListener("mousedown", handleClickOutsideSidebar);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSidebar);
    };
  }, [isSidebarOpen]);

  // Handle window resize to close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Function to add notification when new reminder is created (called from Notification component)
  const addNotificationToList = (notification) => {
    // Refresh the reminders list when a new notification is triggered
    fetchReminderNotifications();
  };

  // Sidebar component for logged-in users
  const Sidebar = () => (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-16 left-0 bottom-0 transform transition-all duration-300 ease-in-out z-40 md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${isSidebarCollapsed ? "w-16" : "w-64"}`}
        style={{
          backgroundColor: "#fefcf7",
          borderRight: "1px solid rgba(82, 121, 111, 0.1)",
          boxShadow: "4px 0 6px -1px rgba(82, 121, 111, 0.1)",
        }}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(82, 121, 111, 0.1)" }}>
          {!isSidebarCollapsed && (
            <h3 className="text-xl font-bold" style={{ color: "#2d5016" }}>
              Menu
            </h3>
          )}
          <div className="flex items-center space-x-2">
            {/* Desktop Collapse/Expand Button */}
            <button onClick={toggleSidebarCollapse} className="hidden md:flex p-2 rounded-full hover:bg-gray-100 transition-colors duration-200" style={{ color: "#52796f" }} title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <svg className={`h-5 w-5 transform transition-transform duration-200 ${isSidebarCollapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>

            {/* Mobile Close Button */}
            <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 md:hidden" style={{ color: "#52796f" }}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          {/* Main Features Section */}
          <div className="mb-6">
            {!isSidebarCollapsed && (
              <h4 className="px-3 text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6b7280" }}>
                Features
              </h4>
            )}
            <div className="space-y-1">
              {features.map((feature, index) => (
                <Link key={index} to={feature.link} className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-50 ${isSidebarCollapsed ? "justify-center" : ""}`} style={{ color: "#52796f" }} onClick={() => setIsSidebarOpen(false)} title={isSidebarCollapsed ? feature.title : ""}>
                  <span className={`text-lg ${isSidebarCollapsed ? "" : "mr-3"}`}>{feature.icon}</span>
                  {!isSidebarCollapsed && feature.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div className="mb-6">
            {!isSidebarCollapsed && (
              <h4 className="px-3 text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6b7280" }}>
                Account
              </h4>
            )}
            <div className="space-y-1">
              <Link to="/profile-settings" className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-50 ${isSidebarCollapsed ? "justify-center" : ""}`} style={{ color: "#52796f" }} onClick={() => setIsSidebarOpen(false)} title={isSidebarCollapsed ? "Profile Settings" : ""}>
                <span className={`text-lg ${isSidebarCollapsed ? "" : "mr-3"}`}>⚙️</span>
                {!isSidebarCollapsed && "Profile Settings"}
              </Link>
            </div>
          </div>

          {/* AI Tools Section */}
          <div className="mb-6">
            {!isSidebarCollapsed && (
              <h4 className="px-3 text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6b7280" }}>
                Tools
              </h4>
            )}
            <div className="space-y-1">
              <Link to="/ask-ai" className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-50 ${isSidebarCollapsed ? "justify-center" : ""}`} style={{ color: "#52796f" }} onClick={() => setIsSidebarOpen(false)} title={isSidebarCollapsed ? "Ask AI" : ""}>
                <span className={`text-lg ${isSidebarCollapsed ? "" : "mr-3"}`}>✨</span>
                {!isSidebarCollapsed && "Ask AI"}
              </Link>
            </div>
          </div>

          {/* Push Notifications Section */}
        </nav>
      </div>
    </>
  );

  return (
    <div className="min-h-screen font-sans relative" style={{ background: "linear-gradient(to bottom right, #fefcf7, #f8f6f0)" }}>
      <Notification onNotificationShow={addNotificationToList} />

      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: "radial-gradient(circle, rgba(132, 169, 140, 0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse delay-2000" style={{ background: "radial-gradient(circle, rgba(212, 165, 116, 0.08) 0%, transparent 70%)" }} />
        <div className="absolute top-1/3 left-0 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{ background: "radial-gradient(circle, rgba(132, 169, 140, 0.06) 0%, transparent 70%)" }} />
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 -z-5 opacity-[0.02]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(82,121,111,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(82,121,111,0.1)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Navigation Bar */}
      <nav className="backdrop-blur-xl border-b sticky top-0 z-50 relative shadow-sm" style={{ backgroundColor: "rgba(132, 169, 140, 0.15)", borderColor: "rgba(82, 121, 111, 0.2)" }}>
        <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(to right, rgba(132, 169, 140, 0.08), rgba(212, 165, 116, 0.08), rgba(132, 169, 140, 0.08))" }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - Logo and Sidebar Toggle */}
            <div className="flex items-center space-x-4">
              {/* Sidebar Toggle Button (Mobile Only) */}
              {user && (
                <button onClick={toggleSidebar} className="sidebar-toggle-button p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 md:hidden" style={{ color: "#52796f" }}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}

              {/* Logo */}
              <Link to="/" className="text-2xl font-bold hover:scale-105 transition-all duration-300 group flex items-center space-x-2" style={{ color: "#2d5016" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110" style={{ background: "linear-gradient(to bottom right, #52796f, #84a98c)", boxShadow: "0 4px 6px -1px rgba(82, 121, 111, 0.25)" }}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span>
                  Study
                  <span className="font-extrabold" style={{ color: "#52796f" }}>
                    Buddy
                  </span>
                </span>
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Notification Bell */}
                  <div className="relative" ref={notificationsRef}>
                    <button onClick={toggleNotifications} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200" style={{ color: "#52796f" }}>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {totalNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white rounded-full animate-pulse" style={{ backgroundColor: "#ef4444" }}>
                          {totalNotificationCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50" style={{ backgroundColor: "#fefcf7", borderColor: "rgba(82, 121, 111, 0.2)" }}>
                        {/* Tabs */}
                        <div className="flex border-b" style={{ borderColor: "rgba(82, 121, 111, 0.1)" }}>
                          <button onClick={() => setActiveTab("tasks")} className={`flex-1 px-4 py-2 text-xs font-semibold transition-colors duration-200 ${activeTab === "tasks" ? "border-b-2 border-green-500 text-green-600" : "text-gray-500 hover:text-gray-700"}`}>
                            Tasks ({taskNotificationCount})
                          </button>
                          <button onClick={() => setActiveTab("reminders")} className={`flex-1 px-4 py-2 text-xs font-semibold transition-colors duration-200 ${activeTab === "reminders" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                            Reminders ({reminderNotifications.length})
                          </button>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {activeTab === "tasks" ? (
                            // Tasks Tab Content
                            urgentHighTasks.length > 0 ? (
                              urgentHighTasks.map((task) => (
                                <div key={task._id} className="px-4 py-3 hover:bg-gray-50 border-b last:border-b-0" style={{ borderColor: "rgba(82, 121, 111, 0.1)" }}>
                                  <div className="font-medium text-sm" style={{ color: "#2d5016" }}>
                                    {task.title}
                                  </div>
                                  <div className="text-xs mt-1" style={{ color: "#6b7280" }}>
                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                  </div>
                                  <div className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${task.priority === "Urgent" ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"}`}>{task.priority}</div>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm" style={{ color: "#6b7280" }}>
                                No urgent tasks! 🎉
                              </div>
                            )
                          ) : (
                            // Reminders Tab Content
                            <>
                              {reminderNotifications.length > 0 ? (
                                reminderNotifications.map((notification) => (
                                  <div key={notification._id} onClick={() => handleNotificationClick(notification)} className={`px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer ${!notification.isRead ? "bg-blue-50" : ""}`} style={{ borderColor: "rgba(82, 121, 111, 0.1)" }}>
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="font-medium text-sm" style={{ color: "#2d5016" }}>
                                          {notification.title}
                                        </div>
                                        {notification.description && (
                                          <div className="text-xs mt-1" style={{ color: "#6b7280" }}>
                                            {notification.description}
                                          </div>
                                        )}
                                        <div className="text-xs mt-1" style={{ color: "#6b7280" }}>
                                          Reminder: {new Date(notification.dueTime).toLocaleString()}
                                        </div>
                                        <div className="flex items-center mt-2 space-x-2">
                                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${notification.type === "study" ? "bg-blue-100 text-blue-800" : notification.type === "task" ? "bg-green-100 text-green-800" : notification.type === "event" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}>{notification.type}</span>
                                          <span className="text-xs" style={{ color: "#6b7280" }}>
                                            {formatTime(notification.createdAt)}
                                          </span>
                                          {!notification.isRead && <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">New</span>}
                                        </div>
                                      </div>

                                      {/* Delete Button */}
                                      <div className="flex items-center space-x-2 ml-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteReminder(notification._id);
                                          }}
                                          disabled={isDeletingReminder === notification._id}
                                          className="p-1 rounded-full hover:bg-red-100 transition-colors duration-200 text-red-600 hover:text-red-800"
                                          title="Delete reminder"
                                        >
                                          {isDeletingReminder === notification._id ? (
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                          ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-sm" style={{ color: "#6b7280" }}>
                                  No reminder notifications yet! ⏰
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Info (Desktop) */}
                  <div className="hidden sm:flex items-center space-x-3 px-3 py-2 backdrop-blur-sm border rounded-xl shadow-sm" style={{ backgroundColor: "rgba(132, 169, 140, 0.1)", borderColor: "rgba(82, 121, 111, 0.2)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-md" style={{ background: "linear-gradient(to bottom right, #52796f, #84a98c)" }}>
                      <span className="text-white text-sm font-bold">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold" style={{ color: "#2d5016" }}>
                        {user.username}
                      </span>
                    </div>
                  </div>

                  {/* User Avatar (Mobile) */}
                  <div className="sm:hidden w-8 h-8 rounded-full flex items-center justify-center shadow-md" style={{ background: "linear-gradient(to bottom right, #52796f, #84a98c)" }}>
                    <span className="text-white text-sm font-bold">{user.username.charAt(0).toUpperCase()}</span>
                  </div>

                  {/* Logout Button */}
                  <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-transparent text-sm font-medium transition-all duration-300 hover:bg-gray-100" style={{ color: "#52796f" }}>
                    <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/register" className="px-4 py-2 rounded-xl border border-transparent text-sm font-medium transition-all duration-300 hover:bg-gray-100" style={{ color: "#52796f" }}>
                    Register
                  </Link>
                  <Link to="/login" className="text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:scale-105 active:scale-95" style={{ background: "linear-gradient(to right, #52796f, #84a98c)", boxShadow: "0 4px 6px -1px rgba(82, 121, 111, 0.25)" }}>
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Login</span>
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Layout Container */}
      <div className="flex">
        {/* Sidebar - Only render for logged-in users */}
        {user && <Sidebar />}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${user ? (isSidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}`}>
          <div className="container mx-auto p-4 md:p-8 relative z-10">
            <div className="absolute inset-0 rounded-3xl blur-3xl -z-10" style={{ background: "radial-gradient(ellipse at center, rgba(132, 169, 140, 0.03) 0%, transparent 70%)" }} />

            <Routes>
              <Route path="/" element={<HomePage features={features} showFeatures={!user} />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/verify-email" element={<VerifyPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:userId/:token" element={<ResetPasswordPage />} />
              <Route path="/auth/google/callback" element={<GoogleAuthCallbackPage />} />
              <Route path="/todo" element={<TasksPage />} />
              <Route path="/resources" element={<StudyResourceCollector />} />
              <Route path="/reminder" element={<ReminderPage />} />
              <Route path="/forum" element={<DiscussionForum />} />
              <Route path="/discussion/:id" element={<DiscussionDetails />} />

              {/* Placeholder Routes */}
              <Route
                path="/profile-settings"
                element={
                  <div className="flex items-center justify-center h-96 text-2xl font-bold" style={{ color: "#52796f" }}>
                    Profile Settings Page (Coming Soon!)
                  </div>
                }
              />
              <Route
                path="/ask-ai"
                element={
                  <div className="flex items-center justify-center h-96 text-2xl font-bold" style={{ color: "#52796f" }}>
                    Ask AI Page (Coming Soon!)
                  </div>
                }
              />
              {features.map((feature, index) => (
                <Route
                  key={index}
                  path={feature.link}
                  element={
                    <div className="flex items-center justify-center h-96 text-2xl font-bold" style={{ color: "#52796f" }}>
                      {feature.title} Page (Coming Soon!)
                    </div>
                  }
                />
              ))}
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
