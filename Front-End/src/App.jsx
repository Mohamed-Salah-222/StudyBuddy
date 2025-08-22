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
import AIStudyPage from "./components/AIStudyPage";

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

const VAPID_PUBLIC_KEY = "BBjKbsfZi6e5QAP5Pf3mQaD7IOJ8JC_-seZvU-SQKsHQiiGjhsb-_jFKJHSeYck8uXrZI4JVSnmtzaXYA_YRylc";

function App() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const [urgentHighTasks, setUrgentHighTasks] = useState([]);
  const [taskNotificationCount, setTaskNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const notificationsRef = useRef(null);

  const [reminderNotifications, setReminderNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDeletingReminder, setIsDeletingReminder] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sidebarRef = useRef(null);

  const [pushNotificationEnabled, setPushNotificationEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState(Notification.permission);
  const [pushMessage, setPushMessage] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const features = [
    {
      title: "Smart Todo List",
      description: "Organize your tasks with intelligent prioritization and deadline tracking",
      icon: "📝",
      link: "/todo",
      gradient: "linear-gradient(135deg, #52796f 0%, #84a98c 100%)",
    },
    {
      title: "AI Study Buddy",
      description: "Get personalized help with studying, explanations, and learning techniques from AI",
      icon: "🤖",
      link: "/ai-study",
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
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
      title: "Discussion Forum",
      description: "Post questions and get help from our community of learners and experts.",
      icon: "💬",
      link: "/forum",
      gradient: "linear-gradient(135deg, #84a98c 0%, #52796f 100%)",
    },
  ];

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

      const transformedReminders = reminders.map((reminder) => ({
        _id: reminder._id,
        title: reminder.title || reminder.subject || "Reminder",
        type: reminder.type || "reminder",
        dueTime: reminder.reminderTime || reminder.createdAt,
        isRead: reminder.notified || false,
        createdAt: reminder.createdAt,
        description: reminder.description,
        originalReminder: reminder,
      }));

      setReminderNotifications(transformedReminders);

      const unreadReminders = transformedReminders.filter((n) => !n.isRead);
      setUnreadCount(unreadReminders.length);
    } catch (error) {
      console.error("Error fetching reminder notifications:", error);
      setReminderNotifications([]);
      setUnreadCount(0);
    }
  };

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

      setReminderNotifications((prev) => {
        const updated = prev.filter((reminder) => reminder._id !== reminderId);

        const unreadReminders = updated.filter((n) => !n.isRead);
        setUnreadCount(unreadReminders.length);
        return updated;
      });
    } catch (error) {
      console.error("Error deleting reminder:", error);
    } finally {
      setIsDeletingReminder(null);
    }
  };

  const subscribeUser = async () => {
    setIsSubscribing(true);
    setPushMessage("");

    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setPushMessage("Push notifications are not supported by your browser.");
        setIsSubscribing(false);
        return;
      }

      if (!("Notification" in window)) {
        setPushMessage("This browser does not support notifications.");
        setIsSubscribing(false);
        return;
      }

      console.log("Registering service worker...");
      const registration = await navigator.serviceWorker.register("/service-worker.js");
      console.log("Service Worker registered:", registration);

      let currentPermission;
      if (typeof Notification.requestPermission === "function") {
        try {
          currentPermission = await Notification.requestPermission();
        } catch (error) {
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

      console.log("Subscribing to push notifications...");
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      };
      const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
      console.log("Push Subscription:", pushSubscription);

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

  const handlePushNotificationToggle = async () => {
    if (!pushNotificationEnabled) {
      await subscribeUser();
    } else {
      setPushNotificationEnabled(false);
      setPushMessage("Push notifications disabled.");
    }
  };

  const handleNotificationClick = async (notification) => {
    console.log("Notification clicked:", notification);
  };

  const markAsRead = async (notificationId) => {
    console.log("Mark as read not implemented for API-based reminders");
  };

  const handleMarkAllAsRead = async () => {
    console.log("Mark all as read not implemented for API-based reminders");
  };

  const totalNotificationCount = taskNotificationCount + reminderNotifications.length;

  useEffect(() => {
    fetchTasks();
    fetchReminderNotifications();
    const intervalId = setInterval(() => {
      fetchTasks();
      fetchReminderNotifications();
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(intervalId);
  }, [user, token]);

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

  useEffect(() => {
    const handleClickOutsideSidebar = (event) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest(".sidebar-toggle-button")) {
        setIsSidebarOpen(false);
      }
    };

    if (window.innerWidth < 768) {
      document.addEventListener("mousedown", handleClickOutsideSidebar);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSidebar);
    };
  }, [isSidebarOpen]);

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

  const addNotificationToList = (notification) => {
    fetchReminderNotifications();
  };

  const Sidebar = () => (
    <>
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <div
        ref={sidebarRef}
        className={`fixed top-16 left-0 bottom-0 transform transition-all duration-300 ease-in-out z-40 md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${isSidebarCollapsed ? "w-16" : "w-64"}`}
        style={{
          backgroundColor: "#d3d3d3",
          borderRight: "2px solid #323232",
          boxShadow: "4px 0 #323232",
        }}
      >
        <div className="p-4 flex items-center justify-between border-b-2 border-gray-800">
          {!isSidebarCollapsed && <h3 className="text-xl font-bold text-gray-800">Menu</h3>}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSidebarCollapse}
              className="hidden md:flex p-2 bg-white border-2 border-gray-800 shadow-brutal hover:bg-gray-100 transition-all duration-200 text-gray-800"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              style={{ boxShadow: "2px 2px #323232" }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translate(-1px, -1px)";
                e.target.style.boxShadow = "3px 3px #323232";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translate(0, 0)";
                e.target.style.boxShadow = "2px 2px #323232";
              }}
            >
              <svg className={`h-5 w-5 transform transition-transform duration-200 ${isSidebarCollapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={toggleSidebar}
              className="p-2 bg-white border-2 border-gray-800 shadow-brutal hover:bg-gray-100 transition-all duration-200 md:hidden text-gray-800"
              style={{ boxShadow: "2px 2px #323232" }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translate(-1px, -1px)";
                e.target.style.boxShadow = "3px 3px #323232";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translate(0, 0)";
                e.target.style.boxShadow = "2px 2px #323232";
              }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <div className="mb-6">
            {!isSidebarCollapsed && <h4 className="px-3 text-xs font-bold uppercase tracking-wider mb-3 text-gray-600">Features</h4>}
            <div className="space-y-2">
              {features.map((feature, index) => (
                <Link
                  key={index}
                  to={feature.link}
                  className={`flex items-center px-3 py-3 bg-white border-2 border-gray-800 shadow-brutal text-sm font-semibold transition-all duration-200 hover:bg-gray-100 text-gray-800 ${isSidebarCollapsed ? "justify-center" : ""}`}
                  onClick={() => setIsSidebarOpen(false)}
                  title={isSidebarCollapsed ? feature.title : ""}
                  style={{ boxShadow: "2px 2px #323232" }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translate(-1px, -1px)";
                    e.target.style.boxShadow = "3px 3px #323232";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translate(0, 0)";
                    e.target.style.boxShadow = "2px 2px #323232";
                  }}
                >
                  <span className={`text-lg ${isSidebarCollapsed ? "" : "mr-3"}`}>{feature.icon}</span>
                  {!isSidebarCollapsed && feature.title}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </>
  );

  return (
    <div className="min-h-screen font-sans relative bg-gray-100">
      <Notification onNotificationShow={addNotificationToList} />

      <nav className="bg-gray-300 border-b-2 border-gray-800 sticky top-0 z-50 shadow-brutal" style={{ boxShadow: "0 4px #323232" }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {user && (
                <button
                  onClick={toggleSidebar}
                  className="sidebar-toggle-button p-2 bg-white border-2 border-gray-800 shadow-brutal hover:bg-gray-100 transition-all duration-200 md:hidden text-gray-800"
                  style={{ boxShadow: "2px 2px #323232" }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translate(-1px, -1px)";
                    e.target.style.boxShadow = "3px 3px #323232";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translate(0, 0)";
                    e.target.style.boxShadow = "2px 2px #323232";
                  }}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}

              <Link to="/" className="text-2xl font-bold hover:scale-105 transition-all duration-300 group flex items-center space-x-2 text-gray-800">
                <div className="w-8 h-8 bg-gray-800 border-2 border-gray-800 shadow-brutal flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ boxShadow: "2px 2px #323232" }}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span>
                  Study
                  <span className="font-extrabold text-gray-600">Buddy</span>
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="relative" ref={notificationsRef}>
                    <button
                      onClick={toggleNotifications}
                      className="relative p-2 bg-white border-2 border-gray-800 shadow-brutal hover:bg-gray-100 transition-all duration-200 text-gray-800"
                      style={{ boxShadow: "2px 2px #323232" }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translate(-1px, -1px)";
                        e.target.style.boxShadow = "3px 3px #323232";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translate(0, 0)";
                        e.target.style.boxShadow = "2px 2px #323232";
                      }}
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {totalNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 border-2 border-gray-800 shadow-brutal animate-pulse" style={{ boxShadow: "1px 1px #323232" }}>
                          {totalNotificationCount}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-gray-300 border-2 border-gray-800 shadow-brutal z-50" style={{ boxShadow: "4px 4px #323232" }}>
                        <div className="flex border-b-2 border-gray-800">
                          <button onClick={() => setActiveTab("tasks")} className={`flex-1 px-4 py-2 text-xs font-bold transition-all duration-200 ${activeTab === "tasks" ? "bg-gray-800 text-white border-b-2 border-white" : "text-gray-800 hover:bg-gray-400"}`}>
                            Tasks ({taskNotificationCount})
                          </button>
                          <button onClick={() => setActiveTab("reminders")} className={`flex-1 px-4 py-2 text-xs font-bold transition-all duration-200 ${activeTab === "reminders" ? "bg-gray-800 text-white border-b-2 border-white" : "text-gray-800 hover:bg-gray-400"}`}>
                            Reminders ({reminderNotifications.length})
                          </button>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {activeTab === "tasks" ? (
                            urgentHighTasks.length > 0 ? (
                              urgentHighTasks.map((task) => (
                                <div key={task._id} className="px-4 py-3 hover:bg-gray-400 border-b-2 border-gray-800 last:border-b-0">
                                  <div className="font-bold text-sm text-gray-800">{task.title}</div>
                                  <div className="text-xs mt-1 text-gray-600">Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                                  <div className={`inline-block px-2 py-1 text-xs font-bold border-2 border-gray-800 shadow-brutal mt-2 ${task.priority === "Urgent" ? "bg-red-200 text-red-800" : "bg-orange-200 text-orange-800"}`} style={{ boxShadow: "1px 1px #323232" }}>
                                    {task.priority}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm font-semibold text-gray-600">No urgent tasks!</div>
                            )
                          ) : (
                            <>
                              {reminderNotifications.length > 0 ? (
                                reminderNotifications.map((notification) => (
                                  <div key={notification._id} onClick={() => handleNotificationClick(notification)} className={`px-4 py-3 hover:bg-gray-400 border-b-2 border-gray-800 last:border-b-0 cursor-pointer ${!notification.isRead ? "bg-blue-100" : ""}`}>
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="font-bold text-sm text-gray-800">{notification.title}</div>
                                        {notification.description && <div className="text-xs mt-1 text-gray-600">{notification.description}</div>}
                                        <div className="text-xs mt-1 text-gray-600">Reminder: {new Date(notification.dueTime).toLocaleString()}</div>
                                        <div className="flex items-center mt-2 space-x-2">
                                          <span
                                            className={`inline-block px-2 py-1 text-xs font-bold border-2 border-gray-800 shadow-brutal ${notification.type === "study" ? "bg-blue-200 text-blue-800" : notification.type === "task" ? "bg-green-200 text-green-800" : notification.type === "event" ? "bg-purple-200 text-purple-800" : "bg-gray-200 text-gray-800"}`}
                                            style={{ boxShadow: "1px 1px #323232" }}
                                          >
                                            {notification.type}
                                          </span>
                                          <span className="text-xs text-gray-600">{formatTime(notification.createdAt)}</span>
                                          {!notification.isRead && (
                                            <span className="inline-block px-2 py-1 text-xs font-bold border-2 border-gray-800 shadow-brutal bg-red-200 text-red-800" style={{ boxShadow: "1px 1px #323232" }}>
                                              New
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-2 ml-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteReminder(notification._id);
                                          }}
                                          disabled={isDeletingReminder === notification._id}
                                          className="p-1 bg-white border-2 border-gray-800 shadow-brutal hover:bg-red-100 transition-all duration-200 text-red-600"
                                          title="Delete reminder"
                                          style={{ boxShadow: "1px 1px #323232" }}
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
                                <div className="px-4 py-3 text-sm font-semibold text-gray-600">No reminder notifications yet!</div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="hidden sm:flex items-center space-x-3 px-3 py-2 bg-white border-2 border-gray-800 shadow-brutal" style={{ boxShadow: "2px 2px #323232" }}>
                    <div className="w-8 h-8 bg-gray-800 border-2 border-gray-800 shadow-brutal flex items-center justify-center" style={{ boxShadow: "1px 1px #323232" }}>
                      <span className="text-white text-sm font-bold">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800">{user.username}</span>
                    </div>
                  </div>

                  <div className="sm:hidden w-8 h-8 bg-gray-800 border-2 border-gray-800 shadow-brutal flex items-center justify-center" style={{ boxShadow: "2px 2px #323232" }}>
                    <span className="text-white text-sm font-bold">{user.username.charAt(0).toUpperCase()}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-800 shadow-brutal text-sm font-semibold transition-all duration-200 hover:bg-gray-100 text-gray-800"
                    style={{ boxShadow: "2px 2px #323232" }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translate(-1px, -1px)";
                      e.target.style.boxShadow = "3px 3px #323232";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translate(0, 0)";
                      e.target.style.boxShadow = "2px 2px #323232";
                    }}
                  >
                    <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-white border-2 border-gray-800 shadow-brutal text-sm font-semibold transition-all duration-200 hover:bg-gray-100 text-gray-800"
                    style={{ boxShadow: "2px 2px #323232" }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translate(-1px, -1px)";
                      e.target.style.boxShadow = "3px 3px #323232";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translate(0, 0)";
                      e.target.style.boxShadow = "2px 2px #323232";
                    }}
                  >
                    Register
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-2 bg-gray-800 text-white border-2 border-gray-800 shadow-brutal text-sm font-bold transition-all duration-200 hover:bg-gray-700"
                    style={{ boxShadow: "2px 2px #323232" }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translate(-1px, -1px)";
                      e.target.style.boxShadow = "3px 3px #323232";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translate(0, 0)";
                      e.target.style.boxShadow = "2px 2px #323232";
                    }}
                  >
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

      <div className="flex">
        {user && <Sidebar />}

        <main className={`flex-1 transition-all duration-300 ${user ? (isSidebarCollapsed ? "md:ml-16" : "md:ml-64") : ""}`}>
          <div className="container mx-auto p-4 md:p-8 relative z-10">
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
              <Route path="/ai-study" element={<AIStudyPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
