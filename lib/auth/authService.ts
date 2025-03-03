// Simple client-side authentication service

export interface BusinessUser {
    id: string;
    name: string;
    email: string;
    businessId: string;
    businessName: string;
    role: 'admin' | 'staff';
    isVerified: boolean;
  }
  
  // Login with email/password
  export const login = async (email: string, password: string): Promise<BusinessUser> => {
    try {
      // Fetch users that match this email (json-server filtering)
      const response = await fetch(`http://localhost:3001/users?email=${email}`);
      const users = await response.json();
      
      if (users.length === 0) {
        throw new Error('User not found');
      }
      
      const user = users[0];
      
      // Simple password check (in a real app, never do this - use hashed passwords and proper auth)
      if (user.password !== password) {
        throw new Error('Invalid credentials');
      }
      
      // Remove password before returning user
      const { password: _, ...userWithoutPassword } = user;
      
      // Store user in localStorage for session persistence
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return userWithoutPassword;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Register new user
  export const register = async (userData: {
    name: string;
    email: string;
    password: string;
    businessName: string;
  }): Promise<BusinessUser> => {
    try {
      // Check if email already exists
      const checkResponse = await fetch(`http://localhost:3001/users?email=${userData.email}`);
      const existingUsers = await checkResponse.json();
      
      if (existingUsers.length > 0) {
        throw new Error('Email already in use');
      }
      
      // Create a new business ID
      const businessId = Date.now().toString();
      
      // Create new business
      const businessResponse = await fetch('http://localhost:3001/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: businessId,
          name: userData.businessName,
          email: userData.email,
          ownerId: null // We'll update this after creating the user
        })
      });
      
      if (!businessResponse.ok) {
        throw new Error('Failed to create business');
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        password: userData.password, // In a real app, hash this!
        businessId,
        businessName: userData.businessName,
        role: 'admin',
        isVerified: true
      };
      
      const userResponse = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to create user');
      }
      
      const createdUser = await userResponse.json();
      
      // Update business with owner ID
      await fetch(`http://localhost:3001/businesses/${businessId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ownerId: createdUser.id
        })
      });
      
      // Remove password before returning
      const { password: _, ...userWithoutPassword } = createdUser;
      
      // Store user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return userWithoutPassword;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
  
  // Get current user
  export const getCurrentUser = (): BusinessUser | null => {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };
  
  // Logout
  export const logout = () => {
    localStorage.removeItem('currentUser');
  };