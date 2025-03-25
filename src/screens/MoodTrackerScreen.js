import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {saveMoodEntry, getMoodHistory} from "../services/firebaseService";
import {updateStreak, getStreak} from "../services/streakService";

const MoodTrackerScreen = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [streakCount, setStreakCount] = useState(0);
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingMood, setSavingMood] = useState(false);

  // Mood options with emojis and values
  const moods = [
    {emoji: "😭", value: "very_sad", label: "Very Sad"},
    {emoji: "😔", value: "sad", label: "Sad"},
    {emoji: "😐", value: "neutral", label: "Neutral"},
    {emoji: "🙂", value: "good", label: "Good"},
    {emoji: "😊", value: "very_good", label: "Very Good"},
  ];

  useEffect(() => {
    // Load streak and mood history when component mounts
    const loadData = async () => {
      try {
        const streak = await getStreak();
        setStreakCount(streak);

        const history = await getMoodHistory();
        setMoodHistory(history);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    setSavingMood(true);

    try {
      // Save mood to Firebase
      await saveMoodEntry(mood.value);

      // Update streak in AsyncStorage
      const newStreak = await updateStreak();
      setStreakCount(newStreak);

      // Refresh mood history
      const history = await getMoodHistory();
      setMoodHistory(history);
    } catch (error) {
      console.error("Error saving mood:", error);
    } finally {
      setSavingMood(false);
    }
  };

  // Get last 7 days for display
  const getLastSevenDays = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(
        date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    }
    return days;
  };

  // Find mood for a specific day in history
  const getMoodForDay = (day) => {
    const entry = moodHistory.find((item) => {
      const entryDate = new Date(item.timestamp).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      return entryDate === day;
    });

    if (entry) {
      const mood = moods.find((m) => m.value === entry.mood);
      return mood ? mood.emoji : null;
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B8A" />
        <Text style={styles.loadingText}>Loading your vibe tracker...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vibe Check</Text>
        <View style={styles.streakContainer}>
          <Text style={styles.streakText}>Weekly streak: </Text>
          <Text style={styles.streakCount}>{streakCount}</Text>
          <Text style={styles.streakText}> days</Text>
        </View>
      </View>

      <Text style={styles.question}>How are you feeling today, bestie?</Text>

      <View style={styles.moodContainer}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.value}
            style={[
              styles.moodButton,
              selectedMood?.value === mood.value && styles.selectedMoodButton,
            ]}
            onPress={() => handleMoodSelect(mood)}
            disabled={savingMood}>
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={styles.moodLabel}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {savingMood && (
        <View style={styles.savingContainer}>
          <ActivityIndicator size="small" color="#FF6B8A" />
          <Text style={styles.savingText}>Saving your vibe...</Text>
        </View>
      )}

      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Your week so far</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {getLastSevenDays().map((day, index) => (
            <View key={index} style={styles.dayContainer}>
              <Text style={styles.dayText}>{day.split(" ")[0]}</Text>
              <View style={styles.dayEmojiContainer}>
                <Text style={styles.dayEmoji}>{getMoodForDay(day) || "•"}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          Tracking your daily mood helps you understand your emotional patterns!
          Keep the streak going!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6B8A",
    marginBottom: 10,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  streakText: {
    fontSize: 16,
    color: "#666",
  },
  streakCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B8A",
  },
  question: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  moodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    flexWrap: "wrap",
  },
  moodButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "white",
    width: "18%",
    aspectRatio: 0.9,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  selectedMoodButton: {
    backgroundColor: "#FFEBF0",
    borderWidth: 2,
    borderColor: "#FF6B8A",
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 5,
  },
  moodLabel: {
    fontSize: 10,
    textAlign: "center",
    color: "#666",
  },
  savingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
  },
  savingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#888",
  },
  historyContainer: {
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  dayContainer: {
    alignItems: "center",
    marginRight: 15,
    width: 60,
  },
  dayText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  dayEmojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  dayEmoji: {
    fontSize: 22,
  },
  messageContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#FFF0F5",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B8A",
  },
  messageText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
});

export default MoodTrackerScreen;
