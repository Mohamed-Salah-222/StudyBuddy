import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Book, CheckSquare, Calendar, Users, ArrowRight, Play, BookOpen, Bell, MessageSquare, TrendingUp, Star, Clock, Target, Award, Brain } from "lucide-react";

const colorScheme = {
  "--primary-sage": "#84a98c",
  "--primary-forest": "#52796f",
  "--secondary-cream": "#f8f6f0",
  "--secondary-off-white": "#fefcf7",
  "--accent-gold": "#d4a574",
  "--text-forest": "#2d5016",
  "--text-gray": "#6b7280",
};

Object.entries(colorScheme).forEach(([key, value]) => {
  document.documentElement.style.setProperty(key, value);
});

const FeatureCard = ({ icon: Icon, title, description, gradient, delay = 0 }) => (
  <div
    className="group p-6 bg-white border-2 border-gray-800 transition-all duration-200 hover:bg-gray-100"
    style={{
      boxShadow: "4px 4px #323232",
      animationDelay: `${delay}ms`,
      borderRadius: "5px",
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = "translate(-2px, -2px)";
      e.target.style.boxShadow = "6px 6px #323232";
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = "translate(0, 0)";
      e.target.style.boxShadow = "4px 4px #323232";
    }}
  >
    <div className="mb-6">
      <div
        className="w-12 h-12 border-2 border-gray-800 flex items-center justify-center mb-4 bg-gray-800"
        style={{
          boxShadow: "2px 2px #323232",
          borderRadius: "5px",
        }}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600 font-semibold leading-relaxed">{description}</p>
    </div>
  </div>
);

const StatCard = ({ icon, value, label, delay = 0 }) => (
  <div
    className="p-4 bg-gray-300 border-2 border-gray-800 transition-all duration-200 text-center"
    style={{
      boxShadow: "4px 4px #323232",
      animationDelay: `${delay}ms`,
      borderRadius: "5px",
    }}
  >
    <div className="text-2xl mb-2 font-bold text-gray-800">{icon}</div>
    <div className="text-2xl font-bold mb-1 text-gray-800">{value}</div>
    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{label}</div>
  </div>
);

