import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import RegisterForm from "../../components/forms/RegisterForm";
import "../../styles/AuthPages.css";

const RegisterPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-page register-page">
      <div className="auth-container">
        <div className="auth-logo">
          <h1>Tick'Help</h1>
          <p className="tagline">Your Complete Ticket Management System</p>
        </div>
        <div className="auth-form-container">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
