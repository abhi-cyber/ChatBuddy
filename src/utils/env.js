import Constants from "expo-constants";

/**
 * Environment variable utility
 *
 * This utility handles retrieving environment variables safely across different environments
 * (development, production, etc.) and provides fallbacks.
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

  // Fall back to hardcoded value if necessary
  return fallback;
};

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: getEnvVar(
    "FIREBASE_API_KEY",
    "AIzaSyBu_tkCFY0Swm4HDdM7dO6by-RBtgi1saU"
  ),
  authDomain: getEnvVar(
    "FIREBASE_AUTH_DOMAIN",
    "genztherapist-8c68d.firebaseapp.com"
  ),
  projectId: getEnvVar("FIREBASE_PROJECT_ID", "genztherapist-8c68d"),
  storageBucket: getEnvVar(
    "FIREBASE_STORAGE_BUCKET",
    "genztherapist-8c68d.firebasestorage.app"
  ),
  messagingSenderId: getEnvVar("FIREBASE_MESSAGING_SENDER_ID", "334687005447"),
  appId: getEnvVar(
    "FIREBASE_APP_ID",
    "1:334687005447:web:0232a562b3b3b950c633a2"
  ),
  measurementId: getEnvVar("FIREBASE_MEASUREMENT_ID", "G-JFYTPER77P"),
};

// Gemini API
export const GEMINI_API_KEY = getEnvVar(
  "GEMINI_API_KEY",
  "AIzaSyCNQXqkTIDBfk5gy1idtlHjz2_TwkSgOM0"
);

// Google OAuth
export const GOOGLE_AUTH = {
  expoClientId: getEnvVar(
    "EXPO_CLIENT_ID",
    "652705687282-9h54d0mc6crrjqn17oo06s9kk7q54ari.apps.googleusercontent.com"
  ),
  androidClientId: getEnvVar("ANDROID_CLIENT_ID", ""),
  iosClientId: getEnvVar(
    "IOS_CLIENT_ID",
    "652705687282-ahrsrnpej70fhqprke8gop8bj3fsil41.apps.googleusercontent.com"
  ),
  webClientId: getEnvVar(
    "WEB_CLIENT_ID",
    "652705687282-3ahec6hnun7kvnvg2g8k471ci4looqoc.apps.googleusercontent.com"
  ),
};

// Chat Configuration
export const CHAT_CONFIG = {
  maxConversationLength: parseInt(getEnvVar("MAX_CONVERSATION_LENGTH", "10")),
  defaultTemperature: parseFloat(getEnvVar("DEFAULT_TEMPERATURE", "0.7")),
  maxTokens: parseInt(getEnvVar("MAX_TOKENS", "300")),
};
