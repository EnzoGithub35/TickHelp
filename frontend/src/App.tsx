import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/common/Layout";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

// Ticket Pages
import TicketListPage from "./pages/tickets/TicketListPage";
import NewTicketPage from "./pages/tickets/NewTicketPage";
import EditTicketPage from "./pages/tickets/EditTicketPage";
import TicketDetailPage from "./pages/tickets/TicketDetailPage";

// User Pages
import ProfilePage from "./pages/profile/ProfilePage";
import UsersPage from "./pages/users/UsersPage";



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Tickets routes */}
            <Route
              path="/tickets"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TicketListPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tickets/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NewTicketPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tickets/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TicketDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tickets/edit/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EditTicketPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRoles={["admin", "manager"]}>
                  <Layout>
                    <UsersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Profile route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Redirect root to dashboard or login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 catch-all */}
            <Route
              path="*"
              element={
                <div className="not-found">
                  <h1>404</h1>
                  <p>Page not found</p>
                  <a href="/dashboard">Go to Dashboard</a>
                </div>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
