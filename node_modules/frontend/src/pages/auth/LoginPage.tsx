import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoginForm from "../../components/forms/LoginForm";
import "../../styles/AuthPages.css"; // Adjust the path as necessary

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-page login-page">
      <div className="auth-container">
        <div className="auth-logo">
          <h1>Tick'Help</h1>
          <p className="tagline">Your Complete Ticket Management System</p>
        </div>
        <div className="auth-form-container">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
