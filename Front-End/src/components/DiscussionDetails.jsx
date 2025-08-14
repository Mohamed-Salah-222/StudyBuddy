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
      setComments([]); 
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
      await fetchComments(); 
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
      await fetchComments(); 
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
      await fetchComments(); 
    } catch (err) {
      console.error("Delete comment failed", err);
      alert(`Failed to delete comment: ${err.message}`);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!discussion) return <p>Discussion not found</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">

      <div className="bg-gradient-to-r from-[#52796f] to-[#84a98c] p-8 text-white">
        <h2 className="text-3xl font-bold mb-3 leading-tight text-[#fefcf7]">{discussion.title}</h2>
        <p className="text-[#f8f6f0] text-lg leading-relaxed mb-4">{discussion.context}</p>

        <div className="flex items-center gap-4 text-sm">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${discussion.status === "active" ? "bg-[#d4a574]/20 text-[#fefcf7] border border-[#d4a574]/40" : "bg-yellow-500/20 text-[#f8f6f0] border border-yellow-400/30"}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${discussion.status === "active" ? "bg-[#d4a574]" : "bg-yellow-400"}`}></div>
            {discussion.status}
          </span>
          <span className="text-[#f8f6f0] flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Created{" "}
            {new Date(discussion.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {isCreator && (
        <div className="px-8 py-4 bg-[#f8f6f0] border-b border-[#84a98c]/20">
          <div className="flex gap-3">
            <button onClick={handleToggleStatus} className="inline-flex items-center px-4 py-2 bg-[#d4a574] hover:bg-[#d4a574]/80 text-[#2d5016] font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Toggle Status
            </button>
            <button onClick={handleDeleteDiscussion} className="inline-flex items-center px-4 py-2 bg-[#52796f] hover:bg-[#52796f]/80 text-[#fefcf7] font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Delete Discussion
            </button>
          </div>
        </div>
      )}


      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-[#2d5016] flex items-center">
            <svg className="w-6 h-6 mr-3 text-[#52796f]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Comments
          </h3>
          <span className="bg-[#84a98c]/20 text-[#2d5016] text-sm font-semibold px-3 py-1 rounded-full border border-[#84a98c]/30">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </span>
        </div>


        {comments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-[#84a98c]/40 mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <p className="text-[#6b7280] text-lg mb-2">No comments yet</p>
            <p className="text-[#6b7280]/70">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-6 mb-8">
            {comments.map((comment, index) => (
              <div key={comment._id} className="group">
                <div className="bg-[#f8f6f0] rounded-xl p-6 hover:bg-[#fefcf7] transition-colors duration-200 border border-[#84a98c]/20">
                  {editCommentId === comment._id ? (
                    <div className="space-y-4">
                      <textarea className="w-full border-2 border-[#84a98c] rounded-lg p-4 focus:outline-none focus:ring-4 focus:ring-[#84a98c]/20 focus:border-[#52796f] resize-none transition-all duration-200 bg-[#fefcf7]" value={editContent} onChange={(e) => setEditContent(e.target.value)} rows="4" placeholder="Edit your comment..." />
                      <div className="flex gap-3">
                        <button className="inline-flex items-center px-4 py-2 bg-[#52796f] hover:bg-[#52796f]/80 text-[#fefcf7] font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg" onClick={() => handleEditComment(comment._id)}>
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Save Changes
                        </button>
                        <button
                          className="px-4 py-2 text-[#6b7280] hover:text-[#2d5016] font-medium rounded-lg hover:bg-[#84a98c]/10 transition-colors duration-200"
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
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#52796f] to-[#84a98c] rounded-full flex items-center justify-center text-[#fefcf7] font-bold text-sm">{(comment.postedBy?.username || "U").charAt(0).toUpperCase()}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-[#2d5016]">{comment.postedBy?.username || "Unknown User"}</h4>
                            <span className="text-[#6b7280]">•</span>
                            <span className="text-sm text-[#6b7280]">
                              {comment.createdAt
                                ? new Date(comment.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </div>
                          <p className="text-[#2d5016] leading-relaxed">{comment.content}</p>
                        </div>
                      </div>

                      {(comment.postedBy?._id?.toString() === user?.userId?.toString() || isCreator) && (
                        <div className="flex gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {comment.postedBy?._id?.toString() === user?.userId?.toString() && (
                            <button
                              className="inline-flex items-center text-[#52796f] hover:text-[#2d5016] font-medium text-sm transition-colors duration-200"
                              onClick={() => {
                                setEditCommentId(comment._id);
                                setEditContent(comment.content);
                              }}
                            >
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Edit
                            </button>
                          )}
                          <button className="inline-flex items-center text-[#52796f] hover:text-red-700 font-medium text-sm transition-colors duration-200" onClick={() => handleDeleteComment(comment._id)}>
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {index < comments.length - 1 && <div className="h-px bg-gradient-to-r from-transparent via-[#84a98c]/30 to-transparent my-6"></div>}
              </div>
            ))}
          </div>
        )}

        <div className="bg-[#fefcf7] border-2 border-[#84a98c]/20 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2d5016] mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-[#52796f]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Your Comment
          </h4>
          <div className="space-y-4">
            <textarea className="w-full border-2 border-[#84a98c]/40 rounded-lg p-4 focus:outline-none focus:ring-4 focus:ring-[#84a98c]/20 focus:border-[#52796f] resize-none transition-all duration-200 bg-white" placeholder="Share your thoughts, ideas, or questions..." value={newComment} onChange={(e) => setNewComment(e.target.value)} rows="4" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6b7280]">{newComment.length > 0 && `${newComment.length} characters`}</span>
              <button className={`inline-flex items-center px-6 py-3 font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${newComment.trim() ? "bg-[#52796f] hover:bg-[#52796f]/80 text-[#fefcf7] transform hover:-translate-y-0.5" : "bg-[#6b7280]/30 text-[#6b7280] cursor-not-allowed"}`} onClick={handleAddComment} disabled={!newComment.trim()}>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                Post Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetails;
