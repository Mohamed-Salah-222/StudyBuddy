import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, ExternalLink, Trash2, Tag, Calendar, Globe, FileText, Image, Video, Book } from "lucide-react";
import { useNotification } from "../context/NotificationContext"; // Adjust path as needed

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, resourceTitle, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        <div className="p-6 text-center">
          <div className="mx-auto mb-6 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">Delete Resource</h3>

          <p className="text-gray-600 mb-2">Are you sure you want to delete this resource?</p>

          <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 truncate">"{resourceTitle}"</p>
            <p className="text-xs text-orange-600 mt-1">Resources are not uploading to Google Cloud Storage on the prod...</p>
          </div>

          <p className="text-sm text-red-500 mb-6">This action cannot be undone.</p>

          <div className="flex gap-3">
            <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50">
              {loading ? "Deleting..." : "Delete Resource"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudyResourceCollector = () => {
  const { showNotification } = useNotification();
  const [resources, setResources] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterTag, setFilterTag] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    type: "article",
    tags: "",
  });

  const getAuthToken = () => {
    return token || localStorage?.getItem("token") || localStorage?.getItem("authToken") || localStorage?.getItem("jwt") || localStorage?.getItem("accessToken") || sessionStorage?.getItem("token") || sessionStorage?.getItem("authToken");
  };

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

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching from:", `${import.meta.env.VITE_API_URL}/api/resources`);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      console.log("Response status:", response.status);

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
      console.log("Received data:", data);

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

      console.log("Sending data:", resourceData);
      console.log("POST URL:", `${import.meta.env.VITE_API_URL}/api/resources`);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(resourceData),
      });

      console.log("POST Response status:", response.status);

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
      console.log("Created resource:", newResource);

      const resource = newResource.resource || newResource.data || newResource;

      setResources((prevResources) => [resource, ...prevResources]);

      setFormData({
        title: "",
        url: "",
        description: "",
        type: "article",
        tags: "",
      });
      setShowAddForm(false);

      showNotification("Resource added successfully!", "success");
    } catch (error) {
      console.error("Error adding resource:", error);
      showNotification(`Failed to add resource: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (resource) => {
    setResourceToDelete(resource);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;

    setDeleteLoading(true);

    try {
      console.log("Deleting resource:", resourceToDelete._id);
      console.log("DELETE URL:", `${import.meta.env.VITE_API_URL}/api/resources/${resourceToDelete._id}`);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources/${resourceToDelete._id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      console.log("DELETE Response status:", response.status);

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

      setResources((prevResources) => prevResources.filter((r) => r._id !== resourceToDelete._id));
      showNotification("Resource deleted successfully!", "success");

      setShowDeleteModal(false);
      setResourceToDelete(null);
    } catch (error) {
      console.error("Error deleting resource:", error);
      showNotification(`Failed to delete resource: ${error.message}`, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setResourceToDelete(null);
  };

  const handleDelete = async (id) => {
    const resource = resources.find((r) => r._id === id);
    if (resource) {
      handleDeleteClick(resource);
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Study Resources</h1>
          <p className="text-gray-600 font-semibold">Collect and organize your study materials for easy access</p>
        </div>

        {!getAuthToken() && (
          <div className="mb-6 p-5 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)]">
            <p className="text-gray-800 mb-3 font-semibold">No authentication token found. Please enter your token:</p>
            <div className="flex gap-2">
              <input type="password" placeholder="Enter your authentication token" value={token} onChange={(e) => setToken(e.target.value)} className="flex-1 px-3 py-2 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold outline-none focus:shadow-[4px_4px_0px_0px_theme(colors.blue.500)] focus:border-blue-500" />
              <button onClick={fetchResources} className="px-4 py-2 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold hover:bg-gray-800 hover:text-white transition-all duration-250">
                Load Resources
              </button>
            </div>
          </div>
        )}

        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold hover:bg-gray-800 hover:text-white transition-all duration-250">
                <Plus size={20} />
                Add Resource
              </button>

              <div className="flex gap-2">
                <button onClick={() => setViewMode("cards")} className={`px-3 py-2 border-2 border-gray-800 rounded font-semibold transition-all duration-250 ${viewMode === "cards" ? "bg-gray-800 text-white shadow-[4px_4px_0px_0px_theme(colors.gray.600)]" : "bg-white text-gray-800 shadow-[4px_4px_0px_0px_theme(colors.gray.800)] hover:bg-gray-800 hover:text-white"}`}>
                  Cards
                </button>
                <button onClick={() => setViewMode("table")} className={`px-3 py-2 border-2 border-gray-800 rounded font-semibold transition-all duration-250 ${viewMode === "table" ? "bg-gray-800 text-white shadow-[4px_4px_0px_0px_theme(colors.gray.600)]" : "bg-white text-gray-800 shadow-[4px_4px_0px_0px_theme(colors.gray.800)] hover:bg-gray-800 hover:text-white"}`}>
                  Table
                </button>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
                <input type="text" placeholder="Search resources..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold outline-none focus:shadow-[4px_4px_0px_0px_theme(colors.blue.500)] focus:border-blue-500" />
              </div>

              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold outline-none focus:shadow-[4px_4px_0px_0px_theme(colors.blue.500)] focus:border-blue-500">
                <option value="all">All Types</option>
                <option value="Links">Links</option>
                <option value="video">Videos</option>
                <option value="image">Images</option>
                <option value="Document">Documents</option>
                <option value="other">Other</option>
              </select>

              <input type="text" placeholder="Filter by tag..." value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="px-3 py-2 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold outline-none focus:shadow-[4px_4px_0px_0px_theme(colors.blue.500)] focus:border-blue-500" />
            </div>
          </div>
        </div>

        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-300 border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Resource</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-800">Title *</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold outline-none focus:shadow-[4px_4px_0px_0px_theme(colors.blue.500)] focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-800">URL *</label>
                  <input type="url" required value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full px-3 py-2 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold outline-none focus:shadow-[4px_4px_0px_0px_theme(colors.blue.500)] focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-800">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold outline-none focus:shadow-[4px_4px_0px_0px_theme(colors.blue.500)] focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-800">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold outline-none focus:shadow-[4px_4px_0px_0px_theme(colors.blue.500)] focus:border-blue-500">
                    <option value="link">link</option>
                    <option value="video">video</option>
                    <option value="image">image</option>
                    <option value="document">document</option>
                    <option value="text">text</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-800">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. react, javascript, tutorial"
                    className="w-full px-3 py-2 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold outline-none focus:shadow-[4px_4px_0px_0px_theme(colors.blue.500)] focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 py-2 px-4 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold hover:bg-gray-800 hover:text-white transition-all duration-250 disabled:opacity-50">
                    {loading ? "Adding..." : "Add Resource"}
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-2 px-4 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-600 font-semibold hover:bg-gray-800 hover:text-white transition-all duration-250">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <DeleteConfirmationModal isOpen={showDeleteModal} onClose={handleCancelDelete} onConfirm={handleConfirmDelete} resourceTitle={resourceToDelete?.title || ""} loading={deleteLoading} />

        {error && (
          <div className="mb-6 p-4 bg-white border-2 border-red-600 rounded shadow-[4px_4px_0px_0px_theme(colors.red.600)]">
            <p className="text-red-600 font-semibold">{error}</p>
            <button onClick={fetchResources} className="mt-2 text-sm text-red-600 hover:text-red-800 underline font-semibold">
              Try again
            </button>
          </div>
        )}

        {loading && resources.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-gray-800 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-semibold">Loading resources...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg font-semibold">No resources found</p>
            <p className="text-gray-500 mt-2 font-medium">{resources.length === 0 ? "Start by adding your first study resource!" : "Try adjusting your search or filters"}</p>
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div key={resource._id} className="bg-gray-300 border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] p-5 hover:shadow-[6px_6px_0px_0px_theme(colors.gray.800)] transition-all duration-250">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(resource.type)}
                    <span className={`px-2 py-1 border-2 border-gray-800 rounded text-xs font-semibold shadow-[2px_2px_0px_0px_theme(colors.gray.800)] ${getTypeColor(resource.type)}`}>{resource.type}</span>
                  </div>
                  <button onClick={() => handleDeleteClick(resource)} className="text-gray-600 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-800">{resource.title}</h3>

                {resource.description && <p className="text-gray-600 text-sm mb-3 line-clamp-3 font-medium">{resource.description}</p>}

                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 text-xs border-2 border-gray-800 rounded shadow-[2px_2px_0px_0px_theme(colors.gray.800)] bg-gray-200 text-gray-800 font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t-2 border-gray-800">
                  <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                    <Calendar size={12} />
                    {formatDate(resource.createdAt)}
                  </div>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-semibold hover:underline text-gray-800">
                    Visit <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Date Added</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-800">
                {filteredResources.map((resource) => (
                  <tr key={resource._id} className="hover:bg-gray-100 bg-gray-300">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(resource.type)}
                          <h4 className="font-semibold text-gray-800">{resource.title}</h4>
                        </div>
                        {resource.description && <p className="text-sm text-gray-600 line-clamp-2 font-medium">{resource.description}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 border-2 border-gray-800 rounded text-xs font-semibold shadow-[2px_2px_0px_0px_theme(colors.gray.800)] ${getTypeColor(resource.type)}`}>{resource.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs border-2 border-gray-800 rounded shadow-[2px_2px_0px_0px_theme(colors.gray.800)] bg-gray-200 text-gray-800 font-semibold">
                            {tag}
                          </span>
                        ))}
                        {resource.tags.length > 3 && <span className="text-xs text-gray-600 font-medium">+{resource.tags.length - 3} more</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{formatDate(resource.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:underline text-gray-800">
                          <ExternalLink size={16} />
                        </a>
                        <button onClick={() => handleDeleteClick(resource)} className="text-gray-600 hover:text-red-500 transition-colors">
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

        <div className="mt-6 text-center text-sm text-gray-600 font-medium">
          Showing {filteredResources.length} of {resources.length} resources
        </div>
      </div>
    </div>
  );
};

export default StudyResourceCollector;
