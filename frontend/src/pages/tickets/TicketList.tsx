import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ticketService } from "../../services/ticketService";
import { Ticket } from "../../types";
import "../../styles/tickets.css";

const TicketList = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line
  }, [page, limit, status, priority, search]);

  const fetchTickets = async () => {
    setLoading(true);
    const filters: any = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    let data;
    if (search) {
      data = await ticketService.searchTickets(search);
      setTickets(data);
      setTotalPages(1);
    } else {
      data = await ticketService.getTickets(filters, {
        page,
        limit,
        sortBy: "created_at",
        sortOrder: "desc",
      });
      setTickets(data.tickets || []);
      setTotalPages(data.pagination?.totalPages || 1);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  return (
    <div className="ticket-list-container">
      <div className="ticket-list-header">
        <h1>Tickets</h1>
        <button onClick={() => navigate("/tickets/create")}>
          Créer un ticket
        </button>
      </div>
      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: 12, marginBottom: 20 }}
      >
        <input
          type="text"
          placeholder="Recherche par titre ou description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "0.5rem 1rem",
            borderRadius: 6,
            border: "1px solid #c9c9c9",
          }}
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tous statuts</option>
          <option value="todo">À faire</option>
          <option value="in_progress">En cours</option>
          <option value="resolved">Résolu</option>
          <option value="closed">Fermé</option>
        </select>
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Toutes priorités</option>
          <option value="low">Faible</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
          <option value="urgent">Urgente</option>
        </select>
        <button type="submit">Rechercher</button>
      </form>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <table className="ticket-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Statut</th>
                <th>Priorité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.id}</td>
                  <td>{ticket.title}</td>
                  <td>{ticket.status}</td>
                  <td>{ticket.priority}</td>
                  <td>
                    <div className="ticket-actions">
                      <button onClick={() => navigate(`/tickets/${ticket.id}`)}>
                        Voir
                      </button>
                      <button
                        onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
                      >
                        Éditer
                      </button>
                      <button
                        onClick={async () => {
                          await ticketService.deleteTicket(ticket.id);
                          fetchTickets();
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <div>
              <label>Par page : </label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div>
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                &lt; Précédent
              </button>
              <span style={{ margin: "0 1rem" }}>
                Page {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Suivant &gt;
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TicketList;
