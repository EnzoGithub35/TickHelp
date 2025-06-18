import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import apiClient from "../services/apiClient.ts";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "manager" | "user";
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; payload: User };

const AuthContext = createContext<any>(null);

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("authToken"),
  isAuthenticated: false,
  loading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      loadUser();
    }
    // eslint-disable-next-line
  }, []);

  const loadUser = async () => {
    try {
      const response = await apiClient.get("/auth/profile");
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.data.user,
          token: localStorage.getItem("authToken") || "",
        },
      });
    } catch (error) {
      dispatch({ type: "LOGOUT" });
      localStorage.removeItem("authToken");
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await apiClient.post("/auth/login", credentials);
      const { token, user } = response.data;
      localStorage.setItem("authToken", token);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      });
      return { success: true };
    } catch (error: any) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.response?.data?.message || "Login failed",
      });
      return { success: false, error: error.response?.data?.message };
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await apiClient.post("/auth/register", userData);
      const { token, user } = response.data;
      localStorage.setItem("authToken", token);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      });
      return { success: true };
    } catch (error: any) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.response?.data?.message || "Registration failed",
      });
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    dispatch({ type: "LOGOUT" });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
