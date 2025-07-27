import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const TasksPage = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    tags: "",
  });

  // Filter and sort states
  const [filters, setFilters] = useState({
    status: "all", // all, completed, pending
    priority: "all", // all, Urgent, High, Medium, Low
    tag: "all",
    search: "",
  });
  const [sortBy, setSortBy] = useState("dueDate"); // dueDate, priority, created, title
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc

  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef(null);

  // Priority colors and order for sorting
  const priorityColors = {
    Urgent: "bg-red-100 text-red-800 border-red-200",
    High: "bg-orange-100 text-orange-800 border-orange-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Low: "bg-green-100 text-green-800 border-green-200",
  };

  const priorityOrder = { Urgent: 4, High: 3, Medium: 2, Low: 1 };

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError("Failed to load tasks");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add new task
  const addTask = async (taskData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      resetForm();
    } catch (err) {
      setError("Failed to add task");
      console.error("Error adding task:", err);
    }
  };

  // Update task - FIXED: Changed from PUT to PATCH
  const updateTask = async (taskId, taskData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`, {
        method: "PATCH", // Changed from PUT to PATCH
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));
      resetForm();
    } catch (err) {
      setError("Failed to update task");
      console.error("Error updating task:", err);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (err) {
      setError("Failed to delete task");
      console.error("Error deleting task:", err);
    }
  };

  // Toggle task completion - FIXED: Only send the fields that your API expects
  const toggleTaskCompletion = async (task) => {
    try {
      const updateData = {
        title: task.title,
        priority: task.priority,
        dueDate: task.dueDate,
        tags: task.tags,
        completed: !task.completed, // Only toggle the completed status
      };
      await updateTask(task._id, updateData);
    } catch (err) {
      setError("Failed to update task");
      console.error("Error toggling task completion:", err);
    }
  };

  // Form handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const taskData = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    };

    if (editingTask) {
      updateTask(editingTask._id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      tags: "",
    });
    setShowAddForm(false);
    setEditingTask(null);
  };

  const startEditing = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      priority: task.priority,
      tags: task.tags ? task.tags.join(", ") : "",
    });
    setShowAddForm(true);
  };

  // Filter and sort logic
  const getFilteredAndSortedTasks = () => {
    let filteredTasks = [...tasks];

    // Apply filters
    if (filters.status !== "all") {
      filteredTasks = filteredTasks.filter((task) => (filters.status === "completed" ? task.completed : !task.completed));
    }

    if (filters.priority !== "all") {
      filteredTasks = filteredTasks.filter((task) => task.priority === filters.priority);
    }

    if (filters.tag !== "all") {
      filteredTasks = filteredTasks.filter((task) => task.tags && task.tags.includes(filters.tag));
    }

    if (filters.search) {
      filteredTasks = filteredTasks.filter((task) => task.title.toLowerCase().includes(filters.search.toLowerCase()) || (task.description && task.description.toLowerCase().includes(filters.search.toLowerCase())));
    }

    // Apply sorting
    filteredTasks.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "priority":
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case "created":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === "desc") {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    });

    return filteredTasks;
  };

  // Get unique tags for filter dropdown
  const getUniqueTags = () => {
    const allTags = tasks.flatMap((task) => task.tags || []);
    return [...new Set(allTags)];
  };

  // Effects
  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTasks = getFilteredAndSortedTasks();
  const uniqueTags = getUniqueTags();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: "#52796f" }}></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#2d5016" }}>
            📝 Smart Todo List
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Organize your tasks with intelligent prioritization
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filters Toggle */}
          <div className="relative" ref={filtersRef}>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors duration-200 hover:bg-gray-50" style={{ borderColor: "rgba(82, 121, 111, 0.2)", color: "#52796f" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
            </button>

            {/* Filters Dropdown */}
            {showFilters && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg py-4 px-4 ring-1 ring-black ring-opacity-5 z-50" style={{ backgroundColor: "#fefcf7", borderColor: "rgba(82, 121, 111, 0.2)" }}>
                <div className="space-y-4">
                  {/* Search */}
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "#6b7280" }}>
                      Search
                    </label>
                    <input type="text" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Search tasks..." className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ borderColor: "rgba(82, 121, 111, 0.2)", focusRingColor: "#52796f" }} />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "#6b7280" }}>
                      Status
                    </label>
                    <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ borderColor: "rgba(82, 121, 111, 0.2)" }}>
                      <option value="all">All Tasks</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "#6b7280" }}>
                      Priority
                    </label>
                    <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ borderColor: "rgba(82, 121, 111, 0.2)" }}>
                      <option value="all">All Priorities</option>
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  {/* Tag Filter */}
                  {uniqueTags.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "#6b7280" }}>
                        Tag
                      </label>
                      <select value={filters.tag} onChange={(e) => setFilters({ ...filters, tag: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ borderColor: "rgba(82, 121, 111, 0.2)" }}>
                        <option value="all">All Tags</option>
                        {uniqueTags.map((tag) => (
                          <option key={tag} value={tag}>
                            {tag}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Sort Options */}
                  <div className="border-t pt-4" style={{ borderColor: "rgba(82, 121, 111, 0.1)" }}>
                    <label className="block text-xs font-medium mb-2" style={{ color: "#6b7280" }}>
                      Sort By
                    </label>
                    <div className="flex gap-2">
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2" style={{ borderColor: "rgba(82, 121, 111, 0.2)" }}>
                        <option value="dueDate">Due Date</option>
                        <option value="priority">Priority</option>
                        <option value="created">Created</option>
                        <option value="title">Title</option>
                      </select>
                      <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors duration-200" style={{ borderColor: "rgba(82, 121, 111, 0.2)", color: "#52796f" }}>
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add Task Button */}
          <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg" style={{ background: "linear-gradient(to right, #52796f, #84a98c)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      {/* Tasks Summary */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border" style={{ backgroundColor: "#fefcf7", borderColor: "rgba(82, 121, 111, 0.2)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">{tasks.length}</span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#2d5016" }}>
                  Total Tasks
                </p>
                <p className="text-xs" style={{ color: "#6b7280" }}>
                  All tasks created
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border" style={{ backgroundColor: "#fefcf7", borderColor: "rgba(82, 121, 111, 0.2)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">{tasks.filter((t) => t.completed).length}</span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#2d5016" }}>
                  Completed
                </p>
                <p className="text-xs" style={{ color: "#6b7280" }}>
                  Tasks finished
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border" style={{ backgroundColor: "#fefcf7", borderColor: "rgba(82, 121, 111, 0.2)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 font-bold">{tasks.filter((t) => !t.completed).length}</span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#2d5016" }}>
                  Pending
                </p>
                <p className="text-xs" style={{ color: "#6b7280" }}>
                  Tasks remaining
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border" style={{ backgroundColor: "#fefcf7", borderColor: "rgba(82, 121, 111, 0.2)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-bold">{tasks.filter((t) => !t.completed && (t.priority === "Urgent" || t.priority === "High")).length}</span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#2d5016" }}>
                  High Priority
                </p>
                <p className="text-xs" style={{ color: "#6b7280" }}>
                  Urgent & High tasks
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#fefcf7" }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: "#2d5016" }}>
                  {editingTask ? "Edit Task" : "Add New Task"}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#2d5016" }}>
                    Title *
                  </label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: "rgba(82, 121, 111, 0.2)" }} placeholder="Enter task title" />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#2d5016" }}>
                    Description
                  </label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: "rgba(82, 121, 111, 0.2)" }} placeholder="Enter task description" />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#2d5016" }}>
                    Due Date
                  </label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: "rgba(82, 121, 111, 0.2)" }} />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#2d5016" }}>
                    Priority
                  </label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: "rgba(82, 121, 111, 0.2)" }}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#2d5016" }}>
                    Tags
                  </label>
                  <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: "rgba(82, 121, 111, 0.2)" }} placeholder="Enter tags separated by commas" />
                  <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
                    Separate multiple tags with commas
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={resetForm} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors duration-200" style={{ borderColor: "rgba(82, 121, 111, 0.2)", color: "#52796f" }}>
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105" style={{ background: "linear-gradient(to right, #52796f, #84a98c)" }}>
                    {editingTask ? "Update Task" : "Add Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: "#2d5016" }}>
              {tasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}
            </h3>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              {tasks.length === 0 ? "Create your first task to get started!" : "Try adjusting your filters to see more tasks."}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task._id}
              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${task.completed ? "opacity-75" : ""}`}
              style={{
                backgroundColor: "#fefcf7",
                borderColor: "rgba(82, 121, 111, 0.2)",
                borderLeft: `4px solid ${task.priority === "Urgent" ? "#ef4444" : task.priority === "High" ? "#f97316" : task.priority === "Medium" ? "#eab308" : "#22c55e"}`,
              }}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button onClick={() => toggleTaskCompletion(task)} className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${task.completed ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-green-400"}`}>
                  {task.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.completed ? "line-through text-gray-500" : ""}`} style={{ color: task.completed ? "#6b7280" : "#2d5016" }}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`text-sm mt-1 ${task.completed ? "line-through text-gray-400" : ""}`} style={{ color: task.completed ? "#9ca3af" : "#6b7280" }}>
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEditing(task)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200" title="Edit task">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => deleteTask(task._id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200" title="Delete task">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Task Meta */}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {/* Priority */}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityColors[task.priority]}`}>{task.priority}</span>

                    {/* Due Date */}
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: "#6b7280" }}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TasksPage;
