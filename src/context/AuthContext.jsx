import { createContext, useContext, useEffect, useState } from 'react';
import { account } from '../lib/appwrite';
import { ID } from 'appwrite';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      console.log('Checking user status...');
      const accountDetails = await account.get();
      console.log('User found:', accountDetails);
      setUser(accountDetails);
      
      // Store minimal user data in localStorage for messaging components
      localStorage.setItem('userData', JSON.stringify({
        id: accountDetails.$id,
        name: accountDetails.name,
        email: accountDetails.email
      }));
    } catch (error) {
      console.log('No active session found:', error.message);
      setUser(null);
      localStorage.removeItem('userData');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      await account.createEmailPasswordSession(email, password);
      return checkUserStatus();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      // Clear user data from localStorage
      localStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout failed', error);
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      await account.create(ID.unique(), email, password, name);
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const loginWithGitHub = async () => {
    try {
      // Get the current URL for redirection
      const redirectUrl = window.location.href;
      
      // Create OAuth session with GitHub
      account.createOAuth2Session('github', redirectUrl, redirectUrl);
      // Note: This will redirect the user to GitHub for authentication
    } catch (error) {
      console.error('GitHub login failed', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    loginWithGitHub,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
