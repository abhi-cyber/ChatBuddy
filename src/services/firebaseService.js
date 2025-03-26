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

// Firebase configuration
const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "***REMOVED***",
  projectId: "***REMOVED***",
  storageBucket: "***REMOVED***.firebasestorage.app",
  messagingSenderId: "***REMOVED***", // Corrected to match Firebase project number
  appId: "1:***REMOVED***:web:0232a562b3b3b950c633a2", // Corrected format
  measurementId: "***REMOVED***",
};

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

/**
 * Save a new mood entry to Firebase
 * @param {string} moodValue - The value of the selected mood
 * @returns {Promise<object>} The saved document reference
 */
export const saveMoodEntry = async (moodValue) => {
  try {
    // Get current user ID from authentication
    const userId = auth.currentUser ? auth.currentUser.uid : "anonymous";

    const moodEntry = {
      userId,
      mood: moodValue,
      timestamp: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, "moodEntries"), moodEntry);
    console.log("Mood entry saved with ID:", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Error saving mood entry:", error);
    throw error;
  }
};

/**
 * Get mood history for the last 7 days
 * @returns {Promise<Array>} Array of mood entries
 */
export const getMoodHistory = async () => {
  try {
    // Get current user ID from authentication
    const userId = auth.currentUser ? auth.currentUser.uid : "anonymous";

    // Get date from 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const moodsQuery = query(
      collection(db, "moodEntries"),
      where("userId", "==", userId),
      where("timestamp", ">=", Timestamp.fromDate(sevenDaysAgo)),
      orderBy("timestamp", "desc"),
      limit(7)
    );

    const querySnapshot = await getDocs(moodsQuery);
    const moodEntries = [];

    querySnapshot.forEach((doc) => {
      moodEntries.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      });
    });

    return moodEntries;
  } catch (error) {
    console.error("Error getting mood history:", error);
    // Return empty array instead of throwing to make the UI more resilient
    return [];
  }
};
