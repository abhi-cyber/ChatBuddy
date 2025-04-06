import Constants from "expo-constants";

/**
 * Environment variable utility
 *
 * This utility handles retrieving environment variables safely across different environments
 * (development, production, etc.) and provides fallbacks for non-sensitive configuration only.
 */

// Get environment variables from Expo's manifest extra or process.env
const getEnvVar = (name, fallback = "") => {
  // Try to get from Expo Constants first
  const expoVar = Constants.expoConfig?.extra?.[name];
  if (expoVar !== undefined) return expoVar;

  // Then try from process.env if running in a Node environment
  if (typeof process !== "undefined" && process.env && process.env[name]) {
    return process.env[name];
  }

  // Fall back to default value if provided and the variable is non-sensitive
  return fallback;
};

// Firebase Configuration - no fallbacks for sensitive data
export const FIREBASE_CONFIG = {
  apiKey: getEnvVar("FIREBASE_API_KEY"),
  authDomain: getEnvVar("FIREBASE_AUTH_DOMAIN"),
  projectId: getEnvVar("FIREBASE_PROJECT_ID"),
  storageBucket: getEnvVar("FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnvVar("FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnvVar("FIREBASE_APP_ID"),
  measurementId: getEnvVar("FIREBASE_MEASUREMENT_ID"),
};

// Gemini API - no fallback for API key
export const GEMINI_API_KEY = getEnvVar("GEMINI_API_KEY");

// Google OAuth - no fallbacks for sensitive credentials
export const GOOGLE_AUTH = {
  expoClientId: getEnvVar("EXPO_CLIENT_ID"),
  // Ensure androidClientId is explicitly set when on Android platform
  androidClientId: getEnvVar("ANDROID_CLIENT_ID"),
  iosClientId: getEnvVar("IOS_CLIENT_ID"),
  webClientId: getEnvVar("WEB_CLIENT_ID"),
};

// Chat Configuration - keeping fallbacks for non-sensitive config
export const CHAT_CONFIG = {
  maxConversationLength: parseInt(getEnvVar("MAX_CONVERSATION_LENGTH", "10")),
  defaultTemperature: parseFloat(getEnvVar("DEFAULT_TEMPERATURE", "0.7")),
  maxTokens: parseInt(getEnvVar("MAX_TOKENS", "300")),
};
