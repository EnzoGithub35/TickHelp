import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ticketService } from "../../services/ticketService";
import {
  Ticket,
  TicketFilters,
  PaginatedResponse,
  ApiResponse,
} from "../../types";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import "../../styles/TicketList.css";

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<TicketFilters>({
    status: [],
    priority: [],
    type: [],
    search: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, [pagination.page, filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = (await ticketService.getTickets(
        filters,
        pagination.page,
        pagination.limit
      )) as ApiResponse<PaginatedResponse<Ticket>>;

      setTickets(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError("Failed to fetch tickets");
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType: keyof TicketFilters, value: any) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };

      if (
        filterType === "status" ||
        filterType === "priority" ||
        filterType === "type"
      ) {
        // Handle array filters
        const currentValues = [
          ...((updatedFilters[filterType] as string[]) || []),
        ];

        if (currentValues.includes(value)) {
          // Remove value if already selected
          const index = currentValues.indexOf(value);
          currentValues.splice(index, 1);
        } else {
          // Add value if not selected
          currentValues.push(value);
        }

        updatedFilters[filterType] = currentValues;
      } else {
        // Handle other filters
        updatedFilters[filterType] = value;
      }

      return updatedFilters;
    });

    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchTickets();
  };

  const handleClearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      type: [],
      search: "",
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleRowClick = (ticketId: number) => {
    navigate(`/tickets/${ticketId}`);
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

  // Get labels for filters
  const statusOptions = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  const typeOptions = [
    { value: "bug", label: "Bug" },
    { value: "feature", label: "Feature" },
    { value: "task", label: "Task" },
    { value: "improvement", label: "Improvement" },
  ];

  if (loading && tickets.length === 0) {
    return <LoadingSpinner fullScreen={true} />;
  }

  if (error && tickets.length === 0) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="ticket-list-container">
      <div className="ticket-list-header">
        <h1>Tickets</h1>
        <button
          className="create-ticket-button"
          onClick={() => navigate("/tickets/new")}
        >
          Create Ticket
        </button>
      </div>

      <div className="filters-container">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search tickets..."
            value={filters.search || ""}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        <div className="filter-groups">
          <div className="filter-group">
            <h3>Status</h3>
            <div className="filter-options">
              {statusOptions.map((option) => (
                <div key={option.value} className="filter-option">
                  <input
                    type="checkbox"
                    id={`status-${option.value}`}
                    checked={(filters.status || []).includes(option.value)}
                    onChange={() => handleFilterChange("status", option.value)}
                  />
                  <label htmlFor={`status-${option.value}`}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3>Priority</h3>
            <div className="filter-options">
              {priorityOptions.map((option) => (
                <div key={option.value} className="filter-option">
                  <input
                    type="checkbox"
                    id={`priority-${option.value}`}
                    checked={(filters.priority || []).includes(option.value)}
                    onChange={() =>
                      handleFilterChange("priority", option.value)
                    }
                  />
                  <label htmlFor={`priority-${option.value}`}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3>Type</h3>
            <div className="filter-options">
              {typeOptions.map((option) => (
                <div key={option.value} className="filter-option">
                  <input
                    type="checkbox"
                    id={`type-${option.value}`}
                    checked={(filters.type || []).includes(option.value)}
                    onChange={() => handleFilterChange("type", option.value)}
                  />
                  <label htmlFor={`type-${option.value}`}>{option.label}</label>
                </div>
              ))}
            </div>
          </div>

          <button className="clear-filters-button" onClick={handleClearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <LoadingSpinner />
        </div>
      )}

      <div className="tickets-table-container">
        <table className="tickets-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Type</th>
              <th>Assignee</th>
              <th>Reporter</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => handleRowClick(ticket.id)}
                  className="ticket-row"
                >
                  <td>#{ticket.id}</td>
                  <td className="ticket-title">{ticket.title}</td>
                  <td>
                    <span
                      className={`badge ${getStatusBadgeClass(ticket.status)}`}
                    >
                      {formatStatus(ticket.status)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${getPriorityBadgeClass(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority.charAt(0).toUpperCase() +
                        ticket.priority.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-type">
                      {ticket.type.charAt(0).toUpperCase() +
                        ticket.type.slice(1)}
                    </span>
                  </td>
                  <td>
                    {ticket.assignee
                      ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
                      : "Unassigned"}
                  </td>
                  <td>
                    {ticket.reporter
                      ? `${ticket.reporter.firstName} ${ticket.reporter.lastName}`
                      : "Unknown"}
                  </td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="no-tickets-message">
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {tickets.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="pagination-button"
          >
            Previous
          </button>

          <div className="pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketList;
