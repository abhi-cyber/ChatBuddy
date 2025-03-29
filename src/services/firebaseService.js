import {initializeApp, getApps, getApp} from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {FIREBASE_CONFIG} from "../utils/env";

// Firebase configuration now imported from environment utility
const firebaseConfig = FIREBASE_CONFIG;

// Initialize Firebase - check if already initialized
let app;
let db;
let auth;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    // Initialize auth with AsyncStorage for persistence
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } else {
    app = getApp(); // Use existing app
    auth = getAuth(app);
  }
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Export auth for use in authentication service
export const getFirebaseAuth = () => auth;
