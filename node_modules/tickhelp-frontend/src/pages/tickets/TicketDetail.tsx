import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ticketService } from "../../services/ticketService";
import { Ticket } from "../../types";
import "../../styles/ticketForm.css";

const TicketDetail = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTicket();
    // eslint-disable-next-line
  }, [id]);

  const fetchTicket = async () => {
    setLoading(true);
    const data = await ticketService.getTicketById(id!);
    setTicket(data);
    setLoading(false);
  };

  if (loading || !ticket) return <p>Chargement...</p>;

  return (
    <div className="ticket-detail-container">
      <h2>Détail du ticket</h2>
      <ul className="ticket-detail-list">
        <li>
          <span className="ticket-detail-label">ID :</span> {ticket.id}
        </li>
        <li>
          <span className="ticket-detail-label">Titre :</span> {ticket.title}
        </li>
        <li>
          <span className="ticket-detail-label">Description :</span>{" "}
          {ticket.description}
        </li>
        <li>
          <span className="ticket-detail-label">Statut :</span> {ticket.status}
        </li>
        <li>
          <span className="ticket-detail-label">Priorité :</span>{" "}
          {ticket.priority}
        </li>
      </ul>
      <div className="ticket-form-actions">
        <button onClick={() => navigate(`/tickets/${ticket.id}/edit`)}>
          Éditer
        </button>
        <button onClick={() => navigate("/tickets")}>Retour à la liste</button>
      </div>
    </div>
  );
};

export default TicketDetail;
