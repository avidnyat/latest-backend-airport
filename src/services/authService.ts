// Mock Authentication service for frontend-only implementation
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

// Mock users database (in a real app, this would be in your backend)
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@fcb.com',
    full_name: 'Admin User',
    role: 'admin',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    email: 'staff@fcb.com',
    full_name: 'Staff User',
    role: 'staff',
    created_at: new Date().toISOString()
  }
];

// Mock passwords (in a real app, these would be hashed and stored securely)
const mockPasswords: Record<string, string> = {
  'admin@fcb.com': 'admin123',
  'staff@fcb.com': 'staff123'
};

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate mock token
const generateMockToken = () => {
  return 'mock_token_' + Math.random().toString(36).substr(2, 9);
};

// Helper function to generate session expiry (24 hours from now)
const generateSessionExpiry = () => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry.toISOString();
};

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  console.log('Signing in user:', email);
  
  // Simulate API delay
  await delay(500);
  
  // Check if user exists and password is correct
  const user = mockUsers.find(u => u.email === email);
  if (!user || mockPasswords[email] !== password) {
    throw new Error('Invalid email or password');
  }

  const session: Session = {
    access_token: generateMockToken(),
    expires_at: generateSessionExpiry()
  };

  // Store token in localStorage
  localStorage.setItem('auth_token', session.access_token);
  localStorage.setItem('auth_expires_at', session.expires_at);
  localStorage.setItem('auth_user', JSON.stringify(user));
  console.log('Session stored successfully');

  return { user, session };
};

export const signUp = async (
  email: string, 
  password: string, 
  fullName: string, 
  role: string = 'staff'
): Promise<AuthResponse> => {
  console.log('Signing up user:', email, 'with role:', role);
  
  // Simulate API delay
  await delay(500);
  
  // Check if user already exists
  if (mockUsers.find(u => u.email === email)) {
    throw new Error('User already exists');
  }

  // Create new user
  const newUser: User = {
    id: (mockUsers.length + 1).toString(),
    email,
    full_name: fullName,
    role,
    created_at: new Date().toISOString()
  };

  // Add to mock database
  mockUsers.push(newUser);
  mockPasswords[email] = password;

  const session: Session = {
    access_token: generateMockToken(),
    expires_at: generateSessionExpiry()
  };

  // Store token in localStorage
  localStorage.setItem('auth_token', session.access_token);
  localStorage.setItem('auth_expires_at', session.expires_at);
  localStorage.setItem('auth_user', JSON.stringify(newUser));
  console.log('Session stored successfully');

  return { user: newUser, session };
};

export const signOut = async (): Promise<void> => {
  console.log('Signing out user');
  
  // Simulate API delay
  await delay(200);
  
  // Clear local storage
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_expires_at');
  localStorage.removeItem('auth_user');
  console.log('Local session cleared');
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Simulate API delay
    await delay(200);
    
    const userStr = localStorage.getItem('auth_user');
    const token = localStorage.getItem('auth_token');
    const expiresAt = localStorage.getItem('auth_expires_at');

    if (!userStr || !token || !expiresAt) {
      return null;
    }

    // Check if session has expired
    if (new Date() >= new Date(expiresAt)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_expires_at');
      localStorage.removeItem('auth_user');
      return null;
    }

    const user = JSON.parse(userStr);
    console.log('Current user fetched:', user);
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_expires_at');
    localStorage.removeItem('auth_user');
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  console.log('Fetching all users');
  
  // Simulate API delay
  await delay(300);
  
  // Return copy of mock users (excluding current session user to avoid confusion)
  return [...mockUsers];
};

export const updateUser = async (id: string, userData: { fullName: string; role: string }): Promise<User> => {
  console.log('Updating user:', id);
  
  // Simulate API delay
  await delay(400);
  
  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Update user
  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    full_name: userData.fullName,
    role: userData.role
  };

  // Update stored user if it's the current user
  const storedUser = localStorage.getItem('auth_user');
  if (storedUser) {
    const currentUser = JSON.parse(storedUser);
    if (currentUser.id === id) {
      localStorage.setItem('auth_user', JSON.stringify(mockUsers[userIndex]));
    }
  }

  return mockUsers[userIndex];
};

export const deleteUser = async (id: string): Promise<void> => {
  console.log('Deleting user:', id);
  
  // Simulate API delay
  await delay(400);
  
  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const userEmail = mockUsers[userIndex].email;
  
  // Remove user from mock database
  mockUsers.splice(userIndex, 1);
  delete mockPasswords[userEmail];
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