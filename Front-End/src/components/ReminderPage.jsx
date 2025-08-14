import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Clock, CheckCircle, AlertCircle, X, Save, Calendar } from "lucide-react";

const DateTimePicker = ({ value, onChange, label, required = false }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (value) {

      const dateObj = new Date(value);


      const dateStr = dateObj.getFullYear() + "-" + String(dateObj.getMonth() + 1).padStart(2, "0") + "-" + String(dateObj.getDate()).padStart(2, "0");


      const timeStr = String(dateObj.getHours()).padStart(2, "0") + ":" + String(dateObj.getMinutes()).padStart(2, "0");

      setDate(dateStr);
      setTime(timeStr);
    }
  }, [value]);

  const createDateTime = (dateValue, timeValue) => {
    if (!dateValue || !timeValue) return null;

 
    const [year, month, day] = dateValue.split("-").map(Number);
    const [hours, minutes] = timeValue.split(":").map(Number);


    const dateObj = new Date(year, month - 1, day, hours, minutes);

    return dateObj.toISOString();
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    const combined = createDateTime(newDate, time);
    if (combined) {
      onChange(combined);
    }
  };

  const handleTimeChange = (newTime) => {
    setTime(newTime);
    const combined = createDateTime(date, newTime);
    if (combined) {
      onChange(combined);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2" style={{ color: "#2d5016" }}>
        {label} {required && "*"}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#6b7280" }}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{
              borderColor: "#84a98c",
              focusRingColor: "#52796f",
            }}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#6b7280" }}>
            Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{
              borderColor: "#84a98c",
              focusRingColor: "#52796f",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const ReminderPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    reminderTime: "",
    type: "general",
  });

  const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchReminders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setReminders([]);
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/reminder`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Authentication failed. Please login again.");
          setReminders([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReminders(data);
      setError("");
    } catch (err) {
      setError(err.message);
      console.error("Error fetching reminders:", err);
    } finally {
      setLoading(false);
    }
  };

  const createReminder = async (reminderData) => {
    try {

      const apiData = {
        title: reminderData.title,
        dueDateTime: reminderData.reminderTime,
        type: reminderData.type,
        notified: false,
      };

      const response = await fetch(`${API_BASE}/reminder`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Authentication failed. Please login again.");
          return false;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create reminder: ${response.status}`);
      }

      const newReminder = await response.json();
      setReminders((prev) => [...prev, newReminder]);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const updateReminder = async (id, reminderData) => {
    try {

      const apiData = {
        title: reminderData.title,
        dueDateTime: reminderData.reminderTime,
        type: reminderData.type,
      };

      const response = await fetch(`${API_BASE}/reminder/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Authentication failed. Please login again.");
          return false;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update reminder: ${response.status}`);
      }

      const updatedReminder = await response.json();
      setReminders((prev) => prev.map((r) => (r._id === id ? updatedReminder : r)));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const deleteReminder = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/reminder/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Authentication failed. Please login again.");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.reminderTime) {
      setError("Please fill in all required fields");
      return;
    }

    const success = editingId ? await updateReminder(editingId, formData) : await createReminder(formData);

    if (success) {
      setFormData({ title: "", reminderTime: "", type: "general" });
      setShowForm(false);
      setEditingId(null);
      setError("");
    }
  };

  const startEdit = (reminder) => {
    setFormData({
      title: reminder.title,
      reminderTime: reminder.dueDateTime || reminder.reminderTime, 
      type: reminder.type,
    });
    setEditingId(reminder._id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setFormData({ title: "", reminderTime: "", type: "general" });
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (reminder) => {
    const now = new Date();
    const dueDate = new Date(reminder.dueDateTime || reminder.reminderTime);
    const isOverdue = dueDate < now;

    if (reminder.notified) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (isOverdue) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    } else {
      return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusText = (reminder) => {
    const now = new Date();
    const dueDate = new Date(reminder.dueDateTime || reminder.reminderTime);
    const isOverdue = dueDate < now;

    if (reminder.notified) return "Completed";
    if (isOverdue) return "Overdue";
    return "Pending";
  };

  useEffect(() => {
    fetchReminders();


    const interval = setInterval(fetchReminders, 30000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fefcf7" }}>
      <div className="max-w-4xl mx-auto p-6">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#2d5016" }}>
              My Reminders
            </h1>
            <p className="mt-2" style={{ color: "#6b7280" }}>
              Stay organized with your personal reminder system
            </p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90" style={{ backgroundColor: "#52796f" }}>
            <Plus className="w-4 h-4" />
            New Reminder
          </button>
        </div>


        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-200" style={{ backgroundColor: "#fef2f2" }}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}


        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md rounded-lg shadow-xl" style={{ backgroundColor: "#f8f6f0" }}>
              <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: "#84a98c" }}>
                <h2 className="text-xl font-semibold" style={{ color: "#2d5016" }}>
                  {editingId ? "Edit Reminder" : "Create New Reminder"}
                </h2>
                <button onClick={cancelForm} className="p-1 rounded hover:bg-gray-100">
                  <X className="w-5 h-5" style={{ color: "#6b7280" }} />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: "#2d5016" }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{
                      borderColor: "#84a98c",
                      focusRingColor: "#52796f",
                    }}
                    placeholder="Enter reminder title"
                    onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
                  />
                </div>

                <DateTimePicker value={formData.reminderTime} onChange={(value) => setFormData((prev) => ({ ...prev, reminderTime: value }))} label="Due Date & Time" required />

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: "#2d5016" }}>
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{
                      borderColor: "#84a98c",
                      focusRingColor: "#52796f",
                    }}
                  >
                    <option value="general">General</option>
                    <option value="study">Study</option>
                    <option value="task">Task</option>
                    <option value="event">Event</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleSubmit} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90" style={{ backgroundColor: "#52796f" }}>
                    <Save className="w-4 h-4" />
                    {editingId ? "Update" : "Create"} Reminder
                  </button>
                  <button
                    onClick={cancelForm}
                    className="px-4 py-2 border rounded-lg font-medium transition-colors hover:bg-gray-50"
                    style={{
                      borderColor: "#84a98c",
                      color: "#6b7280",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: "#52796f" }}></div>
              <p style={{ color: "#6b7280" }}>Loading reminders...</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto mb-4" style={{ color: "#84a98c" }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: "#2d5016" }}>
                No reminders yet
              </h3>
              <p style={{ color: "#6b7280" }}>Create your first reminder to get started</p>
            </div>
          ) : (
            reminders.map((reminder) => (
              <div
                key={reminder._id}
                className="p-6 rounded-lg shadow-sm border transition-shadow hover:shadow-md"
                style={{
                  backgroundColor: "#f8f6f0",
                  borderColor: "#84a98c",
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(reminder)}
                      <h3 className="text-lg font-medium truncate" style={{ color: "#2d5016" }}>
                        {reminder.title}
                      </h3>
                      <span
                        className="px-2 py-1 text-xs rounded-full font-medium"
                        style={{
                          backgroundColor: "#d4a574",
                          color: "#2d5016",
                        }}
                      >
                        {reminder.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm" style={{ color: "#6b7280" }}>
                      <span>Due: {formatDateTime(reminder.dueDateTime || reminder.reminderTime)}</span>
                      <span className="font-medium">{getStatusText(reminder)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => startEdit(reminder)} className="p-2 rounded-lg transition-colors hover:bg-white" style={{ color: "#52796f" }}>
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteReminder(reminder._id)} className="p-2 rounded-lg transition-colors hover:bg-red-50" style={{ color: "#dc2626" }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>


        <div className="mt-12 text-center text-sm" style={{ color: "#6b7280" }}>
          <p>Reminders refresh automatically every 30 seconds</p>
        </div>
      </div>
    </div>
  );
};

export default ReminderPage;