const TaskPreview = ({ task, index }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      Low: { bg: "bg-green-200", text: "text-green-800" },
      Medium: { bg: "bg-yellow-200", text: "text-yellow-800" },
      High: { bg: "bg-orange-200", text: "text-orange-800" },
      Urgent: { bg: "bg-red-200", text: "text-red-800" },
    };
    return colors[priority] || colors["Low"];
  };

  const priorityColors = getPriorityColor(task.priority);

  return (
    <div
      className="p-6 bg-gray-300 border-2 border-gray-800 transition-all duration-200 hover:bg-gray-400"
      style={{
        boxShadow: "4px 4px #323232",
        animationDelay: `${index * 100}ms`,
        borderRadius: "5px",
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translate(-2px, -2px)";
        e.target.style.boxShadow = "6px 6px #323232";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translate(0, 0)";
        e.target.style.boxShadow = "4px 4px #323232";
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{task.title}</h3>
        <span
          className={`px-2 py-1 text-xs font-bold border-2 border-gray-800 ${priorityColors.bg} ${priorityColors.text}`}
          style={{
            boxShadow: "1px 1px #323232",
            borderRadius: "5px",
          }}
        >
          {task.priority}
        </span>
      </div>

      <p className="text-sm text-gray-600 font-semibold mb-4 line-clamp-3">{task.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-600 font-semibold">
        <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}</span>
        <span
          className={`px-2 py-1 border-2 border-gray-800 ${task.status === "completed" ? "bg-green-200 text-green-800" : task.status === "in-progress" ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-800"}`}
          style={{
            boxShadow: "1px 1px #323232",
            borderRadius: "5px",
          }}
        >
          {task.status}
        </span>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {task.tags.slice(0, 2).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="px-2 py-1 text-xs font-bold bg-white border-2 border-gray-800 text-gray-800"
              style={{
                boxShadow: "1px 1px #323232",
                borderRadius: "5px",
              }}
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span
              className="px-2 py-1 text-xs font-bold bg-white border-2 border-gray-800 text-gray-800"
              style={{
                boxShadow: "1px 1px #323232",
                borderRadius: "5px",
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
  <div
    className="flex items-center space-x-4 p-4 bg-gray-300 border-2 border-gray-800 transition-all duration-200 hover:bg-gray-400"
    style={{
      boxShadow: "2px 2px #323232",
      borderRadius: "5px",
    }}
  >
    <div
      className="w-12 h-12 border-2 border-gray-800 flex items-center justify-center flex-shrink-0 bg-gray-800"
      style={{
        boxShadow: "2px 2px #323232",
        borderRadius: "5px",
      }}
    >
      <span className="text-white text-lg font-bold">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold truncate text-gray-800">{title}</p>
      <p className="text-sm font-semibold text-gray-600">{time}</p>
    </div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [resources, setResources] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchDiscussions = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/discussion`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reminder`, {
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

  const features = [
    {
      icon: <CheckSquare className="w-6 h-6" />,
      title: "Smart Todo Lists",
      description: "Organize your tasks with intelligent prioritization, due date tracking, and progress monitoring. Never miss an important deadline again.",
      gradient: "linear-gradient(135deg, var(--primary-forest), var(--primary-sage))",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "StudyBuddy AI",
      description: "Get personalized study plans, intelligent recommendations, and AI-powered learning assistance. Let our AI help you create the perfect study strategy tailored to your goals.",
      gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Resource Planner",
      description: "Curate and organize all your study materials in one place. From PDFs to videos, keep everything accessible and organized.",
      gradient: "linear-gradient(135deg, var(--primary-sage), var(--accent-gold))",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Reminders",
      description: "Get timely notifications for assignments, exams, and study sessions. Customize reminder types to fit your schedule.",
      gradient: "linear-gradient(135deg, var(--accent-gold), var(--primary-forest))",
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
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
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="relative max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-gray-800">
              Welcome to <span className="font-black text-gray-600">StudyBuddy</span>
            </h1>

            {user && (
              <p className="text-2xl md:text-3xl mb-6 text-gray-800">
                Hello, <span className="font-bold text-gray-800">{user.username}</span>!
              </p>
            )}
          </div>

          <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto leading-relaxed text-gray-600 font-semibold">Your intelligent learning companion designed to make studying more effective, organized, and enjoyable with AI-powered tools and collaborative features.</p>

          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate("/login")}
                className="oauthButton group px-8 py-4 bg-white border-2 border-gray-800 shadow-brutal text-lg font-bold text-gray-800 transition-all duration-200 hover:bg-gray-100 flex items-center space-x-3"
                style={{ boxShadow: "4px 4px #323232" }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translate(-2px, -2px)";
                  e.target.style.boxShadow = "6px 6px #323232";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translate(0, 0)";
                  e.target.style.boxShadow = "4px 4px #323232";
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = "translate(2px, 2px)";
                  e.target.style.boxShadow = "2px 2px #323232";
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = "translate(-2px, -2px)";
                  e.target.style.boxShadow = "6px 6px #323232";
                }}
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Get Started</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* User Stats Section */}
      {user && userStats.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {userStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gray-300 border-2 border-gray-800 shadow-brutal p-4 text-center"
                  style={{
                    boxShadow: "4px 4px #323232",
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="text-2xl mb-2">{stat.icon}</div> {/* Add this line */}
                  <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tasks Section */}
      {user && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto space-y-16">
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl md:text-4xl font-bold flex items-center space-x-3 text-gray-800">
                  <CheckSquare className="w-8 h-8" />
                  <span>My Tasks</span>
                </h2>
                <button
                  className="text-lg font-bold flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-800 shadow-brutal hover:bg-gray-100 transition-all duration-200 text-gray-800"
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
                  <Link to="/todo" className="flex items-center space-x-2">
                    <span>View All</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </button>
              </div>

              {error ? (
                <div className="text-center p-4 bg-red-200 border-2 border-red-600 shadow-brutal" style={{ boxShadow: "4px 4px #dc2626" }}>
                  <p className="text-lg font-bold text-red-800">{error}</p>
                </div>
              ) : tasks.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map((task, index) => (
                    <div
                      key={task._id}
                      className="bg-gray-300 border-2 border-gray-800 shadow-brutal p-6 hover:bg-gray-400 transition-all duration-200"
                      style={{
                        boxShadow: "4px 4px #323232",
                        animationDelay: `${index * 100}ms`,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translate(-2px, -2px)";
                        e.target.style.boxShadow = "6px 6px #323232";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translate(0, 0)";
                        e.target.style.boxShadow = "4px 4px #323232";
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{task.title}</h3>
                        <span className={`px-2 py-1 text-xs font-bold border-2 border-gray-800 shadow-brutal ${task.priority === "Urgent" ? "bg-red-200 text-red-800" : task.priority === "High" ? "bg-orange-200 text-orange-800" : task.priority === "Medium" ? "bg-yellow-200 text-yellow-800" : "bg-green-200 text-green-800"}`} style={{ boxShadow: "1px 1px #323232" }}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-semibold mb-4 line-clamp-3">{task.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-600 font-semibold">
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 border-2 border-gray-800 shadow-brutal ${task.status === "completed" ? "bg-green-200 text-green-800" : task.status === "in-progress" ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-800"}`} style={{ boxShadow: "1px 1px #323232" }}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-300 border-2 border-gray-800 shadow-brutal" style={{ boxShadow: "4px 4px #323232" }}>
                  <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-xl font-semibold text-gray-600">No tasks yet. Ready to get organized?</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Features Section for Non-Users */}
      {!user && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Powerful Features for Smarter Learning</h2>
              <p className="text-xl max-w-3xl mx-auto font-semibold text-gray-600">Discover the tools that make StudyBuddy the perfect companion for your academic journey</p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-300 border-2 border-gray-800 shadow-brutal p-6 hover:bg-gray-400 transition-all duration-200"
                  style={{
                    boxShadow: "4px 4px #323232",
                    animationDelay: `${index * 200}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translate(-2px, -2px)";
                    e.target.style.boxShadow = "6px 6px #323232";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translate(0, 0)";
                    e.target.style.boxShadow = "4px 4px #323232";
                  }}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-800 border-2 border-gray-800 shadow-brutal flex items-center justify-center text-white text-xl" style={{ boxShadow: "2px 2px #323232" }}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 font-semibold leading-relaxed">{feature.description}</p>
                  <Link
                    to={feature.link}
                    className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-white border-2 border-gray-800 shadow-brutal font-bold text-gray-800 hover:bg-gray-100 transition-all duration-200"
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
                    <span>Try Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quote Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gray-300 border-2 border-gray-800 shadow-brutal" style={{ boxShadow: "6px 6px #323232" }}>
            <div className="w-16 h-16 bg-gray-800 border-2 border-gray-800 shadow-brutal mx-auto mb-6 flex items-center justify-center" style={{ boxShadow: "2px 2px #323232" }}>
              <Award className="w-8 h-8 text-white" />
            </div>

            <blockquote className="text-2xl md:text-3xl font-bold mb-6 italic text-gray-800">"Education is the most powerful weapon which you can use to change the world."</blockquote>

            <p className="text-lg font-bold text-gray-600 mb-8">- Nelson Mandela</p>

            <div className="p-6 bg-white border-2 border-gray-800 shadow-brutal" style={{ boxShadow: "3px 3px #323232" }}>
              <p className="text-lg leading-relaxed font-semibold text-gray-600">{user ? "Keep pushing forward in your learning journey. Every task completed and every question asked brings you closer to your goals." : "Start your journey today and join thousands of students who are already transforming their learning experience with StudyBuddy."}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
