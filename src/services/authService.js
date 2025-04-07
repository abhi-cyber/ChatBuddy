import {
  // GoogleAuthProvider, // Commented out for now
  // signInWithCredential, // Commented out for now
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
// import * as WebBrowser from "expo-web-browser"; // Commented out for now
// import * as Google from "expo-auth-session/providers/google"; // Commented out for now
import {getFirebaseAuth} from "./firebaseService";
import {Platform} from "react-native";
import Constants from "expo-constants";
// import {GOOGLE_AUTH} from "../utils/env"; // Commented out for now

// Comment out WebBrowser call
// WebBrowser.maybeCompleteAuthSession();

// Comment out Google client IDs
// const EXPO_CLIENT_ID = GOOGLE_AUTH.expoClientId;
// const ANDROID_CLIENT_ID = GOOGLE_AUTH.androidClientId;
// const IOS_CLIENT_ID = GOOGLE_AUTH.iosClientId;
// const WEB_CLIENT_ID = GOOGLE_AUTH.webClientId;

console.log(`Using authentication for platform: ${Platform.OS}`);

// Authentication state listeners
const authStateListeners = [];

/**
 * Sign up with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} displayName - User's display name
 * @returns {Promise<Object>} Firebase user credentials
 */
export const signUpWithEmailPassword = async (email, password, displayName) => {
  try {
    const auth = getFirebaseAuth();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update the user profile with the display name
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });
    }

    console.log("Successfully signed up:", userCredential.user.email);
    return userCredential;
  } catch (error) {
    console.error("Sign up error:", error.message);
    throw error;
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Firebase user credentials
 */
export const signInWithEmailPassword = async (email, password) => {
  try {
    const auth = getFirebaseAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("Successfully signed in:", userCredential.user.email);
    return userCredential;
  } catch (error) {
    console.error("Sign in error:", error.message);
    throw error;
  }
};

/* 
// Google auth section commented out
export const useGoogleAuth = () => {
  // Set up proper redirect URI based on platform - CRITICAL FOR AUTHORIZATION!
  let redirectUri;

  if (Platform.OS === "ios") {
    // Correctly format the iOS redirect URI
    redirectUri = `com.googleusercontent.apps.${GOOGLE_AUTH.iosClientId}:/oauth2redirect/google`;
    // Remove any `.apps.googleusercontent.com` suffix
    redirectUri = redirectUri.replace(".apps.googleusercontent.com", "");
  } else {
    redirectUri = "https://auth.expo.io/@abhi-cyber/ChatBuddy";
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
*/

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

/**
 * Update the current user's profile information
 * @param {Object} profileData - Object containing updated profile data
 * @param {string} [profileData.displayName] - The user's new display name
 * @param {string} [profileData.photoURL] - The URL of the user's new profile photo
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (profileData) => {
  try {
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }

    // In a real app, you'd upload the image to storage first
    // and then update the user's profile with the image URL

    /*
    // Example of how you might handle file upload with Firebase storage:
    if (profileData.photoURL && profileData.photoURL.startsWith('file://')) {
      const fileName = `profile_${currentUser.uid}_${Date.now()}`;
      const reference = storage().ref(`profile_images/${fileName}`);
      await reference.putFile(profileData.photoURL);
      const downloadURL = await reference.getDownloadURL();
      profileData.photoURL = downloadURL;
    }
    */

    await updateProfile(currentUser, profileData);
    return currentUser;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
