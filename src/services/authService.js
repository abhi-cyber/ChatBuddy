import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {getFirebaseAuth} from "./firebaseService";
import {Platform} from "react-native";
import Constants from "expo-constants";
import {GOOGLE_AUTH} from "../utils/env";

// Register for a web browser redirect
WebBrowser.maybeCompleteAuthSession();

// Client IDs now imported from environment utility
const EXPO_CLIENT_ID = GOOGLE_AUTH.expoClientId;
const ANDROID_CLIENT_ID = GOOGLE_AUTH.androidClientId;
const IOS_CLIENT_ID = GOOGLE_AUTH.iosClientId;
const WEB_CLIENT_ID = GOOGLE_AUTH.webClientId;

console.log(`Using OAuth config for platform: ${Platform.OS}`);

// Authentication state listeners
const authStateListeners = [];

/**
 * Initialize Google Sign-In
 * @returns {Object} Auth request object and methods
 */
export const useGoogleAuth = () => {
  // Set up proper redirect URI based on platform - CRITICAL FOR AUTHORIZATION!
  let redirectUri;

  if (Platform.OS === "ios") {
    // Use the exact iOS URL scheme format provided by Google
    redirectUri =
      "com.googleusercontent.apps.652705687282-ahrsrnpej70fhqprke8gop8bj3fsil41:/oauth2redirect/google";
  } else if (Platform.OS === "web") {
    redirectUri = "http://localhost:19006";
  } else {
    // For Expo Go testing
    redirectUri = "https://auth.expo.io/@abhi-cyber/GenZTherapist";
  }

  console.log("Auth redirect URI:", redirectUri);

  // Create the auth request configuration
  const config = {
    webClientId: WEB_CLIENT_ID, // Required for Firebase auth
    selectAccount: true,
    redirectUri,
  };

  // Add platform-specific client IDs
  if (Platform.OS === "ios") {
    config.iosClientId = IOS_CLIENT_ID;
  } else if (Platform.OS === "android") {
    config.androidClientId = ANDROID_CLIENT_ID;
  } else if (Platform.OS === "web") {
    config.expoClientId = EXPO_CLIENT_ID;
  }

  const [request, response, promptAsync] = Google.useAuthRequest(config);

  return {request, response, promptAsync};
};

/**
 * Handle Google Sign-In response
 * @param {Object} response - Auth response from Google
 * @returns {Promise<Object>} Firebase user credentials
 */
export const handleGoogleSignIn = async (response) => {
  console.log("Google sign-in response type:", response?.type);

  if (response?.type === "success") {
    try {
      const {id_token} = response.params;
      console.log("ID token obtained successfully");

      const auth = getFirebaseAuth();
      const credential = GoogleAuthProvider.credential(id_token);
      const result = await signInWithCredential(auth, credential);

      console.log(
        "Successfully signed in with Google:",
        result.user.displayName
      );
      return result;
    } catch (error) {
      console.error("Firebase credential error:", error.message);
      throw error;
    }
  } else {
    console.error("Google Sign-In failed:", response);
    throw new Error(`Google Sign-In was ${response?.type || "unsuccessful"}`);
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const handleSignOut = async () => {
  const auth = getFirebaseAuth();
  await signOut(auth);
  console.log("User signed out");
};

/**
 * Get the current authenticated user
 * @returns {Object|null} Firebase user object or null if not authenticated
 */
export const getCurrentUser = () => {
  const auth = getFirebaseAuth();
  return auth.currentUser;
};

/**
 * Subscribe to authentication state changes
 * @param {Function} listener - Callback function to handle auth state changes
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAuthChanges = (listener) => {
  const auth = getFirebaseAuth();

  // Register listener for later cleanup
  authStateListeners.push(listener);

  return onAuthStateChanged(auth, (user) => {
    listener(user);
  });
};

/**
 * Clean up all auth state listeners
 */
export const cleanupAuthListeners = () => {
  authStateListeners.forEach((listener) => {
    if (typeof listener.unsubscribe === "function") {
      listener.unsubscribe();
    }
  });
  authStateListeners.length = 0;
};
