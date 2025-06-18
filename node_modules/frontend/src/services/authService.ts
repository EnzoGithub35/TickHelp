import apiClient from './apiClient';
import { User, LoginCredentials, RegisterData, ApiResponse } from '../types';

/**
 * Service d'authentification simplifié pour le mode développement
 * Ce service ne stocke pas de JWT et renvoie toujours un utilisateur par défaut
 */
const authService = {
  /**
   * Enregistrement d'un nouvel utilisateur
   * @param userData Données d'enregistrement
   */
  register: async (userData: RegisterData): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  },

  /**
   * Connexion d'un utilisateur
   * @param credentials Identifiants de connexion
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  /**
   * Met à jour le profil de l'utilisateur
   * @param userData Données à mettre à jour
   */
  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Déconnexion d'un utilisateur
   */
  logout: () => {
    console.log('Déconnexion simulée (mode DEV)');
    // Ne supprime pas les tokens car ils ne sont pas stockés
  },

  /**
   * Vérifie si un utilisateur est authentifié
   * En mode développement, toujours retourner true
   */
  isAuthenticated: () => true,

  /**
   * Renvoie un profil utilisateur par défaut pour le mode développement
   */
  getDefaultProfile: (): User => ({
    id: 1,
    email: 'dev@example.com',
    firstName: 'Dev',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
};

export default authService;