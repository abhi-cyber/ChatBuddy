import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {
  PERSONA_TYPES,
  PERSONA_DETAILS,
  DEFAULT_PERSONA,
} from "../utils/personaConstants";
import {setPersona} from "../services/geminiService";

const PERSONA_STORAGE_KEY = "ChatBuddy_SelectedPersona";

const PersonaSelectionScreen = ({onPersonaSelected}) => {
  const [selectedPersona, setSelectedPersona] = useState(DEFAULT_PERSONA);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Load saved persona on mount
  useEffect(() => {
    const loadSavedPersona = async () => {
      try {
        const savedPersona = await AsyncStorage.getItem(PERSONA_STORAGE_KEY);
        if (savedPersona && PERSONA_DETAILS[savedPersona]) {
          setSelectedPersona(savedPersona);
        }
      } catch (error) {
        console.error("Error loading saved persona:", error);
      }
    };

    loadSavedPersona();
  }, []);

  const handleSelectPersona = async (personaType) => {
    setSelectedPersona(personaType);

    try {
      // Save selection to AsyncStorage
      await AsyncStorage.setItem(PERSONA_STORAGE_KEY, personaType);

      // Update geminiService with selected persona
      setPersona(personaType);

      // Notify parent component or navigate
      if (onPersonaSelected) {
        onPersonaSelected(personaType);
      } else {
        navigation.navigate("Chat");
      }
    } catch (error) {
      console.error("Error saving persona selection:", error);
    }
  };

  const renderPersonaCard = (personaType) => {
    const persona = PERSONA_DETAILS[personaType];
    const isSelected = selectedPersona === personaType;

    return (
      <TouchableOpacity
        key={personaType}
        style={[
          styles.personaCard,
          isSelected && styles.selectedCard,
          {borderColor: isSelected ? persona.textColor : "#E0E0E0"},
        ]}
        onPress={() => handleSelectPersona(personaType)}>
        <View style={styles.cardContent}>
          <View style={styles.avatarContainer}>
            <Image
              source={persona.avatar}
              defaultSource={persona.fallbackAvatar}
              style={styles.avatarImage}
            />
          </View>

          <View style={styles.personaInfo}>
            <Text style={styles.personaName}>{persona.name}</Text>
            <Text style={styles.personaDescription}>{persona.description}</Text>
          </View>
        </View>

        <View style={styles.sampleContainer}>
          <View
            style={[
              styles.sampleBubble,
              {backgroundColor: persona.bubbleColor},
            ]}>
            <Text
              style={[styles.sampleText, {color: persona.textColor}]}
              numberOfLines={2}>
              "{persona.initialMessage.slice(0, 60)}..."
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(20, insets.top),
            paddingBottom: Math.max(20, insets.bottom),
            paddingLeft: Math.max(20, insets.left),
            paddingRight: Math.max(20, insets.right),
          },
        ]}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Vibe</Text>
          <Text style={styles.subtitle}>
            Select who you want to chat with today
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {Object.keys(PERSONA_TYPES).map((key) =>
            renderPersonaCard(PERSONA_TYPES[key])
          )}
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => handleSelectPersona(selectedPersona)}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  cardsContainer: {
    marginBottom: 30,
  },
  personaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCard: {
    borderWidth: 2,
  },
  cardContent: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  personaInfo: {
    flex: 1,
    justifyContent: "center",
  },
  personaName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  personaDescription: {
    fontSize: 14,
    color: "#666",
  },
  sampleContainer: {
    marginTop: 8,
  },
  sampleBubble: {
    padding: 12,
    borderRadius: 16,
  },
  sampleText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  continueButton: {
    backgroundColor: "#FF6B8A",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PersonaSelectionScreen;
