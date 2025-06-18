import { useState, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { LoginCredentials } from "../../types";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState;
  const from = state?.from?.pathname || "/dashboard";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = await login(formData);

    if (result.success) {
      toast.success("Login successful!");
      navigate(from, { replace: true });
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  return (
    <div className="login-form-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login to Tick'Help</h2>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            className="form-control"
          />
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? <LoadingSpinner size="small" /> : "Login"}
        </button>

        <p className="register-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
