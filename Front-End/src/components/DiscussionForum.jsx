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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50 p-6" style={{ backgroundColor: "#fefcf7" }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse opacity-30" style={{ background: "radial-gradient(circle, rgba(132, 169, 140, 0.2) 0%, rgba(82, 121, 111, 0.1) 100%)" }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 opacity-30" style={{ background: "radial-gradient(circle, rgba(212, 165, 116, 0.2) 0%, rgba(132, 169, 140, 0.1) 100%)" }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        <div className="mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              background: "linear-gradient(135deg, #2d5016 0%, #52796f 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Study Discussions
          </h1>
          <p className="text-lg" style={{ color: "#6b7280" }}>
            Connect, collaborate, and learn together with your study community
          </p>
        </div>

        <div
          className="backdrop-blur-xl border rounded-2xl shadow-lg p-6 mb-8"
          style={{
            backgroundColor: "rgba(248, 246, 240, 0.95)",
            borderColor: "rgba(132, 169, 140, 0.2)",
            boxShadow: "0 20px 25px -5px rgba(45, 80, 22, 0.1), 0 10px 10px -5px rgba(45, 80, 22, 0.04)",
          }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

            <button
              className="group relative overflow-hidden font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg min-w-fit"
              style={{
                background: "linear-gradient(135deg, #84a98c 0%, #52796f 100%)",
                color: "#fefcf7",
                boxShadow: "0 10px 25px -5px rgba(82, 121, 111, 0.4)",
              }}
              onClick={() => setShowForm((prev) => !prev)}
              onMouseEnter={(e) => {
                e.target.style.background = "linear-gradient(135deg, #52796f 0%, #2d5016 100%)";
                e.target.style.boxShadow = "0 15px 35px -5px rgba(82, 121, 111, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "linear-gradient(135deg, #84a98c 0%, #52796f 100%)";
                e.target.style.boxShadow = "0 10px 25px -5px rgba(82, 121, 111, 0.4)";
              }}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
                </svg>
                {showForm ? "Close Form" : "Create Discussion"}
              </span>
            </button>

            <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-2xl w-full">

              <div className="relative flex-1 group">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" fill="none" stroke="#6b7280" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "#84a98c",
                    backgroundColor: "rgba(248, 246, 240, 0.8)",
                    color: "#2d5016",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#52796f";
                    e.target.style.boxShadow = "0 0 0 3px rgba(132, 169, 140, 0.2)";
                    e.target.style.backgroundColor = "rgba(248, 246, 240, 1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#84a98c";
                    e.target.style.boxShadow = "none";
                    e.target.style.backgroundColor = "rgba(248, 246, 240, 0.8)";
                  }}
                />
              </div>

              <div className="relative">
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="appearance-none px-4 py-3 pr-10 rounded-xl border-2 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 min-w-[160px]"
                  style={{
                    borderColor: "#84a98c",
                    backgroundColor: "rgba(248, 246, 240, 0.8)",
                    color: "#2d5016",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#52796f";
                    e.target.style.boxShadow = "0 0 0 3px rgba(132, 169, 140, 0.2)";
                    e.target.style.backgroundColor = "rgba(248, 246, 240, 1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#84a98c";
                    e.target.style.boxShadow = "none";
                    e.target.style.backgroundColor = "rgba(248, 246, 240, 0.8)";
                  }}
                >
                  {uniqueTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" fill="none" stroke="#6b7280" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>


        {showForm && (
          <div
            className="backdrop-blur-xl border rounded-2xl shadow-lg p-8 mb-8 transform animate-in slide-in-from-top duration-300"
            style={{
              backgroundColor: "rgba(248, 246, 240, 0.95)",
              borderColor: "rgba(132, 169, 140, 0.2)",
              boxShadow: "0 20px 25px -5px rgba(45, 80, 22, 0.1), 0 10px 10px -5px rgba(45, 80, 22, 0.04)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(132, 169, 140, 0.2)" }}>
                <svg className="w-5 h-5" fill="none" stroke="#52796f" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "#2d5016" }}>
                Start a New Discussion
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2d5016" }}>
                  Discussion Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "#84a98c",
                    backgroundColor: "rgba(248, 246, 240, 0.8)",
                    color: "#2d5016",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#52796f";
                    e.target.style.boxShadow = "0 0 0 3px rgba(132, 169, 140, 0.2)";
                    e.target.style.backgroundColor = "rgba(248, 246, 240, 1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#84a98c";
                    e.target.style.boxShadow = "none";
                    e.target.style.backgroundColor = "rgba(248, 246, 240, 0.8)";
                  }}
                  placeholder="What would you like to discuss?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2d5016" }}>
                  Context & Description
                </label>
                <textarea
                  name="context"
                  value={formData.context}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border-2 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
                  style={{
                    borderColor: "#84a98c",
                    backgroundColor: "rgba(248, 246, 240, 0.8)",
                    color: "#2d5016",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#52796f";
                    e.target.style.boxShadow = "0 0 0 3px rgba(132, 169, 140, 0.2)";
                    e.target.style.backgroundColor = "rgba(248, 246, 240, 1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#84a98c";
                    e.target.style.boxShadow = "none";
                    e.target.style.backgroundColor = "rgba(248, 246, 240, 0.8)";
                  }}
                  placeholder="Provide more details about your discussion topic..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2d5016" }}>
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "#84a98c",
                    backgroundColor: "rgba(248, 246, 240, 0.8)",
                    color: "#2d5016",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#52796f";
                    e.target.style.boxShadow = "0 0 0 3px rgba(132, 169, 140, 0.2)";
                    e.target.style.backgroundColor = "rgba(248, 246, 240, 1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#84a98c";
                    e.target.style.boxShadow = "none";
                    e.target.style.backgroundColor = "rgba(248, 246, 240, 0.8)";
                  }}
                  placeholder="math, science, history (comma-separated)"
                  required
                />
                <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
                  Add relevant tags to help others find your discussion
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #d4a574 0%, #84a98c 100%)",
                    color: "#fefcf7",
                    boxShadow: "0 10px 25px -5px rgba(212, 165, 116, 0.4)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #84a98c 0%, #52796f 100%)";
                    e.target.style.boxShadow = "0 15px 35px -5px rgba(132, 169, 140, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #d4a574 0%, #84a98c 100%)";
                    e.target.style.boxShadow = "0 10px 25px -5px rgba(212, 165, 116, 0.4)";
                  }}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Start Discussion
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}


        <div
          className="backdrop-blur-xl border rounded-2xl shadow-lg overflow-hidden"
          style={{
            backgroundColor: "rgba(248, 246, 240, 0.95)",
            borderColor: "rgba(132, 169, 140, 0.2)",
            boxShadow: "0 20px 25px -5px rgba(45, 80, 22, 0.1), 0 10px 10px -5px rgba(45, 80, 22, 0.04)",
          }}
        >

          <div className="px-8 py-6 border-b" style={{ borderColor: "rgba(132, 169, 140, 0.2)" }}>
            <h2 className="text-xl font-bold" style={{ color: "#2d5016" }}>
              Recent Discussions
            </h2>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
              Join ongoing conversations in your study community
            </p>
          </div>


          <div className="hidden md:block">
            <table className="w-full">
              <thead style={{ backgroundColor: "rgba(132, 169, 140, 0.1)" }}>
                <tr>
                  <th className="text-left py-4 px-6 font-semibold" style={{ color: "#2d5016" }}>
                    Discussion
                  </th>
                  <th className="text-left py-4 px-6 font-semibold" style={{ color: "#2d5016" }}>
                    Started By
                  </th>
                  <th className="text-left py-4 px-6 font-semibold" style={{ color: "#2d5016" }}>
                    Created
                  </th>
                  <th className="text-left py-4 px-6 font-semibold" style={{ color: "#2d5016" }}>
                    Tags
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDiscussions.map((disc, index) => (
                  <tr
                    key={disc._id}
                    onClick={() => handleRowClick(disc._id)}
                    className="cursor-pointer transition-all duration-200 border-b hover:scale-[1.01] transform"
                    style={{
                      borderColor: "rgba(132, 169, 140, 0.1)",
                      backgroundColor: index % 2 === 0 ? "transparent" : "rgba(132, 169, 140, 0.03)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(132, 169, 140, 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? "transparent" : "rgba(132, 169, 140, 0.03)";
                    }}
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold" style={{ color: "#2d5016" }}>
                        {disc.title}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: "#84a98c", color: "#fefcf7" }}>
                          {(disc.startedBy?.username || "?").charAt(0).toUpperCase()}
                        </div>
                        <span style={{ color: "#6b7280" }}>{disc.startedBy?.username || "Anonymous"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6" style={{ color: "#6b7280" }}>
                      {new Date(disc.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: new Date(disc.createdAt).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {disc.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs px-3 py-1 rounded-full font-medium"
                            style={{
                              backgroundColor: "rgba(212, 165, 116, 0.2)",
                              color: "#2d5016",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        {disc.tags.length > 3 && (
                          <span className="text-xs px-2 py-1 rounded-full" style={{ color: "#6b7280" }}>
                            +{disc.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          <div className="md:hidden divide-y" style={{ borderColor: "rgba(132, 169, 140, 0.1)" }}>
            {filteredDiscussions.map((disc) => (
              <div
                key={disc._id}
                onClick={() => handleRowClick(disc._id)}
                className="p-6 cursor-pointer transition-all duration-200 hover:bg-opacity-80"
                style={{ backgroundColor: "rgba(132, 169, 140, 0.03)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(132, 169, 140, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(132, 169, 140, 0.03)";
                }}
              >
                <h3 className="font-semibold text-lg mb-2" style={{ color: "#2d5016" }}>
                  {disc.title}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: "#84a98c", color: "#fefcf7" }}>
                    {(disc.startedBy?.username || "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm" style={{ color: "#6b7280" }}>
                    {disc.startedBy?.username || "Anonymous"} • {new Date(disc.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {disc.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: "rgba(212, 165, 116, 0.2)",
                        color: "#2d5016",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>


          {filteredDiscussions.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: "rgba(132, 169, 140, 0.1)" }}>
                <svg className="w-8 h-8" fill="none" stroke="#84a98c" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "#2d5016" }}>
                No Discussions Found
              </h3>
              <p style={{ color: "#6b7280" }}>Be the first to start a conversation!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionForum;
