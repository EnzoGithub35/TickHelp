import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/common/Layout";
import TicketList from "./pages/tickets/TicketList";
import CreateTicket from "./pages/tickets/CreateTicket";
import EditTicket from "./pages/tickets/EditTicket";
import TicketDetail from "./pages/tickets/TicketDetail";
import "./App.css";
import "./styles/layout.css";

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
      <AuthProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Home />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TicketList />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets/create"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CreateTicket />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets/:id/edit"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <EditTicket />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TicketDetail />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
