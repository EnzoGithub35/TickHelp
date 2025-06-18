import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { RegisterData } from "../../types";
import { LoadingSpinner } from "../ui/LoadingSpinner";

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "confirmPassword") {
      setConfirmPassword(value);

      // Validate password match
      if (value !== formData.password) {
        setFormErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear errors for the field being typed in
      if (formErrors[name]) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    const result = await register(formData);

    if (result.success) {
      toast.success("Registration successful!");
      navigate("/dashboard", { replace: true });
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  return (
    <div className="register-form-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Create your Tick'Help Account</h2>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Enter your first name"
              className={`form-control ${
                formErrors.firstName ? "is-invalid" : ""
              }`}
            />
            {formErrors.firstName && (
              <div className="invalid-feedback">{formErrors.firstName}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Enter your last name"
              className={`form-control ${
                formErrors.lastName ? "is-invalid" : ""
              }`}
            />
            {formErrors.lastName && (
              <div className="invalid-feedback">{formErrors.lastName}</div>
            )}
          </div>
        </div>

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
            className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
          />
          {formErrors.email && (
            <div className="invalid-feedback">{formErrors.email}</div>
          )}
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
            className={`form-control ${
              formErrors.password ? "is-invalid" : ""
            }`}
          />
          {formErrors.password && (
            <div className="invalid-feedback">{formErrors.password}</div>
          )}
          <small className="form-text text-muted">
            Must be at least 8 characters long
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm your password"
            className={`form-control ${
              formErrors.confirmPassword ? "is-invalid" : ""
            }`}
          />
          {formErrors.confirmPassword && (
            <div className="invalid-feedback">{formErrors.confirmPassword}</div>
          )}
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? <LoadingSpinner size="small" /> : "Register"}
        </button>

        <p className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;
