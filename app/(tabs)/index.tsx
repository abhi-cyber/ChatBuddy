import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Text,
  SafeAreaView,
  Image,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {LinearGradient} from "expo-linear-gradient";
import {useRouter} from "expo-router";
import {useAuth} from "@/src/context/AuthContext";
import {Colors} from "@/constants/Colors";
import {useColorScheme} from "@/hooks/useColorScheme";
import Animated, {FadeInDown, FadeInRight} from "react-native-reanimated";
import {setPersona} from "@/src/services/geminiService";
import {PERSONA_STORAGE_KEY} from "@/src/utils/personaConstants";

// Placeholder avatar component when images aren't available
const PlaceholderAvatar: React.FC<{color: string; size: number}> = ({
  color,
  size,
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      justifyContent: "center",
      alignItems: "center",
    }}>
    <Text style={{color: "white", fontSize: size / 3, fontWeight: "bold"}}>
      AI
    </Text>
  </View>
);

interface BotCardProps {
  title: string;
  description: string;
  color1: string;
  color2: string;
  onPress: () => void;
  delay?: number;
  emoji: string;
}

const BotCard = ({
  title,
  description,
  color1,
  color2,
  onPress,
  delay = 0,
  emoji,
}: BotCardProps) => (
  <Animated.View entering={FadeInRight.delay(delay).springify()}>
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={[color1, color2]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.botCard}>
        <View style={styles.botAvatarContainer}>
          <Text style={styles.botEmoji}>{emoji}</Text>
        </View>
        <View style={styles.botInfo}>
          <Text style={styles.botTitle}>{title}</Text>
          <Text style={styles.botDescription}>{description}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
);

export default function HomeScreen() {
  const router = useRouter();
  interface AuthUser {
    displayName?: string;
    photoURL?: string;
  }
  const {user} = useAuth() as {user: AuthUser | null};
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";

  const navigateToChat = async (personaType: string) => {
    try {
      // Save selection to AsyncStorage
      await AsyncStorage.setItem(PERSONA_STORAGE_KEY, personaType);

      // Update geminiService with selected persona
      setPersona(personaType);

      // Navigate to chat
      router.push("/chat");
    } catch (error) {
      console.error("Error setting persona:", error);
      // Navigate even if there's an error
      router.push("/chat");
    }
  };

  const firstName = user?.displayName?.split(" ")[0] || "Friend";

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: Colors[theme].background}]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Animated Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.welcomeText, {color: Colors[theme].text}]}>
                Welcome back,
              </Text>
              <Text style={[styles.nameText, {color: Colors[theme].text}]}>
                {firstName} 👋
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/profile")}>
              {user?.photoURL ? (
                <Image
                  source={{uri: user.photoURL}}
                  style={styles.profileImage}
                />
              ) : (
                <PlaceholderAvatar color="#6C5CE7" size={48} />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* App Introduction */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View
            style={[
              styles.introCard,
              {backgroundColor: Colors[theme].cardBackground},
            ]}>
            <Text style={[styles.introTitle, {color: Colors[theme].text}]}>
              Your AI Companions Await
            </Text>
            <Text
              style={[styles.introDescription, {color: Colors[theme].icon}]}>
              Choose a companion that resonates with you today. Each offers
              unique perspectives and support for whatever you're going through.
            </Text>
          </View>
        </Animated.View>

        {/* Bot Selection Section */}
        <Text style={[styles.sectionTitle, {color: Colors[theme].text}]}>
          Choose Your Chat Buddy
        </Text>

        <View style={styles.botsContainer}>
          <BotCard
            title="Supportive Friend"
            description="A reliable companion for everyday conversations and support"
            color1="#6C5CE7"
            color2="#8B5CF6"
            emoji="🤗"
            onPress={() => navigateToChat("best_friend")}
            delay={300}
          />

          <BotCard
            title="Empathetic Listener"
            description="Nurturing, caring and emotionally attuned to your needs"
            color1="#FF7EB3"
            color2="#FF4993"
            emoji="💖"
            onPress={() => navigateToChat("empathetic_listener")}
            delay={400}
          />

          <BotCard
            title="Motivational Coach"
            description="Encouraging, supportive and focused on your growth"
            color1="#0ABDE3"
            color2="#0984E3"
            emoji="💪"
            onPress={() => navigateToChat("motivational_coach")}
            delay={500}
          />
        </View>

        {/* Recent Conversations */}
        <Text style={[styles.sectionTitle, {color: Colors[theme].text}]}>
          Recent Conversations
        </Text>

        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <TouchableOpacity
            style={[
              styles.recentChatCard,
              {backgroundColor: Colors[theme].cardBackground},
            ]}
            onPress={() => router.push("/chat")}>
            <View style={styles.recentChatAvatar}>
              <Text style={styles.recentChatEmoji}>🤗</Text>
            </View>
            <View style={styles.recentChatInfo}>
              <Text
                style={[styles.recentChatName, {color: Colors[theme].text}]}>
                Supportive Friend
              </Text>
              <Text
                style={[styles.recentChatPreview, {color: Colors[theme].icon}]}
                numberOfLines={1}>
                Hey, how's your day going? I've been...
              </Text>
            </View>
            <Text style={[styles.recentChatTime, {color: Colors[theme].icon}]}>
              2m ago
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "400",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: -4,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0E0E0",
  },
  introCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  introDescription: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  botsContainer: {
    marginBottom: 30,
    gap: 16,
  },
  botCard: {
    height: 100,
    borderRadius: 20,
    flexDirection: "row",
    overflow: "hidden",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    paddingLeft: 10,
  },
  botAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  botEmoji: {
    fontSize: 40,
  },
  botInfo: {
    flex: 1,
    paddingHorizontal: 16,
  },
  botTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  botDescription: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    fontWeight: "400",
  },
  recentChatCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recentChatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6C5CE7",
    justifyContent: "center",
    alignItems: "center",
  },
  recentChatEmoji: {
    fontSize: 28,
  },
  recentChatInfo: {
    flex: 1,
    marginLeft: 16,
  },
  recentChatName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 3,
  },
  recentChatPreview: {
    fontSize: 13,
    fontWeight: "400",
  },
  recentChatTime: {
    fontSize: 12,
    fontWeight: "400",
    marginLeft: 8,
  },
});
