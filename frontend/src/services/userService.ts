import apiClient from './apiClient';
import { User, ApiResponse, PaginatedResponse } from '../types';
import { toast } from 'react-hot-toast';

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: {
    admin: number;
    manager: number;
    user: number;
  };
  recentRegistrations: User[];
}

export const userService = {
  // Get all users with pagination
  getUsers: async (page = 1, limit = 10, search = '') => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(`/users?${params}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch users');
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id: number | string) => {
    try {
      const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch user details');
      throw error;
    }
  },

  // Update user
  updateUser: async (id: number | string, userData: Partial<User>) => {
    try {
      const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, userData);
      toast.success('User updated successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to update user');
      throw error;
    }
  },

  // Delete user (soft delete)
  deleteUser: async (id: number | string) => {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/users/${id}`);
      toast.success('User deleted successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to delete user');
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await apiClient.get<ApiResponse<UserStats>>('/users/stats');
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch user statistics');
      throw error;
    }
  },
};
