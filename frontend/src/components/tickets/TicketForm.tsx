import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ticketService } from "../../services/ticketService";
import { userService } from "../../services/userService";
import {
  CreateTicketData,
  UpdateTicketData,
  Ticket,
  User,
  ApiResponse,
  PaginatedResponse,
} from "../../types";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import "../../styles/TicketForm.css";

const emptyTicket: CreateTicketData = {
  title: "",
  description: "",
  priority: "medium",
  type: "task",
  assigneeId: undefined,
  dueDate: undefined,
  estimatedHours: undefined,
  tags: [],
};

const TicketForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<CreateTicketData | UpdateTicketData>(
    emptyTicket
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users for assignee dropdown
        const usersResponse = (await userService.getUsers(
          1,
          100
        )) as ApiResponse<PaginatedResponse<User>>;
        setUsers(usersResponse.data.data);

        // If editing, fetch ticket details
        if (isEditMode && id) {
          const ticketResponse = (await ticketService.getTicketById(
            id
          )) as ApiResponse<Ticket>;
          const currentTicket = ticketResponse.data;

          setTicket({
            title: currentTicket.title,
            description: currentTicket.description || "",
            priority: currentTicket.priority,
            type: currentTicket.type,
            status: currentTicket.status,
            assigneeId: currentTicket.assigneeId,
            dueDate: currentTicket.dueDate
              ? new Date(currentTicket.dueDate).toISOString().split("T")[0]
              : undefined,
            estimatedHours: currentTicket.estimatedHours,
            actualHours: currentTicket.actualHours,
            tags: currentTicket.tags || [],
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Utilisation de l'opérateur d'enchaînement optionnel pour éviter les erreurs
    if (!ticket.title?.trim()) {
      newErrors.title = "Title is required";
    } else if (ticket.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (
      ticket.estimatedHours !== undefined &&
      (isNaN(Number(ticket.estimatedHours)) ||
        Number(ticket.estimatedHours) < 0)
    ) {
      newErrors.estimatedHours = "Estimated hours must be a positive number";
    }

    if (
      isEditMode &&
      (ticket as UpdateTicketData).actualHours !== undefined &&
      (isNaN(Number((ticket as UpdateTicketData).actualHours)) ||
        Number((ticket as UpdateTicketData).actualHours) < 0)
    ) {
      newErrors.actualHours = "Actual hours must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    let parsedValue: any = value;

    // Parse numeric fields
    if (name === "estimatedHours" || name === "actualHours") {
      parsedValue = value === "" ? undefined : Number(value);
    }

    setTicket({
      ...ticket,
      [name]: parsedValue,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !ticket.tags?.includes(tagInput.trim())) {
      setTicket({
        ...ticket,
        tags: [...(ticket.tags || []), tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleTagDelete = (tag: string) => {
    setTicket({
      ...ticket,
      tags: (ticket.tags || []).filter((t) => t !== tag),
    });
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    try {
      setSubmitting(true);

      if (isEditMode && id) {
        await ticketService.updateTicket(id, ticket as UpdateTicketData);
        toast.success("Ticket updated successfully");
      } else {
        // Set current user as reporter for new tickets
        const newTicket = { ...ticket };
        await ticketService.createTicket(newTicket as CreateTicketData);
        toast.success("Ticket created successfully");
      }

      // Navigate back to tickets list
      navigate("/tickets");
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast.error(
        isEditMode ? "Failed to update ticket" : "Failed to create ticket"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} />;
  }

  return (
    <div className="ticket-form-container">
      <div className="ticket-form-header">
        <h1>{isEditMode ? "Edit Ticket" : "Create New Ticket"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="ticket-form">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={ticket.title}
              onChange={handleChange}
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              placeholder="Enter ticket title"
              required
            />
            {errors.title && (
              <div className="invalid-feedback">{errors.title}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={ticket.description || ""}
              onChange={handleChange}
              className="form-control"
              placeholder="Describe the ticket"
              rows={5}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">
                Type <span className="required">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={ticket.type}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="task">Task</option>
                <option value="improvement">Improvement</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">
                Priority <span className="required">*</span>
              </label>
              <select
                id="priority"
                name="priority"
                value={ticket.priority}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {isEditMode && (
              <div className="form-group">
                <label htmlFor="status">
                  Status <span className="required">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={(ticket as UpdateTicketData).status}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="assigneeId">Assignee</label>
              <select
                id="assigneeId"
                name="assigneeId"
                value={ticket.assigneeId || ""}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {`${user.firstName} ${user.lastName} (${user.role})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={ticket.dueDate || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estimatedHours">Estimated Hours</label>
              <input
                type="number"
                id="estimatedHours"
                name="estimatedHours"
                value={
                  ticket.estimatedHours === undefined
                    ? ""
                    : ticket.estimatedHours
                }
                onChange={handleChange}
                className={`form-control ${
                  errors.estimatedHours ? "is-invalid" : ""
                }`}
                min="0"
                step="0.5"
              />
              {errors.estimatedHours && (
                <div className="invalid-feedback">{errors.estimatedHours}</div>
              )}
            </div>

            {isEditMode && (
              <div className="form-group">
                <label htmlFor="actualHours">Actual Hours</label>
                <input
                  type="number"
                  id="actualHours"
                  name="actualHours"
                  value={
                    (ticket as UpdateTicketData).actualHours === undefined
                      ? ""
                      : (ticket as UpdateTicketData).actualHours
                  }
                  onChange={handleChange}
                  className={`form-control ${
                    errors.actualHours ? "is-invalid" : ""
                  }`}
                  min="0"
                  step="0.5"
                />
                {errors.actualHours && (
                  <div className="invalid-feedback">{errors.actualHours}</div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tags-input-container">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add tags and press Enter"
                className="form-control tag-input"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="tag-add-btn"
              >
                Add
              </button>
            </div>
            <div className="tags-list">
              {ticket.tags &&
                ticket.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagDelete(tag)}
                      className="tag-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
            </div>
            <small className="form-text text-muted">
              Press Enter or click Add to add a tag
            </small>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/tickets")}
          >
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? (
              <LoadingSpinner size="small" />
            ) : isEditMode ? (
              "Update Ticket"
            ) : (
              "Create Ticket"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;
