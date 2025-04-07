import React, {createContext, useContext, useState, useEffect} from "react";
import {
  subscribeToAuthChanges,
  getCurrentUser,
  handleSignOut,
  signInWithEmailPassword,
  signUpWithEmailPassword,
} from "../services/authService";
import {getFirebaseAuth} from "../services/firebaseService";

const AuthContext = createContext({
  user: null,
  isLoading: true,
  signIn: async (email, password) => {},
  signUp: async (email, password, displayName) => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
      setIsLoading(false);
    });

    setUser(getCurrentUser());

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      await currentUser.reload();
      setUser({...currentUser});
    }
  };

  const value = {
    user,
    isLoading,
    error,
    signUp: async (email, password, displayName) => {
      setIsLoading(true);
      setError(null);
      try {
        await signUpWithEmailPassword(email, password, displayName);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
        throw error;
      }
    },
    signIn: async (email, password) => {
      setIsLoading(true);
      setError(null);
      try {
        await signInWithEmailPassword(email, password);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
        throw error;
      }
    },
    signOut: async () => {
      setIsLoading(true);
      setError(null);
      try {
        await handleSignOut();
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
        throw error;
      }
    },
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
