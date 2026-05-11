const API_URL = 'http://localhost:3001/api';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('jakd_token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      localStorage.removeItem('jakd_token');
      localStorage.removeItem('jakd_user');
      window.location.href = '/login';
      return;
    }

    const result = await response.json().catch(() => null);
    
    // Tu backend envuelve todo en { success, data } o { success, error }
    if (!response.ok || result?.success === false) {
      throw new Error(result?.error || result?.data?.error || `Error ${response.status}`);
    }

    // Devolvemos directamente el contenido de "data"
    return result?.data ?? result;
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  },

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  },

  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};

export const auth = {
  login: (token, user) => {
    localStorage.setItem('jakd_token', token);
    localStorage.setItem('jakd_user', JSON.stringify(user));
  },
  
  logout: () => {
    localStorage.removeItem('jakd_token');
    localStorage.removeItem('jakd_user');
  },
  
  getToken: () => localStorage.getItem('jakd_token'),
  
  getUser: () => {
    const user = localStorage.getItem('jakd_user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => !!localStorage.getItem('jakd_token'),
};