import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ticketService, TicketStatsData } from "../../services/ticketService";
import "../../styles/Dashboard.css"; // Assurez-vous que ce fichier existe

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Initialisation avec des valeurs par défaut pour éviter les erreurs
  const defaultStats: TicketStatsData = {
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    urgentTickets: 0,
    byStatus: {
      todo: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    },
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    },
    byType: {
      bug: 0,
      feature: 0,
      task: 0,
      improvement: 0,
    },
  };

  const [stats, setStats] = useState<TicketStatsData>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log("Fetching dashboard data...");

        const response = await ticketService.getTicketStats();
        console.log("Dashboard data received:", response);

        if (response && response.success && response.data) {
          console.log("Setting stats:", response.data);
          // Fusionner avec les valeurs par défaut pour éviter les valeurs nulles
          setStats({
            ...defaultStats,
            ...response.data,
          });
        } else {
          console.error("Invalid response format:", response);
          throw new Error("Failed to load stats");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Erreur lors du chargement des données du tableau de bord");
        // En cas d'erreur, utiliser les données par défaut
        setStats(defaultStats);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Le reste du composant Dashboard avec les éléments d'interface...
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Tableau de bord</h1>
        <div className="welcome-message">
          <h2>Bienvenue, {user?.firstName || "Utilisateur"}!</h2>
          <p>Voici une vue d'ensemble de votre système de tickets</p>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total des tickets</h3>
          <div className="stat-value">{stats.totalTickets}</div>
        </div>
        <div className="stat-card">
          <h3>Tickets ouverts</h3>
          <div className="stat-value">{stats.openTickets}</div>
        </div>
        <div className="stat-card">
          <h3>Tickets fermés</h3>
          <div className="stat-value">{stats.closedTickets}</div>
        </div>
        <div className="stat-card">
          <h3>Tickets urgents</h3>
          <div className="stat-value">{stats.urgentTickets}</div>
        </div>
      </div>

      <div
        className="dashboard-row"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <div className="dashboard-column" style={{ flex: "1 1 300px" }}>
          <div
            className="dashboard-card"
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3>Répartition par statut</h3>
            <div
              className="status-bars"
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div
                className="status-bar-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span className="status-label">À faire</span>
                <div
                  className="status-bar-container"
                  style={{ flex: 1, marginLeft: "10px", marginRight: "10px" }}
                >
                  <div
                    className="status-bar todo-bar"
                    style={{
                      width: `${
                        (stats.byStatus.todo / stats.totalTickets) * 100
                      }%`,
                      backgroundColor: "#3b82f6",
                      height: "8px",
                      borderRadius: "4px",
                    }}
                  ></div>
                </div>
                <span className="status-count">{stats.byStatus.todo}</span>
              </div>
              <div
                className="status-bar-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span className="status-label">En cours</span>
                <div
                  className="status-bar-container"
                  style={{ flex: 1, marginLeft: "10px", marginRight: "10px" }}
                >
                  <div
                    className="status-bar progress-bar"
                    style={{
                      width: `${
                        (stats.byStatus.in_progress / stats.totalTickets) * 100
                      }%`,
                      backgroundColor: "#f59e0b",
                      height: "8px",
                      borderRadius: "4px",
                    }}
                  ></div>
                </div>
                <span className="status-count">
                  {stats.byStatus.in_progress}
                </span>
              </div>
              <div
                className="status-bar-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span className="status-label">Résolu</span>
                <div
                  className="status-bar-container"
                  style={{ flex: 1, marginLeft: "10px", marginRight: "10px" }}
                >
                  <div
                    className="status-bar resolved-bar"
                    style={{
                      width: `${
                        (stats.byStatus.resolved / stats.totalTickets) * 100
                      }%`,
                      backgroundColor: "#22c55e",
                      height: "8px",
                      borderRadius: "4px",
                    }}
                  ></div>
                </div>
                <span className="status-count">{stats.byStatus.resolved}</span>
              </div>
              <div
                className="status-bar-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span className="status-label">Fermé</span>
                <div
                  className="status-bar-container"
                  style={{ flex: 1, marginLeft: "10px", marginRight: "10px" }}
                >
                  <div
                    className="status-bar closed-bar"
                    style={{
                      width: `${
                        (stats.byStatus.closed / stats.totalTickets) * 100
                      }%`,
                      backgroundColor: "#6b7280",
                      height: "8px",
                      borderRadius: "4px",
                    }}
                  ></div>
                </div>
                <span className="status-count">{stats.byStatus.closed}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-column" style={{ flex: "1 1 300px" }}>
          <div
            className="dashboard-card"
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3>Distribution par priorité</h3>
            <div
              className="priority-distribution"
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div
                className="priority-item"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  className="priority-color urgent"
                  style={{
                    backgroundColor: "#dc2626",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    marginRight: "8px",
                  }}
                ></div>
                <span className="priority-label">Urgent</span>
                <span className="priority-count" style={{ marginLeft: "auto" }}>
                  {stats.byPriority.urgent}
                </span>
              </div>
              <div
                className="priority-item"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  className="priority-color high"
                  style={{
                    backgroundColor: "#ef4444",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    marginRight: "8px",
                  }}
                ></div>
                <span className="priority-label">Élevé</span>
                <span className="priority-count" style={{ marginLeft: "auto" }}>
                  {stats.byPriority.high}
                </span>
              </div>
              <div
                className="priority-item"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  className="priority-color medium"
                  style={{
                    backgroundColor: "#f59e0b",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    marginRight: "8px",
                  }}
                ></div>
                <span className="priority-label">Moyen</span>
                <span className="priority-count" style={{ marginLeft: "auto" }}>
                  {stats.byPriority.medium}
                </span>
              </div>
              <div
                className="priority-item"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  className="priority-color low"
                  style={{
                    backgroundColor: "#4ade80",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    marginRight: "8px",
                  }}
                ></div>
                <span className="priority-label">Faible</span>
                <span className="priority-count" style={{ marginLeft: "auto" }}>
                  {stats.byPriority.low}
                </span>
              </div>
            </div>
          </div>

          <div
            className="dashboard-card"
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3>Distribution par type</h3>
            <div
              className="type-distribution"
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div
                className="type-item"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  className="type-color bug"
                  style={{
                    backgroundColor: "#ef4444",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    marginRight: "8px",
                  }}
                ></div>
                <span className="type-label">Bug</span>
                <span className="type-count" style={{ marginLeft: "auto" }}>
                  {stats.byType.bug}
                </span>
              </div>
              <div
                className="type-item"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  className="type-color feature"
                  style={{
                    backgroundColor: "#3b82f6",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    marginRight: "8px",
                  }}
                ></div>
                <span className="type-label">Fonctionnalité</span>
                <span className="type-count" style={{ marginLeft: "auto" }}>
                  {stats.byType.feature}
                </span>
              </div>
              <div
                className="type-item"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  className="type-color task"
                  style={{
                    backgroundColor: "#f59e0b",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    marginRight: "8px",
                  }}
                ></div>
                <span className="type-label">Tâche</span>
                <span className="type-count" style={{ marginLeft: "auto" }}>
                  {stats.byType.task}
                </span>
              </div>
              <div
                className="type-item"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  className="type-color improvement"
                  style={{
                    backgroundColor: "#34d399",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    marginRight: "8px",
                  }}
                ></div>
                <span className="type-label">Amélioration</span>
                <span className="type-count" style={{ marginLeft: "auto" }}>
                  {stats.byType.improvement}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="dashboard-row"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <div
          className="quick-actions"
          style={{
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <button
            className="action-button"
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            onClick={() => navigate("/tickets/create")}
          >
            <i className="fas fa-plus"></i>
            <span>Créer un ticket</span>
          </button>
          <button
            className="action-button"
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            onClick={() => navigate("/tickets")}
          >
            <i className="fas fa-ticket-alt"></i>
            <span>Voir tous les tickets</span>
          </button>
          {(user?.role === "admin" || user?.role === "manager") && (
            <button
              className="action-button"
              style={{
                background: "#3b82f6",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              onClick={() => navigate("/users")}
            >
              <i className="fas fa-users"></i>
              <span>Gérer les utilisateurs</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
