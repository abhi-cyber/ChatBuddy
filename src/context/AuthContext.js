import React, {createContext, useContext, useState, useEffect} from "react";
import {
  subscribeToAuthChanges,
  getCurrentUser,
  handleSignOut,
  // useGoogleAuth, // Commented out
  // handleGoogleSignIn, // Commented out
  signInWithEmailPassword,
  signUpWithEmailPassword,
} from "../services/authService";
import {getFirebaseAuth} from "../services/firebaseService";

// Create auth context
const AuthContext = createContext({
  user: null,
  isLoading: true,
  signIn: async (email, password) => {},
  signUp: async (email, password, displayName) => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

// Auth provider component
export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Removed Google auth setup
  // const {request, response, promptAsync} = useGoogleAuth();

  // Removed Google Sign-In response handler
  /* 
  useEffect(() => {
    if (response?.type === "success") {
      setIsLoading(true);
      handleGoogleSignIn(response).catch((error) => {
        console.error("Error during sign in:", error);
        setIsLoading(false);
      });
    }
  }, [response]);
  */

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
      setIsLoading(false);
    });

    // Set initial user from current auth state
    setUser(getCurrentUser());

    // Cleanup subscription
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

  // Auth context value
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

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
