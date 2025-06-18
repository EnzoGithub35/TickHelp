import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ticketService } from "../../services/ticketService";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { Ticket, Comment } from "../../types";
import "../../styles/TicketDetail.css"; // Adjust the path as necessary

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchTicketData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch ticket details
        const ticketResponse = await ticketService.getTicketById(id);
        setTicket(ticketResponse.data);

        // Fetch ticket comments
        const commentsResponse = await ticketService.getTicketComments(id);
        setComments(commentsResponse.data);
      } catch (err) {
        console.error("Error fetching ticket data:", err);
        setError("Failed to fetch ticket details");
      } finally {
        setLoading(false);
      }
    };

    fetchTicketData();
  }, [id]);

  // Format date string
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Helper function to determine priority badge color
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "low":
        return "badge-info";
      case "medium":
        return "badge-warning";
      case "high":
        return "badge-danger";
      case "urgent":
        return "badge-urgent";
      default:
        return "badge-info";
    }
  };

  // Helper function to determine status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "todo":
        return "badge-secondary";
      case "in_progress":
        return "badge-primary";
      case "resolved":
        return "badge-success";
      case "closed":
        return "badge-dark";
      default:
        return "badge-secondary";
    }
  };

  // Helper function to format status for display
  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setSubmittingComment(true);

      const response = await ticketService.addComment(
        id as string,
        commentContent,
        isInternalComment
      );

      // Add new comment to the list
      setComments([...comments, response.data]);
      setCommentContent("");
      setIsInternalComment(false);
      toast.success("Comment added successfully");
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle ticket deletion
  const handleDeleteTicket = async () => {
    if (!ticket) return;

    if (
      window.confirm(
        `Are you sure you want to delete this ticket: ${ticket.title}?`
      )
    ) {
      try {
        await ticketService.deleteTicket(id as string);
        toast.success("Ticket deleted successfully");
        navigate("/tickets");
      } catch (err) {
        console.error("Error deleting ticket:", err);
        toast.error("Failed to delete ticket");
      }
    }
  };

  const canEdit = () => {
    if (!user || !ticket) return false;
    return (
      user.role === "admin" ||
      user.role === "manager" ||
      user.id === ticket.reporterId
    );
  };

  const canDelete = () => {
    if (!user) return false;
    return user.role === "admin" || user.role === "manager";
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} />;
  }

  if (error || !ticket) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || "Ticket not found"}</p>
        <button
          className="button button-primary"
          onClick={() => navigate("/tickets")}
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="ticket-detail-container">
      <div className="ticket-detail-header">
        <div className="header-title">
          <h1>
            Ticket #{ticket.id}: {ticket.title}
          </h1>
          <div className="ticket-badges">
            <span className={`badge ${getStatusBadgeClass(ticket.status)}`}>
              {formatStatus(ticket.status)}
            </span>
            <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
              {ticket.priority.charAt(0).toUpperCase() +
                ticket.priority.slice(1)}
            </span>
            <span className="badge badge-type">
              {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)}
            </span>
          </div>
        </div>
        <div className="header-actions">
          {canEdit() && (
            <button
              className="button button-secondary"
              onClick={() => navigate(`/tickets/edit/${ticket.id}`)}
            >
              Edit
            </button>
          )}
          {canDelete() && (
            <button
              className="button button-danger"
              onClick={handleDeleteTicket}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="ticket-detail-content">
        <div className="ticket-main">
          <div className="ticket-section">
            <h2>Description</h2>
            <div className="ticket-description">
              {ticket.description ? (
                <p>{ticket.description}</p>
              ) : (
                <p className="no-content">No description provided.</p>
              )}
            </div>
          </div>

          {ticket.tags && ticket.tags.length > 0 && (
            <div className="ticket-section">
              <h2>Tags</h2>
              <div className="ticket-tags">
                {ticket.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="ticket-section">
            <h2>Comments</h2>
            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`comment ${
                      comment.isInternal ? "internal-comment" : ""
                    }`}
                  >
                    <div className="comment-header">
                      <div className="comment-user">
                        <div className="comment-avatar">
                          {comment.user?.avatarUrl ? (
                            <img
                              src={comment.user.avatarUrl}
                              alt="User avatar"
                            />
                          ) : (
                            <div className="avatar-placeholder">
                              {comment.user
                                ? `${comment.user.firstName[0]}${comment.user.lastName[0]}`
                                : "U"}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="comment-author">
                            {comment.user
                              ? `${comment.user.firstName} ${comment.user.lastName}`
                              : "Unknown User"}
                          </span>
                          <span className="comment-date">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                      </div>
                      {comment.isInternal && (
                        <span className="internal-badge">Internal</span>
                      )}
                    </div>
                    <div className="comment-content">{comment.content}</div>
                  </div>
                ))
              ) : (
                <p className="no-comments">No comments yet.</p>
              )}
            </div>

            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Add a comment..."
                rows={4}
                className="comment-input"
              />
              <div className="comment-form-actions">
                <label className="internal-comment-checkbox">
                  <input
                    type="checkbox"
                    checked={isInternalComment}
                    onChange={() => setIsInternalComment(!isInternalComment)}
                  />
                  <span>Internal Comment</span>
                </label>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={submittingComment || !commentContent.trim()}
                >
                  {submittingComment ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    "Add Comment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="ticket-sidebar">
          <div className="ticket-info-card">
            <h2>Ticket Details</h2>

            <div className="info-row">
              <span className="info-label">Created</span>
              <span className="info-value">{formatDate(ticket.createdAt)}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Updated</span>
              <span className="info-value">{formatDate(ticket.updatedAt)}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Reporter</span>
              <span className="info-value">
                {ticket.reporter
                  ? `${ticket.reporter.firstName} ${ticket.reporter.lastName}`
                  : "Unknown"}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Assignee</span>
              <span className="info-value">
                {ticket.assignee
                  ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
                  : "Unassigned"}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Due Date</span>
              <span className="info-value">
                {ticket.dueDate
                  ? formatDate(ticket.dueDate).split(",")[0]
                  : "Not set"}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Estimated Hours</span>
              <span className="info-value">
                {ticket.estimatedHours !== undefined
                  ? `${ticket.estimatedHours}h`
                  : "Not estimated"}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Actual Hours</span>
              <span className="info-value">
                {ticket.actualHours !== undefined
                  ? `${ticket.actualHours}h`
                  : "Not logged"}
              </span>
            </div>
          </div>

          <div className="back-to-tickets">
            <button
              className="button button-outline"
              onClick={() => navigate("/tickets")}
            >
              Back to Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
