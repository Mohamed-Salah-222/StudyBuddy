import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DiscussionDetails = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);

  const isCreator = discussion?.startedBy?.toString() === user?.userId?.toString();

  const fetchDiscussion = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/discussion/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setDiscussion(data);
    } catch (err) {
      console.error("Error loading discussion", err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/discussions/${id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Error loading comments", err);
      setComments([]); // Set empty array on error
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDiscussion(), fetchComments()]);
      setLoading(false);
    };

    if (id && token) {
      loadData();
    }
  }, [id, token]);

  const handleToggleStatus = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/discussion/${id}/toggle-status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      fetchDiscussion();
    } catch (err) {
      console.error("Failed to toggle status", err);
      alert("Failed to toggle status");
    }
  };

  const handleDeleteDiscussion = async () => {
    if (!confirm("Are you sure you want to delete this discussion?")) {
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/discussion/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      navigate("/forum");
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete discussion");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert("Please enter a comment");
      return;
    }

    console.log("Adding comment with data:", {
      content: newComment.trim(),
      userId: user?.userId,
      discussionId: id,
    });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/discussions/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      console.log("Add comment response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Add comment error:", errorData);
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const newCommentData = await res.json();
      console.log("Comment added successfully:", newCommentData);

      setNewComment("");
      await fetchComments(); // Refresh comments
    } catch (err) {
      console.error("Comment add failed", err);
      alert(`Failed to add comment: ${err.message}`);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) {
      alert("Please enter comment content");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const updatedComment = await res.json();
      console.log("Comment updated successfully:", updatedComment);

      setEditCommentId(null);
      setEditContent("");
      await fetchComments(); // Refresh comments
    } catch (err) {
      console.error("Comment update failed", err);
      alert(`Failed to update comment: ${err.message}`);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      console.log("Comment deleted successfully");
      await fetchComments(); // Refresh comments
    } catch (err) {
      console.error("Delete comment failed", err);
      alert(`Failed to delete comment: ${err.message}`);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!discussion) return <p>Discussion not found</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">{discussion.title}</h2>
      <p className="text-gray-700 mb-2">{discussion.context}</p>
      <p className="text-sm text-gray-500 mb-2">
        Status: {discussion.status} | Created: {new Date(discussion.createdAt).toLocaleString()}
      </p>

      {isCreator && (
        <div className="flex gap-2 mb-4">
          <button onClick={handleToggleStatus} className="bg-yellow-500 px-3 py-1 rounded text-white">
            Toggle Status
          </button>
          <button onClick={handleDeleteDiscussion} className="bg-red-600 px-3 py-1 rounded text-white">
            Delete
          </button>
        </div>
      )}

      <hr className="my-4" />

      <h3 className="text-lg font-semibold mb-2">Comments ({comments.length})</h3>

      {comments.length === 0 ? (
        <p className="text-gray-500 mb-6">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment._id} className="border p-3 rounded shadow-sm">
              {editCommentId === comment._id ? (
                <div>
                  <textarea className="w-full border rounded p-2" value={editContent} onChange={(e) => setEditContent(e.target.value)} rows="3" />
                  <div className="mt-2">
                    <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleEditComment(comment._id)}>
                      Save
                    </button>
                    <button
                      className="ml-2 text-gray-600 underline"
                      onClick={() => {
                        setEditCommentId(null);
                        setEditContent("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-2">{comment.content}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    By: {comment.postedBy?.username || "Unknown User"} • {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
                  </p>
                  {(comment.postedBy?._id?.toString() === user?.userId?.toString() || isCreator) && (
                    <div className="space-x-2">
                      {comment.postedBy?._id?.toString() === user?.userId?.toString() && (
                        <button
                          className="text-blue-600 underline text-sm"
                          onClick={() => {
                            setEditCommentId(comment._id);
                            setEditContent(comment.content);
                          }}
                        >
                          Edit
                        </button>
                      )}
                      <button className="text-red-600 underline text-sm" onClick={() => handleDeleteComment(comment._id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div>
        <textarea className="w-full border rounded p-2 mb-2" placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} rows="3" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAddComment} disabled={!newComment.trim()}>
          Add Comment
        </button>
      </div>
    </div>
  );
};

export default DiscussionDetails;
