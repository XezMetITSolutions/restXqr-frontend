/**
 * API Service Layer
 * Replaces localStorage with backend API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      // Subdomain bilgisini header'a ekle (güvenlik için)
      const subdomain = typeof window !== 'undefined' 
        ? window.location.hostname.split('.')[0]
        : null;
      
      // Subdomain'i her zaman gönder (test için)
      const headers = {
        'Content-Type': 'application/json',
        'X-Subdomain': subdomain || 'hazal', // Fallback olarak hazal kullan
        ...options.headers,
      };
      
      console.log('🌐 API Request:', { 
        url, 
        subdomain, 
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
        headers 
      });
      
      const response = await fetch(url, {
        headers,
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Restaurant endpoints
  async getRestaurants() {
    return this.request<any[]>('/restaurants');
  }

  async getRestaurantByUsername(username: string) {
    return this.request<any>(`/restaurants/username/${username}`);
  }

  async getRestaurantById(id: string) {
    return this.request<any>(`/restaurants/${id}`);
  }

  async createRestaurant(data: any) {
    return this.request<any>('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRestaurant(id: string, data: any) {
    return this.request<any>(`/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateRestaurantFeatures(id: string, features: string[]) {
    return this.request<any>(`/restaurants/${id}/features`, {
      method: 'PUT',
      body: JSON.stringify({ features }),
    });
  }

  // Menu endpoints
  async getRestaurantMenu(restaurantId: string) {
    return this.request<any>(`/restaurants/${restaurantId}/menu`);
  }

  async createMenuCategory(restaurantId: string, data: any) {
    return this.request<any>(`/restaurants/${restaurantId}/menu/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMenuCategory(restaurantId: string, categoryId: string, data: any) {
    return this.request<any>(`/restaurants/${restaurantId}/menu/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMenuCategory(restaurantId: string, categoryId: string) {
    return this.request<any>(`/restaurants/${restaurantId}/menu/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  async createMenuItem(restaurantId: string, data: any) {
    console.log('API - createMenuItem çağrıldı:', { restaurantId, data });
    console.log('API - Gönderilen resim URL uzunluğu:', data.imageUrl?.length || 0);
    return this.request<any>(`/restaurants/${restaurantId}/menu/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMenuItem(restaurantId: string, itemId: string, data: any) {
    console.log('API - updateMenuItem çağrıldı:', { restaurantId, itemId, data });
    console.log('API - Gönderilen resim URL uzunluğu:', data.imageUrl?.length || 0);
    return this.request<any>(`/restaurants/${restaurantId}/menu/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMenuItem(restaurantId: string, itemId: string) {
    return this.request<any>(`/restaurants/${restaurantId}/menu/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Order endpoints
  async getRestaurantOrders(restaurantId: string) {
    return this.request<any[]>(`/restaurants/${restaurantId}/orders`);
  }

  async createOrder(restaurantId: string, data: any) {
    return this.request<any>(`/restaurants/${restaurantId}/orders`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request<any>(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getOrderById(orderId: string) {
    return this.request<any>(`/orders/${orderId}`);
  }

  // Authentication endpoints
  async login(credentials: { username: string; password: string }) {
    console.log('🔐 Login attempt:', { 
      username: credentials.username, 
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      subdomain: typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : 'server'
    });
    
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request<any>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  async refreshToken() {
    return this.request<any>('/auth/refresh', {
      method: 'POST',
    });
  }

  // QR Token Management
  async generateQRToken(data: { restaurantId: string; tableNumber: number; duration?: number }) {
    return this.request<any>(`/qr/generate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyQRToken(token: string) {
    return this.request<any>(`/qr/verify/${token}`);
  }

  async refreshQRToken(token: string, duration: number = 2) {
    return this.request<any>(`/qr/refresh/${token}`, {
      method: 'POST',
      body: JSON.stringify({ duration }),
    });
  }

  async getRestaurantQRTokens(restaurantId: string) {
    return this.request<any>(`/qr/restaurant/${restaurantId}/tables`);
  }

  async deactivateQRToken(token: string) {
    return this.request<any>(`/qr/deactivate/${token}`, {
      method: 'DELETE',
    });
  }

  async cleanupExpiredTokens() {
    return this.request<any>(`/qr/cleanup`, {
      method: 'POST',
    });
  }

  // Staff endpoints
  async getStaff(restaurantId: string) {
    return this.request<any>(`/staff/restaurant/${restaurantId}`);
  }

  async createStaff(restaurantId: string, staffData: any) {
    return this.request<any>(`/staff/restaurant/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  }

  async updateStaff(id: string, staffData: any) {
    return this.request<any>(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
  }

  async deleteStaff(id: string) {
    return this.request<any>(`/staff/${id}`, {
      method: 'DELETE',
    });
  }

  async staffLogin(username: string, password: string, subdomain: string) {
    return this.request<any>('/staff/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, subdomain }),
    });
  }

  // Admin endpoints
  async getAllRestaurantUsers() {
    return this.request<any>(`/restaurants/users/all`);
  }

  async getRestaurantUsers(restaurantId: string) {
    return this.request<any>(`/restaurants/${restaurantId}/users`);
  }

  async changeRestaurantPassword(restaurantId: string, currentPassword: string, newPassword: string) {
    return this.request<any>(`/restaurants/${restaurantId}/change-password`, {
      method: 'POST',
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });
  }

  // Staff endpoints
  async getStaff(restaurantId: string) {
    return this.request<any>(`/staff/restaurant/${restaurantId}`);
  }

  // Order endpoints
  async getOrders(restaurantId: string, status?: string) {
    const params = new URLSearchParams({ restaurantId });
    if (status) params.append('status', status);
    return this.request<any>(`/orders?${params.toString()}`);
  }

  async createOrder(orderData: {
    restaurantId: string;
    tableNumber?: number;
    customerName?: string;
    items: Array<{
      menuItemId?: string;
      id?: string;
      name?: string;
      quantity: number;
      unitPrice?: number;
      price?: number;
      notes?: string;
    }>;
    notes?: string;
    orderType?: string;
  }) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request<any>(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

}

export const apiService = new ApiService();
export default apiService;
