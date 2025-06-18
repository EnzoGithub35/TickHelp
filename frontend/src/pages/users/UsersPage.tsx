import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useAuth } from "../../contexts/AuthContext";
import { User } from "../../types";
import { toast } from "react-hot-toast";
import "../../styles/UserManagement.css";

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "user" as "user" | "manager" | "admin",
    isActive: true,
  });

  // Get users
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", currentPage, searchTerm],
    queryFn: () => userService.getUsers(currentPage, 10, searchTerm),
  });

  // Get user stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["userStats"],
    queryFn: () => userService.getUserStats(),
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: Partial<User> }) =>
      userService.updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      setUserToEdit(null);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      setUserToDelete(null);
    },
  });

  // Handle edit user
  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  };

  // Handle update user
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userToEdit) return;

    updateUserMutation.mutate({
      id: userToEdit.id,
      userData: formData,
    });
  };

  // Handle delete user
  const handleDeleteUser = () => {
    if (!userToDelete) return;

    deleteUserMutation.mutate(userToDelete.id);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (isLoading || statsLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        Error loading users: {(error as Error).message}
      </div>
    );
  }

  const users = usersData?.data?.data || [];
  const pagination = usersData?.data?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };
  const stats = statsData?.data;

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>User Management</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      {stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.activeUsers}</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.usersByRole.admin}</div>
            <div className="stat-label">Admins</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.usersByRole.manager}</div>
            <div className="stat-label">Managers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.usersByRole.user}</div>
            <div className="stat-label">Regular Users</div>
          </div>
        </div>
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: User) => (
              <tr
                key={user.id}
                className={!user.isActive ? "inactive-user" : ""}
              >
                <td className="user-name">
                  <div className="user-avatar">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    {user.firstName} {user.lastName}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      user.isActive ? "active" : "inactive"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button
                    className="btn-edit"
                    onClick={() => handleEditUser(user)}
                    disabled={user.id === currentUser?.id}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => setUserToDelete(user)}
                    disabled={
                      user.id === currentUser?.id ||
                      currentUser?.role !== "admin"
                    }
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-table">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} users)
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, pagination.totalPages)
              )
            }
            disabled={currentPage === pagination.totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit User Modal */}
      {userToEdit && (
        <div className="modal-overlay">
          <div className="user-modal">
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="close-btn" onClick={() => setUserToEdit(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={currentUser?.role !== "admin"}
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group form-checkbox">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <label htmlFor="isActive">Active</label>
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setUserToEdit(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete/Deactivate User Modal */}
      {userToDelete && (
        <div className="modal-overlay">
          <div className="user-modal">
            <div className="modal-header">
              <h2>{userToDelete.isActive ? "Deactivate" : "Activate"} User</h2>
              <button
                className="close-btn"
                onClick={() => setUserToDelete(null)}
              >
                &times;
              </button>
            </div>
            <div className="confirmation-content">
              <p>
                Are you sure you want to{" "}
                {userToDelete.isActive ? "deactivate" : "activate"}
                <strong>
                  {" "}
                  {userToDelete.firstName} {userToDelete.lastName}
                </strong>
                ?
              </p>
              <p className="warning-text">
                {userToDelete.isActive
                  ? "This user will no longer be able to log in to the system."
                  : "This user will be able to log in to the system again."}
              </p>
            </div>
            <div className="form-actions">
              <button
                className="btn-danger"
                onClick={handleDeleteUser}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending
                  ? "Processing..."
                  : userToDelete.isActive
                  ? "Deactivate User"
                  : "Activate User"}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setUserToDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
