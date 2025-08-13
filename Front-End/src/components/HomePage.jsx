import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Book, CheckSquare, Calendar, Users, ArrowRight, Play, BookOpen, Bell, MessageSquare, TrendingUp, Star, Clock, Target, Award } from "lucide-react";

const colorScheme = {
  "--primary-sage": "#84a98c",
  "--primary-forest": "#52796f",
  "--secondary-cream": "#f8f6f0",
  "--secondary-off-white": "#fefcf7",
  "--accent-gold": "#d4a574",
  "--text-forest": "#2d5016",
  "--text-gray": "#6b7280",
};
// HomePage component now accepts 'features' and 'showFeatures' as props
// Apply colors to document root
Object.entries(colorScheme).forEach(([key, value]) => {
  document.documentElement.style.setProperty(key, value);
});

// Utility Components
const FeatureCard = ({ icon: Icon, title, description, gradient, delay = 0 }) => (
  <div
    className="group p-8 rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-xl"
    style={{
      backgroundColor: "rgba(132, 169, 140, 0.05)",
      borderColor: "rgba(82, 121, 111, 0.2)",
      animationDelay: `${delay}ms`,
    }}
  >
    <div className="mb-6">
      <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ background: gradient }}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--text-forest)" }}>
        {title}
      </h3>
      <p className="text-lg leading-relaxed" style={{ color: "var(--text-gray)" }}>
        {description}
      </p>
    </div>
    <button className="flex items-center space-x-2 text-lg font-semibold transition-all duration-300 group-hover:translate-x-2" style={{ color: "var(--primary-forest)" }}>
      <span>Learn More</span>
      <ArrowRight className="w-5 h-5" />
    </button>
  </div>
);

const StatCard = ({ icon, value, label, delay = 0 }) => (
  <div
    className="p-6 rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:scale-105 text-center"
    style={{
      backgroundColor: "rgba(132, 169, 140, 0.08)",
      borderColor: "rgba(82, 121, 111, 0.2)",
      animationDelay: `${delay}ms`,
    }}
  >
    <div className="text-3xl mb-3">{icon}</div>
    <div className="text-3xl font-bold mb-2" style={{ color: "var(--text-forest)" }}>
      {value}
    </div>
    <div className="text-sm font-medium" style={{ color: "var(--text-gray)" }}>
      {label}
    </div>
  </div>
);

