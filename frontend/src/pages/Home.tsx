import { useState } from 'react';

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>🎫 Tick'Help</h1>
        <p className="subtitle">Système de gestion de tickets professionnel</p>
      </header>

      <main className="home-main">
        <div className="hero-section">
          <h2>Bienvenue sur Tick'Help</h2>
          <p>
            Gérez efficacement vos tickets, bugs et demandes de fonctionnalités 
            avec notre plateforme moderne et intuitive.
          </p>
          
          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => setIsLoading(!isLoading)}
            >
              {isLoading ? 'Chargement...' : 'Commencer'}
            </button>
            <button className="btn btn-secondary">
              En savoir plus
            </button>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Gestion des tickets</h3>
            <p>Créez, assignez et suivez vos tickets en temps réel</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Collaboration d'équipe</h3>
            <p>Travaillez ensemble avec des commentaires et notifications</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Tableau de bord</h3>
            <p>Visualisez vos métriques et performances en un coup d'œil</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Sécurisé</h3>
            <p>Contrôle d'accès par rôles et authentification sécurisée</p>
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-item">
            <div className="stat-number">1,247</div>
            <div className="stat-label">Tickets résolus</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">95%</div>
            <div className="stat-label">Satisfaction client</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24h</div>
            <div className="stat-label">Temps de réponse moyen</div>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>&copy; 2025 Tick'Help - Projet DEVE427 EPSI</p>
      </footer>
    </div>
  );
};

export default Home;