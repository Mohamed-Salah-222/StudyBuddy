import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const DiscussionForum = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState([]);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    context: "",
    tags: "",
  });

  const [uniqueTags, setUniqueTags] = useState([]);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/discussion`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setDiscussions(data);
        setFilteredDiscussions(data);
        const tags = new Set();
        data.forEach((d) => d.tags.forEach((t) => tags.add(t)));
        setUniqueTags(["All", ...Array.from(tags)]);
      } catch (err) {
        console.error("Failed to fetch discussions", err);
      }
    };
    fetchDiscussions();
  }, [token]);

  useEffect(() => {
    let filtered = [...discussions];
    if (tagFilter !== "All") {
      filtered = filtered.filter((d) => d.tags.includes(tagFilter));
    }
    if (search) {
      filtered = filtered.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredDiscussions(filtered);
  }, [search, tagFilter, discussions]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, context, tags } = formData;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/discussion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          context,
          tags: tags.split(",").map((tag) => tag.trim()),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDiscussions((prev) => [data, ...prev]);
        setShowForm(false);
        setFormData({ title: "", context: "", tags: "" });
      } else {
        alert(data.message || "Failed to create discussion");
      }
    } catch (error) {
      console.error("Error creating discussion", error);
    }
  };

  const handleRowClick = (id) => {
    navigate(`/discussion/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">Study Discussions</h1>
          <p className="text-lg text-gray-600 font-medium">Connect, collaborate, and learn together with your study community</p>
        </div>

        <div className="bg-gray-300 border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <button className="bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] font-semibold px-6 py-3 text-gray-800 hover:bg-gray-800 hover:text-white transition-all duration-250 min-w-fit" onClick={() => setShowForm((prev) => !prev)}>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
                </svg>
                {showForm ? "Close Form" : "Create Discussion"}
              </span>
            </button>

            <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-2xl w-full">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search discussions..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold outline-none focus:shadow-[4px_4px_0px_0px_theme(colors.blue.500)] focus:border-blue-500" />
              </div>

              <div className="relative">
                <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="appearance-none px-4 py-3 pr-10 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold outline-none focus:shadow-[4px_4px_0px_0px_theme(colors.blue.500)] focus:border-blue-500 min-w-[160px]">
                  {uniqueTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="bg-gray-300 border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-200 border-2 border-gray-800 rounded shadow-[2px_2px_0px_0px_theme(colors.gray.800)] flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Start a New Discussion</h2>
            </div>

            <div onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Discussion Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold outline-none focus:shadow-[4px_4px_0px_0px_theme(colors.blue.500)] focus:border-blue-500" placeholder="What would you like to discuss?" required />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Context & Description</label>
                <textarea
                  name="context"
                  value={formData.context}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold outline-none focus:shadow-[4px_4px_0px_0px_theme(colors.blue.500)] focus:border-blue-500 resize-none"
                  placeholder="Provide more details about your discussion topic..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Tags</label>
                <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] text-gray-800 font-semibold outline-none focus:shadow-[4px_4px_0px_0px_theme(colors.blue.500)] focus:border-blue-500" placeholder="math, science, history (comma-separated)" required />
                <p className="text-xs mt-1 text-gray-600 font-medium">Add relevant tags to help others find your discussion</p>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] font-semibold px-8 py-3 text-gray-800 hover:bg-gray-800 hover:text-white transition-all duration-250">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Start Discussion
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-300 border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_theme(colors.gray.800)] overflow-hidden">
          <div className="px-8 py-6 border-b-2 border-gray-800">
            <h2 className="text-xl font-bold text-gray-800">Recent Discussions</h2>
            <p className="text-sm mt-1 text-gray-600 font-medium">Join ongoing conversations in your study community</p>
          </div>

          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left py-4 px-6 font-bold text-white">Discussion</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Started By</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Created</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-800">
                {filteredDiscussions.map((disc, index) => (
                  <tr key={disc._id} onClick={() => handleRowClick(disc._id)} className="cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-800">{disc.title}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-800 text-white rounded shadow-[2px_2px_0px_0px_theme(colors.gray.600)] flex items-center justify-center text-sm font-semibold">{(disc.startedBy?.username || "?").charAt(0).toUpperCase()}</div>
                        <span className="text-gray-600 font-medium">{disc.startedBy?.username || "Anonymous"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      {new Date(disc.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: new Date(disc.createdAt).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {disc.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs px-3 py-1 bg-gray-200 border-2 border-gray-800 rounded shadow-[2px_2px_0px_0px_theme(colors.gray.800)] font-semibold text-gray-800">
                            {tag}
                          </span>
                        ))}
                        {disc.tags.length > 3 && <span className="text-xs px-2 py-1 text-gray-600 font-medium">+{disc.tags.length - 3}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y-2 divide-gray-800">
            {filteredDiscussions.map((disc) => (
              <div key={disc._id} onClick={() => handleRowClick(disc._id)} className="p-6 cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">{disc.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gray-800 text-white rounded shadow-[2px_2px_0px_0px_theme(colors.gray.600)] flex items-center justify-center text-xs font-semibold">{(disc.startedBy?.username || "?").charAt(0).toUpperCase()}</div>
                  <span className="text-sm text-gray-600 font-medium">
                    {disc.startedBy?.username || "Anonymous"} • {new Date(disc.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {disc.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-200 border-2 border-gray-800 rounded shadow-[2px_2px_0px_0px_theme(colors.gray.800)] font-semibold text-gray-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredDiscussions.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-200 border-2 border-gray-800 rounded shadow-[2px_2px_0px_0px_theme(colors.gray.800)] mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">No Discussions Found</h3>
              <p className="text-gray-600 font-medium">Be the first to start a conversation!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionForum;
