import React, {createContext, useContext, useState, useEffect} from "react";
import {
  subscribeToAuthChanges,
  getCurrentUser,
  handleSignOut,
  useGoogleAuth,
  handleGoogleSignIn,
} from "../services/authService";

// Create auth context
const AuthContext = createContext({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  promptGoogleSignIn: async () => {},
});

// Auth provider component
export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Google auth setup
  const {request, response, promptAsync} = useGoogleAuth();

  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === "success") {
      setIsLoading(true);
      handleGoogleSignIn(response).catch((error) => {
        console.error("Error during sign in:", error);
        setIsLoading(false);
      });
    }
  }, [response]);

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

  // Auth context value
  const value = {
    user,
    isLoading,
    signIn: async () => {
      setIsLoading(true);
      await promptAsync();
    },
    signOut: async () => {
      setIsLoading(true);
      await handleSignOut();
    },
    promptGoogleSignIn: async () => {
      if (request) {
        await promptAsync();
      } else {
        console.error("Google auth request not ready");
      }
    },
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
