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
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? "Close Form" : "Create Discussion"}
        </button>

        <input type="text" placeholder="Search by title..." value={search} onChange={(e) => setSearch(e.target.value)} className="border px-3 py-2 rounded w-full md:w-1/3" />

        <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="border px-3 py-2 rounded">
          {uniqueTags.map((tag) => (
            <option key={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 border p-4 rounded shadow-sm bg-gray-50">
          <div className="mb-2">
            <label className="block font-medium">Title:</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full border px-3 py-2 rounded" required />
          </div>

          <div className="mb-2">
            <label className="block font-medium">Context:</label>
            <textarea name="context" value={formData.context} onChange={handleInputChange} className="w-full border px-3 py-2 rounded" required />
          </div>

          <div className="mb-2">
            <label className="block font-medium">Tags (comma-separated):</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} className="w-full border px-3 py-2 rounded" required />
          </div>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2">
            Submit
          </button>
        </form>
      )}

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Started By</th>
            <th className="p-2 border">Created At</th>
            <th className="p-2 border">Tags</th>
          </tr>
        </thead>
        <tbody>
          {filteredDiscussions.map((disc) => (
            <tr key={disc._id} onClick={() => handleRowClick(disc._id)} className="hover:bg-gray-100 cursor-pointer">
              <td className="p-2 border">{disc.title}</td>
              <td className="p-2 border">{disc.startedBy?.username || "N/A"}</td>
              <td className="p-2 border">{new Date(disc.createdAt).toLocaleDateString()}</td>
              <td className="p-2 border">
                {disc.tags.map((tag, i) => (
                  <span key={i} className="inline-block bg-gray-300 text-sm px-2 py-1 rounded mr-1">
                    {tag}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DiscussionForum;
