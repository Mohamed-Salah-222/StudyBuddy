import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, ExternalLink, Trash2, Tag, Calendar, Globe, FileText, Image, Video, Book } from "lucide-react";
import { useNotification } from "../context/NotificationContext"; // Adjust path as needed

const StudyResourceCollector = () => {
  const { showNotification } = useNotification();
  const [resources, setResources] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterTag, setFilterTag] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    type: "article",
    tags: "",
  });

  // Get token from localStorage or other storage
  const getAuthToken = () => {
    // Try multiple common token storage keys
    return token || localStorage?.getItem("token") || localStorage?.getItem("authToken") || localStorage?.getItem("jwt") || localStorage?.getItem("accessToken") || sessionStorage?.getItem("token") || sessionStorage?.getItem("authToken");
  };

  // Create headers with authentication
  const getAuthHeaders = () => {
    const authToken = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    return headers;
  };

  // Fetch resources from API
  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching from:", `${import.meta.env.VITE_API_URL}/api/resources`); // Debug log

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      console.log("Response status:", response.status); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);

        if (response.status === 401) {
          const errorMsg = "Authentication failed. Please check your token or login again.";
          setError(errorMsg);
          showNotification(errorMsg, "error");
        } else {
          const errorMsg = `Failed to fetch resources: HTTP ${response.status} - ${errorText}`;
          setError(errorMsg);
          showNotification(errorMsg, "error");
        }
        return;
      }

      const data = await response.json();
      console.log("Received data:", data); // Debug log

      // Handle different response formats
      const resourcesArray = Array.isArray(data) ? data : data.resources || data.data || [];
      setResources(resourcesArray);
    } catch (error) {
      console.error("Error fetching resources:", error);
      const errorMsg = `Failed to fetch resources: ${error.message}`;
      setError(errorMsg);
      showNotification(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const getTypeIcon = (type) => {
    const iconProps = { size: 16, className: "text-forest-green" };
    switch (type) {
      case "article":
        return <FileText {...iconProps} />;
      case "video":
        return <Video {...iconProps} />;
      case "image":
        return <Image {...iconProps} />;
      case "book":
        return <Book {...iconProps} />;
      default:
        return <Globe {...iconProps} />;
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      article: "bg-blue-100 text-blue-800",
      video: "bg-red-100 text-red-800",
      image: "bg-green-100 text-green-800",
      book: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[type] || colors.other;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.url) {
      showNotification("Please fill in both title and URL fields", "error");
      return;
    }

    setLoading(true);

    try {
      const resourceData = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };

      console.log("Sending data:", resourceData); // Debug log
      console.log("POST URL:", `${import.meta.env.VITE_API_URL}/api/resources`); // Debug log

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(resourceData),
      });

      console.log("POST Response status:", response.status); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.error("POST Error response:", errorText);

        if (response.status === 401) {
          showNotification("Authentication failed. Please check your token or login again.", "error");
        } else {
          showNotification(`Failed to add resource: HTTP ${response.status} - ${errorText}`, "error");
        }
        return;
      }

      const newResource = await response.json();
      console.log("Created resource:", newResource); // Debug log

      // Handle different response formats
      const resource = newResource.resource || newResource.data || newResource;

      // Add the new resource to the beginning of the list
      setResources((prevResources) => [resource, ...prevResources]);

      // Reset form
      setFormData({
        title: "",
        url: "",
        description: "",
        type: "article",
        tags: "",
      });
      setShowAddForm(false);

      // Show success message
      showNotification("Resource added successfully!", "success");
    } catch (error) {
      console.error("Error adding resource:", error);
      showNotification(`Failed to add resource: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    try {
      console.log("Deleting resource:", id); // Debug log
      console.log("DELETE URL:", `${import.meta.env.VITE_API_URL}/api/resources/${id}`); // Debug log

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      console.log("DELETE Response status:", response.status); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DELETE Error response:", errorText);

        if (response.status === 401) {
          showNotification("Authentication failed. Please check your token or login again.", "error");
        } else {
          showNotification(`Failed to delete resource: HTTP ${response.status} - ${errorText}`, "error");
        }
        return;
      }

      // Remove the resource from the list
      setResources((prevResources) => prevResources.filter((r) => r._id !== id));
      showNotification("Resource deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting resource:", error);
      showNotification(`Failed to delete resource: ${error.message}`, "error");
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || resource.type === filterType;
    const matchesTag = !filterTag || resource.tags.some((tag) => tag.toLowerCase().includes(filterTag.toLowerCase()));

    return matchesSearch && matchesType && matchesTag;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const allTags = [...new Set(resources.flatMap((r) => r.tags))];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fefcf7" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#2d5016" }}>
            Study Resources
          </h1>
          <p className="text-gray-600">Collect and organize your study materials for easy access</p>
        </div>

        {/* Token Input (if needed) */}
        {!getAuthToken() && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 mb-3">No authentication token found. Please enter your token:</p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Enter your authentication token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: "#f8f6f0",
                  focusRingColor: "#84a98c",
                }}
              />
              <button onClick={fetchResources} className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: "#52796f" }}>
                Load Resources
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: "#52796f" }}>
                <Plus size={20} />
                Add Resource
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "cards" ? "text-white" : "text-gray-600 hover:text-gray-800"}`}
                  style={{
                    backgroundColor: viewMode === "cards" ? "#84a98c" : "transparent",
                  }}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "table" ? "text-white" : "text-gray-600 hover:text-gray-800"}`}
                  style={{
                    backgroundColor: viewMode === "table" ? "#84a98c" : "transparent",
                  }}
                >
                  Table
                </button>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{
                    backgroundColor: "#f8f6f0",
                    focusRingColor: "#84a98c",
                  }}
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: "#f8f6f0",
                  focusRingColor: "#84a98c",
                }}
              >
                <option value="all">All Types</option>
                <option value="article">Articles</option>
                <option value="video">Videos</option>
                <option value="image">Images</option>
                <option value="book">Books</option>
                <option value="other">Other</option>
              </select>

              <input
                type="text"
                placeholder="Filter by tag..."
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: "#f8f6f0",
                  focusRingColor: "#84a98c",
                }}
              />
            </div>
          </div>
        </div>

        {/* Add Resource Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#2d5016" }}>
                Add New Resource
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#2d5016" }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{
                      backgroundColor: "#f8f6f0",
                      focusRingColor: "#84a98c",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#2d5016" }}>
                    URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{
                      backgroundColor: "#f8f6f0",
                      focusRingColor: "#84a98c",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#2d5016" }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{
                      backgroundColor: "#f8f6f0",
                      focusRingColor: "#84a98c",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#2d5016" }}>
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{
                      backgroundColor: "#f8f6f0",
                      focusRingColor: "#84a98c",
                    }}
                  >
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                    <option value="book">Book</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#2d5016" }}>
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. react, javascript, tutorial"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{
                      backgroundColor: "#f8f6f0",
                      focusRingColor: "#84a98c",
                    }}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 py-2 px-4 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50" style={{ backgroundColor: "#52796f" }}>
                    {loading ? "Adding..." : "Add Resource"}
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors" style={{ color: "#6b7280" }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button onClick={fetchResources} className="mt-2 text-sm text-red-600 hover:text-red-800 underline">
              Try again
            </button>
          </div>
        )}

        {/* Resources Display */}
        {loading && resources.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#84a98c" }}></div>
            <p className="text-gray-500 text-lg">Loading resources...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No resources found</p>
            <p className="text-gray-400 mt-2">{resources.length === 0 ? "Start by adding your first study resource!" : "Try adjusting your search or filters"}</p>
          </div>
        ) : viewMode === "cards" ? (
          /* Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div key={resource._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow" style={{ backgroundColor: "#f8f6f0" }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(resource.type)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>{resource.type}</span>
                  </div>
                  <button onClick={() => handleDelete(resource._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="font-semibold text-lg mb-2 line-clamp-2" style={{ color: "#2d5016" }}>
                  {resource.title}
                </h3>

                {resource.description && <p className="text-gray-600 text-sm mb-3 line-clamp-3">{resource.description}</p>}

                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: "#d4a574",
                        color: "#2d5016",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    {formatDate(resource.createdAt)}
                  </div>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: "#52796f" }}>
                    Visit <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden" style={{ backgroundColor: "#f8f6f0" }}>
              <thead style={{ backgroundColor: "#84a98c" }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date Added</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResources.map((resource) => (
                  <tr key={resource._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(resource.type)}
                          <h4 className="font-medium" style={{ color: "#2d5016" }}>
                            {resource.title}
                          </h4>
                        </div>
                        {resource.description && <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>{resource.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs rounded-full"
                            style={{
                              backgroundColor: "#d4a574",
                              color: "#2d5016",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        {resource.tags.length > 3 && <span className="text-xs text-gray-500">+{resource.tags.length - 3} more</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(resource.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline" style={{ color: "#52796f" }}>
                          <ExternalLink size={16} />
                        </a>
                        <button onClick={() => handleDelete(resource._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Resource Count */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredResources.length} of {resources.length} resources
        </div>
      </div>
    </div>
  );
};

export default StudyResourceCollector;
