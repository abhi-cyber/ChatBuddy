import React, {useState, useEffect} from "react";
import {StyleSheet, View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Stack} from "expo-router";

import ChatScreen from "@/src/screens/ChatScreen";
import PersonaSelectionScreen from "@/src/screens/PersonaSelectionScreen";
import {setPersona} from "@/src/services/geminiService";
import {PERSONA_STORAGE_KEY} from "@/src/utils/personaConstants";

export default function ChatTab() {
  const [personaSelected, setPersonaSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPersona = async () => {
      try {
        const savedPersona = await AsyncStorage.getItem(PERSONA_STORAGE_KEY);

        if (savedPersona) {
          setPersona(savedPersona);
          setPersonaSelected(true);
        }
      } catch (error) {
        console.error("Error checking saved persona:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPersona();
  }, []);

  const handlePersonaSelected = (personaType: string) => {
    console.log("Persona selected:", personaType);
    setPersona(personaType);
    setPersonaSelected(true);
  };

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <>
      <Stack.Screen options={{headerShown: false}} />

      <View style={styles.container}>
        {personaSelected ? (
          <ChatScreen onChangePersona={() => setPersonaSelected(false)} />
        ) : (
          <PersonaSelectionScreen onPersonaSelected={handlePersonaSelected} />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
