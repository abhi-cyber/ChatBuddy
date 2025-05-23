import AsyncStorage from "@react-native-async-storage/async-storage";

const STREAK_KEY = "@ChatBuddy:streak";
const LAST_CHECKIN_DATE_KEY = "@ChatBuddy:lastCheckinDate";

/**
 * Reset streak to zero
 */
export const resetStreak = async () => {
  try {
    await AsyncStorage.setItem(STREAK_KEY, "0");
    await AsyncStorage.removeItem(LAST_CHECKIN_DATE_KEY);
  } catch (error) {
    console.error("Error resetting streak:", error);
  }
};
