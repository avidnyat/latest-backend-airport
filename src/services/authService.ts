
// Authentication service using PostgreSQL backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  created_at?: string;
}

export interface Session {
  access_token: string;
  expires_at: string;
}

export interface AuthResponse {
  user: User;
  session: Session;
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return data;
};

// Helper function to make authenticated API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`API Call: ${options.method || 'GET'} ${url}`);
  
  const token = localStorage.getItem('auth_token');
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  return handleResponse(response);
};

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  console.log('Signing in user:', email);
  
  const response = await apiCall('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Store token in localStorage
  if (response.session?.access_token) {
    localStorage.setItem('auth_token', response.session.access_token);
    localStorage.setItem('auth_expires_at', response.session.expires_at);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    console.log('Session stored successfully');
  }

  return response;
};

export const signUp = async (
  email: string, 
  password: string, 
  fullName: string, 
  role: string = 'staff'
): Promise<AuthResponse> => {
  console.log('Signing up user:', email, 'with role:', role);
  
  const response = await apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, fullName, role }),
  });

  // Store token in localStorage
  if (response.session?.access_token) {
    localStorage.setItem('auth_token', response.session.access_token);
    localStorage.setItem('auth_expires_at', response.session.expires_at);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    console.log('Session stored successfully');
  }

  return response;
};

export const signOut = async (): Promise<void> => {
  console.log('Signing out user');
  
  try {
    await apiCall('/auth/signout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error during signout:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_expires_at');
    localStorage.removeItem('auth_user');
    console.log('Local session cleared');
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiCall('/auth/user');
    console.log('Current user fetched:', response.user);
    return response.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    // Clear invalid session
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_expires_at');
    localStorage.removeItem('auth_user');
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  console.log('Fetching all users');
  const response = await apiCall('/auth/users');
  return response;
};

export const updateUser = async (id: string, userData: { fullName: string; role: string }): Promise<User> => {
  console.log('Updating user:', id);
  return apiCall(`/auth/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (id: string): Promise<void> => {
  console.log('Deleting user:', id);
  await apiCall(`/auth/users/${id}`, {
    method: 'DELETE',
  });
};

// Session management helpers
export const getStoredSession = (): { user: User; session: Session } | null => {
  try {
    const token = localStorage.getItem('auth_token');
    const expiresAt = localStorage.getItem('auth_expires_at');
    const userStr = localStorage.getItem('auth_user');

    if (!token || !expiresAt || !userStr) {
      console.log('Missing session data in localStorage');
      return null;
    }

    // Check if session has expired
    if (new Date() >= new Date(expiresAt)) {
      console.log('Session has expired');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_expires_at');
      localStorage.removeItem('auth_user');
      return null;
    }

    const user = JSON.parse(userStr);
    console.log('Valid stored session found for user:', user.email);
    return {
      user,
      session: { access_token: token, expires_at: expiresAt }
    };
  } catch (error) {
    console.error('Error getting stored session:', error);
    return null;
  }
};

export const isSessionValid = (): boolean => {
  const session = getStoredSession();
  return session !== null;
};
