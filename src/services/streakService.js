import AsyncStorage from "@react-native-async-storage/async-storage";

const STREAK_KEY = "@GenZTherapist:streak";
const LAST_CHECKIN_DATE_KEY = "@GenZTherapist:lastCheckinDate";

/**
 * Get the current streak count from AsyncStorage
 * @returns {Promise<number>} Current streak count
 */
export const getStreak = async () => {
  try {
    const streakString = await AsyncStorage.getItem(STREAK_KEY);
    return streakString ? parseInt(streakString, 10) : 0;
  } catch (error) {
    console.error("Error getting streak:", error);
    return 0;
  }
};

/**
 * Update streak based on last check-in date
 * @returns {Promise<number>} New streak count
 */
export const updateStreak = async () => {
  try {
    // Get the last check-in date
    const lastCheckinDateString = await AsyncStorage.getItem(
      LAST_CHECKIN_DATE_KEY
    );
    const currentDate = new Date();
    const today = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    ).getTime();

    // Get the current streak
    const currentStreak = await getStreak();
    let newStreak = currentStreak;

    if (lastCheckinDateString) {
      const lastCheckinDate = new Date(parseInt(lastCheckinDateString, 10));
      const lastCheckinDay = new Date(
        lastCheckinDate.getFullYear(),
        lastCheckinDate.getMonth(),
        lastCheckinDate.getDate()
      ).getTime();

      const oneDayInMs = 24 * 60 * 60 * 1000;
      const dayDifference = Math.round((today - lastCheckinDay) / oneDayInMs);

      if (dayDifference === 0) {
        // Already checked in today, streak remains the same
        return currentStreak;
      } else if (dayDifference === 1) {
        // Consecutive day, increment streak
        newStreak = currentStreak + 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }
    } else {
      // First check-in ever
      newStreak = 1;
    }

    // Update AsyncStorage with new streak and current date
    await AsyncStorage.setItem(STREAK_KEY, newStreak.toString());
    await AsyncStorage.setItem(LAST_CHECKIN_DATE_KEY, today.toString());

    return newStreak;
  } catch (error) {
    console.error("Error updating streak:", error);
    return 0;
  }
};

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
