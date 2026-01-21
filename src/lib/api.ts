import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Don't redirect on 401 for endpoints that support optional auth (public endpoints)
          const publicEndpoints = ['/locations', '/businesses', '/forum'];
          const isPublicEndpoint = publicEndpoints.some(endpoint => 
            error.config?.url?.includes(endpoint)
          );
          
          if (!isPublicEndpoint) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(data: any) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(data: any) {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async updateMe(data: any) {
    const response = await this.client.put('/auth/me', data);
    return response.data;
  }

  // Locations
  async getLocations(params?: any) {
    const response = await this.client.get('/locations', { params });
    return response.data;
  }

  async getLocation(id: number) {
    const response = await this.client.get(`/locations/${id}`);
    return response.data;
  }

  async getNearbyLocations(latitude: number, longitude: number, radius: number = 50) {
    const response = await this.client.get('/locations/nearby', {
      params: { latitude, longitude, radius },
    });
    return response.data;
  }

  async createLocation(data: any) {
    const response = await this.client.post('/locations', data);
    return response.data;
  }

  async updateLocation(id: number, data: any) {
    const response = await this.client.put(`/locations/${id}`, data);
    return response.data;
  }

  async voteLocation(id: number, voteType: 'upvote' | 'downvote') {
    const response = await this.client.post(`/locations/${id}/vote`, { vote_type: voteType });
    return response.data;
  }

  // File upload
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Generic HTTP methods for flexibility
  async get(url: string, config?: any) {
    const response = await this.client.get(url, config);
    return response;
  }

  async post(url: string, data?: any, config?: any) {
    const response = await this.client.post(url, data, config);
    return response;
  }

  async put(url: string, data?: any, config?: any) {
    const response = await this.client.put(url, data, config);
    return response;
  }

  async delete(url: string, config?: any) {
    const response = await this.client.delete(url, config);
    return response;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
