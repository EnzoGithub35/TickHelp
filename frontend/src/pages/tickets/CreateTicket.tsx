import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ticketService } from "../../services/ticketService";
import { Ticket } from "../../types";
import "../../styles/ticketForm.css";

const CreateTicket = () => {
  const [form, setForm] = useState<Partial<Ticket>>({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await ticketService.createTicket(form);
    setLoading(false);
    navigate("/tickets");
  };

  return (
    <div className="ticket-form-container">
      <h2>Créer un ticket</h2>
      <form className="ticket-form" onSubmit={handleSubmit}>
        <div>
          <label>Titre</label>
          <input
            name="title"
            value={form.title || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Priorité</label>
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
        <div>
          <label>Statut</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolu</option>
            <option value="closed">Fermé</option>
          </select>
        </div>
        <div className="ticket-form-actions">
          <button type="button" onClick={() => navigate("/tickets")}>
            Retour
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Création..." : "Créer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicket;