const TaskPreview = ({ task, index }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      Low: { bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.3)", text: "#16a34a" },
      Medium: { bg: "rgba(251, 191, 36, 0.1)", border: "rgba(251, 191, 36, 0.3)", text: "#d97706" },
      High: { bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.3)", text: "#dc2626" },
      Urgent: { bg: "rgba(147, 51, 234, 0.1)", border: "rgba(147, 51, 234, 0.3)", text: "#9333ea" },
    };
    return colors[priority] || colors["Low"];
  };

  const priorityColors = getPriorityColor(task.priority);

  return (
    <div
      className="p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-102 hover:shadow-lg"
      style={{
        backgroundColor: "rgba(132, 169, 140, 0.03)",
        borderColor: "rgba(82, 121, 111, 0.15)",
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-lg">{task.completed ? "✅" : "📝"}</div>
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold border"
          style={{
            backgroundColor: priorityColors.bg,
            borderColor: priorityColors.border,
            color: priorityColors.text,
          }}
        >
          {task.priority}
        </span>
      </div>
      <h4 className="font-semibold mb-2 line-clamp-2" style={{ color: "var(--text-forest)" }}>
        {task.title}
      </h4>
      <div className="flex items-center text-sm mb-3" style={{ color: "var(--text-gray)" }}>
        <Clock className="w-4 h-4 mr-2" />
        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
      </div>
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.slice(0, 2).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="px-2 py-1 text-xs rounded-md"
              style={{
                backgroundColor: "rgba(82, 121, 111, 0.1)",
                color: "var(--primary-forest)",
              }}
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span
              className="px-2 py-1 text-xs rounded-md"
              style={{
                backgroundColor: "rgba(82, 121, 111, 0.1)",
                color: "var(--primary-forest)",
              }}
            >
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const ActivityItem = ({ icon, title, time, gradient }) => (
  <div className="flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 hover:scale-102" style={{ backgroundColor: "rgba(132, 169, 140, 0.05)" }}>
    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: gradient }}>
      <span className="text-white text-lg">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold truncate" style={{ color: "var(--text-forest)" }}>
        {title}
      </p>
      <p className="text-sm" style={{ color: "var(--text-gray)" }}>
        {time}
      </p>
    </div>
  </div>
);

// Main Component
const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [resources, setResources] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication and fetch data
  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Decode token to get user info
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);

      // Fetch user data
      await Promise.all([fetchTasks(token), fetchDiscussions(token), fetchResources(token), fetchReminders(token)]);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (token) => {
    try {
      const response = await fetch("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.slice(0, 6)); // Show only first 6 tasks
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchDiscussions = async (token) => {
    try {
      const response = await fetch("/api/discussion", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDiscussions(data);
      }
    } catch (error) {
      console.error("Error fetching discussions:", error);
    }
  };

  const fetchResources = async (token) => {
    try {
      const response = await fetch("/api/resources", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  const fetchReminders = async (token) => {
    try {
      const response = await fetch("/api/reminder", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  // Calculate user stats
  const userStats = user
    ? [
        { icon: "📋", value: tasks.length, label: "Total Tasks" },
        { icon: "✅", value: tasks.filter((task) => task.completed).length, label: "Completed" },
        { icon: "🎯", value: tasks.filter((task) => !task.completed).length, label: "Active Tasks" },
        { icon: "💬", value: discussions.length, label: "Discussions" },
        { icon: "📚", value: resources.length, label: "Resources" },
        { icon: "⏰", value: reminders.length, label: "Reminders" },
      ]
    : [];

  // Features for non-logged users
  const features = [
    {
      icon: CheckSquare,
      title: "Smart Todo Lists",
      description: "Organize your tasks with intelligent prioritization, due date tracking, and progress monitoring. Never miss an important deadline again.",
      gradient: "linear-gradient(135deg, var(--primary-forest), var(--primary-sage))",
    },
    {
      icon: BookOpen,
      title: "Resource Planner",
      description: "Curate and organize all your study materials in one place. From PDFs to videos, keep everything accessible and organized.",
      gradient: "linear-gradient(135deg, var(--primary-sage), var(--accent-gold))",
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Get timely notifications for assignments, exams, and study sessions. Customize reminder types to fit your schedule.",
      gradient: "linear-gradient(135deg, var(--accent-gold), var(--primary-forest))",
    },
    {
      icon: MessageSquare,
      title: "Discussion Forum",
      description: "Connect with fellow students, ask questions, share knowledge, and collaborate on challenging topics.",
      gradient: "linear-gradient(135deg, var(--primary-forest), var(--accent-gold))",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: "var(--primary-forest)" }}></div>
          <p className="text-xl" style={{ color: "var(--text-gray)" }}>
            Loading StudyBuddy...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--secondary-off-white)" }}>
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 rounded-3xl blur-3xl opacity-30" style={{ background: "radial-gradient(ellipse at center, var(--primary-sage) 0%, transparent 70%)" }} />

        <div className="relative max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6" style={{ color: "var(--text-forest)" }}>
              Welcome to{" "}
              <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, var(--primary-forest), var(--primary-sage))" }}>
                StudyBuddy
              </span>
            </h1>

            {user && (
              <p className="text-2xl md:text-3xl mb-6" style={{ color: "var(--primary-forest)" }}>
                Hello,{" "}
                <span className="font-bold" style={{ color: "var(--text-forest)" }}>
                  {user.username}
                </span>
                ! 👋
              </p>
            )}
          </div>

          <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto leading-relaxed" style={{ color: "var(--text-gray)" }}>
            Your intelligent learning companion designed to make studying more effective, organized, and enjoyable with AI-powered tools and collaborative features.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={() => navigate("/login")} className="group px-8 py-4 rounded-xl text-lg font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 flex items-center space-x-3 shadow-lg hover:shadow-xl" style={{ background: "linear-gradient(135deg, var(--primary-forest), var(--primary-sage))" }}>
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Get Started</span>
            </button>
          </div>
        </div>
      </section>

      {/* User Stats - Logged in users only */}
      {user && userStats.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {userStats.map((stat, index) => (
                <StatCard key={index} {...stat} delay={index * 100} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* User Dashboard - Logged in users */}
      {user && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto space-y-16">
            {/* My Tasks */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl md:text-4xl font-bold flex items-center space-x-3" style={{ color: "var(--text-forest)" }}>
                  <CheckSquare className="w-8 h-8" />
                  <span>My Tasks</span>
                </h2>
                <button className="text-lg font-semibold flex items-center space-x-2 transition-colors duration-300" style={{ color: "var(--primary-forest)" }}>
                  <span>View All</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {error ? (
                <div className="text-center text-red-600 text-lg">{error}</div>
              ) : tasks.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map((task, index) => (
                    <TaskPreview key={task._id} task={task} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--text-gray)" }} />
                  <p className="text-xl" style={{ color: "var(--text-gray)" }}>
                    No tasks yet. Ready to get organized?
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Features Section - Non-logged users */}
      {!user && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "var(--text-forest)" }}>
                Powerful Features for Smarter Learning
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: "var(--text-gray)" }}>
                Discover the tools that make StudyBuddy the perfect companion for your academic journey
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} delay={index * 200} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Motivational Quote Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="p-12 rounded-3xl border backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(132, 169, 140, 0.08)",
              borderColor: "rgba(82, 121, 111, 0.2)",
            }}
          >
            <Award className="w-16 h-16 mx-auto mb-6" style={{ color: "var(--accent-gold)" }} />

            <blockquote className="text-2xl md:text-3xl font-bold mb-6 italic" style={{ color: "var(--text-forest)" }}>
              "Education is the most powerful weapon which you can use to change the world."
            </blockquote>

            <p className="text-lg font-semibold" style={{ color: "var(--primary-forest)" }}>
              - Nelson Mandela
            </p>

            <div className="mt-8 p-6 rounded-2xl" style={{ backgroundColor: "rgba(248, 246, 240, 0.7)" }}>
              <p className="text-lg leading-relaxed" style={{ color: "var(--text-gray)" }}>
                {user ? "Keep pushing forward in your learning journey. Every task completed and every question asked brings you closer to your goals." : "Start your journey today and join thousands of students who are already transforming their learning experience with StudyBuddy."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
