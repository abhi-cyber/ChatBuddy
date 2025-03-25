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

// Firebase configuration
const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "***REMOVED***",
  projectId: "***REMOVED***",
  storageBucket: "***REMOVED***.firebasestorage.app",
  messagingSenderId: "***REMOVED***",
  appId: "1:***REMOVED***:web:0232a562b3b3b950c633a2",
  measurementId: "***REMOVED***",
};

// Initialize Firebase - check if already initialized
let app;
let db;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp(); // Use existing app
  }
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

/**
 * Save a new mood entry to Firebase
 * @param {string} moodValue - The value of the selected mood
 * @returns {Promise<object>} The saved document reference
 */
export const saveMoodEntry = async (moodValue) => {
  try {
    // Get current user ID (in a real app, this would come from authentication)
    // For now, we'll use a placeholder
    const userId = "user123";

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
    // Get current user ID (placeholder)
    const userId = "user123";

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
