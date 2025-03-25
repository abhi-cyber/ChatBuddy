import React from "react";
import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import {saveMoodEntry} from "../services/firebaseService";
import {updateStreak} from "../services/streakService";

const MoodSuggestion = ({mood, onDismiss}) => {
  // Get emoji based on detected mood
  const getMoodEmoji = (moodValue) => {
    switch (moodValue) {
      case "very_sad":
        return "😭";
      case "sad":
        return "😔";
      case "neutral":
        return "😐";
      case "good":
        return "🙂";
      case "very_good":
        return "😊";
      default:
        return "😐";
    }
  };

  // Get friendly mood label
  const getMoodLabel = (moodValue) => {
    switch (moodValue) {
      case "very_sad":
        return "not vibing";
      case "sad":
        return "down";
      case "neutral":
        return "neutral";
      case "good":
        return "pretty good";
      case "very_good":
        return "awesome";
      default:
        return "neutral";
    }
  };

  const handleSaveMood = async () => {
    try {
      await saveMoodEntry(mood);
      await updateStreak();
      onDismiss();
    } catch (error) {
      console.error("Error saving suggested mood:", error);
      onDismiss();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Sounds like you're feeling {getMoodLabel(mood)} {getMoodEmoji(mood)}.
        Want to save this to your mood tracker?
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonSave} onPress={handleSaveMood}>
          <Text style={styles.buttonSaveText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSkip} onPress={onDismiss}>
          <Text style={styles.buttonSkipText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF0F5",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B8A",
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 15,
  },
  text: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "flex-end",
  },
  buttonSave: {
    backgroundColor: "#FF6B8A",
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  buttonSaveText: {
    color: "white",
    fontSize: 13,
    fontWeight: "500",
  },
  buttonSkip: {
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  buttonSkipText: {
    color: "#666",
    fontSize: 13,
  },
});

export default MoodSuggestion;
