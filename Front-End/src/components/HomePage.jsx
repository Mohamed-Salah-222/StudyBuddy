import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// HomePage component now accepts 'features' and 'showFeatures' as props
const HomePage = ({ features, showFeatures }) => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // State for fetching and displaying tasks (for logged-in users)
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);

  // Function to fetch tasks from the backend
  const fetchUserTasks = async () => {
    if (!token) {
      setTasks([]);
      setCompletedTasksCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token for authentication
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error("Authentication failed or token expired. Logging out.");
          logout(); // Log out if unauthorized
          navigate("/login");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const fetchedTasks = await response.json();
      setTasks(fetchedTasks);

      // Calculate completed tasks count
      const completedCount = fetchedTasks.filter((task) => task.completed).length;
      setCompletedTasksCount(completedCount);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch tasks when the component mounts or user/token changes
  useEffect(() => {
    fetchUserTasks();
  }, [user, token]); // Re-run when user or token changes

  // The 'features' array is now passed as a prop from App.jsx, so it's removed here.

  // Updated stats array - "Study Hours" removed, "Tasks Completed" linked to state
  const stats = [
    { label: "Tasks Completed", value: completedTasksCount, icon: "✅" },
    { label: "Group Sessions", value: "23", icon: "👥" }, // Placeholder, can be dynamic later
    { label: "Achievement Points", value: "1,547", icon: "🏆" }, // Placeholder, can be dynamic later
  ];

  const getPriorityColor = (priority) => {
    return priority === "Urgent" ? { backgroundColor: "rgba(220, 38, 38, 0.1)", color: "#dc2626", borderColor: "rgba(220, 38, 38, 0.2)" } : { backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", borderColor: "rgba(245, 158, 11, 0.2)" };
  };

  return (
    <div className="min-h-screen">
      {/* Hero/Welcome Section */}
      <div className="text-center mb-20 py-16 relative">
        <div className="absolute inset-0 rounded-3xl blur-3xl -z-10" style={{ background: "radial-gradient(ellipse at center, rgba(132, 169, 140, 0.08) 0%, transparent 70%)" }} />

        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 rounded-2xl blur-2xl -z-10" style={{ background: "linear-gradient(135deg, rgba(132, 169, 140, 0.15) 0%, rgba(212, 165, 116, 0.15) 100%)" }} />
          <h1 className="text-5xl md:text-7xl font-extrabold relative z-10" style={{ color: "#2d5016" }}>
            Welcome to <span style={{ color: "#52796f" }}>StudyBuddy</span>
          </h1>
          {user && (
            <p className="text-2xl md:text-3xl mt-4" style={{ color: "#52796f" }}>
              Hello,{" "}
              <span className="font-semibold" style={{ color: "#2d5016" }}>
                {user.username}
              </span>
              ! 👋
            </p>
          )}
        </div>

        <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed" style={{ color: "#6b7280" }}>
          Your intelligent learning companion designed to make studying more effective, organized, and enjoyable with AI-powered tools and collaborative features.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            className="text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 flex items-center space-x-2"
            style={{ background: "linear-gradient(to right, #52796f, #84a98c)", boxShadow: "0 4px 6px -1px rgba(82, 121, 111, 0.25)" }}
            onMouseEnter={(e) => {
              e.target.style.background = "linear-gradient(to right, #84a98c, #d4a574)";
              e.target.style.boxShadow = "0 10px 15px -3px rgba(82, 121, 111, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "linear-gradient(to right, #52796f, #84a98c)";
              e.target.style.boxShadow = "0 4px 6px -1px rgba(82, 121, 111, 0.25)";
            }}
          >
            <span>▶️</span>
            <span>Get Started</span>
          </button>
          <button
            className="px-8 py-4 rounded-xl border-2 text-lg font-medium transition-all duration-300"
            style={{ color: "#52796f", borderColor: "rgba(132, 169, 140, 0.3)", backgroundColor: "rgba(248, 246, 240, 0.8)" }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(132, 169, 140, 0.1)";
              e.target.style.borderColor = "rgba(132, 169, 140, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(248, 246, 240, 0.8)";
              e.target.style.borderColor = "rgba(132, 169, 140, 0.3)";
            }}
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Stats Section - Only for logged-in users */}
      {user && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-20 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="backdrop-blur-xl border rounded-2xl p-6 text-center shadow-lg hover:scale-105 transition-all duration-300"
              style={{
                backgroundColor: "rgba(132, 169, 140, 0.1)",
                borderColor: "rgba(82, 121, 111, 0.2)",
                boxShadow: "0 4px 6px -1px rgba(82, 121, 111, 0.1)",
              }}
            >
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: "#2d5016" }}>
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: "#6b7280" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Tasks Section - Only for logged-in users */}
      {user && (
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold flex items-center space-x-3" style={{ color: "#2d5016" }}>
              <span>📋</span> {/* Generic task icon */}
              <span>My Tasks</span>
            </h2>
          </div>

          {loading ? (
            <div className="text-center text-lg" style={{ color: "#6b7280" }}>
              Loading tasks...
            </div>
          ) : error ? (
            <div className="text-center text-lg text-red-600">{error}</div>
          ) : tasks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tasks.map((task) => (
                <div
                  key={task._id} // Use _id from MongoDB
                  className="backdrop-blur-xl border rounded-2xl p-6 shadow-lg hover:scale-105 transition-all duration-300 group"
                  style={{
                    backgroundColor: "rgba(132, 169, 140, 0.05)",
                    borderColor: "rgba(82, 121, 111, 0.2)",
                    boxShadow: "0 4px 6px -1px rgba(82, 121, 111, 0.1)",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-xl">
                      {task.completed ? "✅" : "📝"} {/* Show checkmark if completed */}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold border" style={getPriorityColor(task.priority)}>
                      {task.priority}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-3 group-hover:opacity-80 line-clamp-2" style={{ color: "#2d5016" }}>
                    {task.title}
                  </h3>
                  <div className="flex items-center text-sm" style={{ color: "#6b7280" }}>
                    <span className="mr-2">⏰</span>
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                  </div>
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {task.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: "rgba(82, 121, 111, 0.1)", color: "#52796f" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-lg" style={{ color: "#6b7280" }}>
              No tasks found for you. Start by adding one!
            </div>
          )}
        </div>
      )}

      {/* Features Sections - Only for logged-out users */}
      {showFeatures && (
        <div className="space-y-32 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="py-20">
              <div className={`max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "md:grid-flow-col-dense" : ""}`}>
                {/* Text Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? "md:col-start-2" : ""}`}>
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: "#2d5016" }}>
                    {feature.title}
                  </h2>
                  <p className="text-lg md:text-xl leading-relaxed" style={{ color: "#6b7280" }}>
                    {feature.description}
                  </p>
                  <div className="pt-4">
                    <button
                      className="text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 flex items-center space-x-2"
                      style={{ background: feature.gradient, boxShadow: "0 4px 6px -1px rgba(82, 121, 111, 0.25)" }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.05)";
                        e.target.style.boxShadow = "0 10px 15px -3px rgba(82, 121, 111, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow = "0 4px 6px -1px rgba(82, 121, 111, 0.25)";
                      }}
                    >
                      <span>Try {feature.title}</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

                {/* Image/Icon Placeholder */}
                <div className={`${index % 2 === 1 ? "md:col-start-1" : ""}`}>
                  <div
                    className="aspect-square rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm border"
                    style={{
                      background: `${feature.gradient}, rgba(248, 246, 240, 0.9)`,
                      backgroundBlendMode: "overlay",
                      borderColor: "rgba(132, 169, 140, 0.2)",
                    }}
                  >
                    <div className="text-8xl md:text-9xl opacity-90">{feature.icon}</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="text-xs px-4 py-2 rounded-full border backdrop-blur-sm"
                        style={{
                          backgroundColor: "rgba(248, 246, 240, 0.9)",
                          borderColor: "rgba(132, 169, 140, 0.3)",
                          color: "#6b7280",
                        }}
                      >
                        Image Placeholder
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity Section - Only for logged-in users */}
      {user && (
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 flex items-center space-x-3" style={{ color: "#2d5016" }}>
            <span>📈</span>
            <span>Recent Activity</span>
          </h2>

          <div
            className="backdrop-blur-xl border rounded-2xl p-8 shadow-lg"
            style={{
              backgroundColor: "rgba(132, 169, 140, 0.05)",
              borderColor: "rgba(82, 121, 111, 0.2)",
              boxShadow: "0 4px 6px -1px rgba(82, 121, 111, 0.1)",
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 rounded-xl" style={{ backgroundColor: "rgba(132, 169, 140, 0.1)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                  <span className="text-white">✅</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: "#2d5016" }}>
                    Completed "Introduction to Calculus"
                  </p>
                  <p className="text-sm" style={{ color: "#6b7280" }}>
                    5 hours ago
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-xl" style={{ backgroundColor: "rgba(132, 169, 140, 0.1)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
                  <span className="text-white">🧠</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: "#2d5016" }}>
                    Asked AI about "Quantum Mechanics basics"
                  </p>
                  <p className="text-sm" style={{ color: "#6b7280" }}>
                    1 day ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action Section */}
      <div className="text-center pb-16">
        <div
          className="backdrop-blur-xl border rounded-3xl p-12 shadow-lg max-w-4xl mx-auto"
          style={{
            backgroundColor: "rgba(132, 169, 140, 0.08)",
            borderColor: "rgba(82, 121, 111, 0.2)",
            boxShadow: "0 8px 16px -4px rgba(82, 121, 111, 0.15)",
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "#2d5016" }}>
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed" style={{ color: "#6b7280" }}>
            Join thousands of students who have already improved their study habits and academic performance with StudyBuddy's AI-powered tools and collaborative features.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              className="text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(to right, #52796f, #84a98c, #d4a574)", boxShadow: "0 4px 6px -1px rgba(82, 121, 111, 0.25)" }}
              onMouseEnter={(e) => {
                e.target.style.background = "linear-gradient(to right, #84a98c, #d4a574, #52796f)";
                e.target.style.boxShadow = "0 10px 15px -3px rgba(82, 121, 111, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "linear-gradient(to right, #52796f, #84a98c, #d4a574)";
                e.target.style.boxShadow = "0 4px 6px -1px rgba(82, 121, 111, 0.25)";
              }}
            >
              Start Your Journey Today
            </button>
            <button
              className="px-8 py-4 rounded-xl border-2 text-lg font-medium transition-all duration-300"
              style={{ color: "#52796f", borderColor: "rgba(132, 169, 140, 0.3)", backgroundColor: "rgba(248, 246, 240, 0.8)" }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "rgba(132, 169, 140, 0.1)";
                e.target.style.borderColor = "rgba(132, 169, 140, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(248, 246, 240, 0.8)";
                e.target.style.borderColor = "rgba(132, 169, 140, 0.3)";
              }}
            >
              Watch Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
