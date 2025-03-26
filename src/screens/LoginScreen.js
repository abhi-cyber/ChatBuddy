import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {useAuth} from "../context/AuthContext";

const LoginScreen = () => {
  const {signIn, isLoading} = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#FF9F4A", "#FF6B8A"]}
        style={styles.gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/bot-avatar.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>GenZ Therapist</Text>
            <Text style={styles.tagline}>
              Your ultimate vibe curator & mental health hype-friend
            </Text>
          </View>

          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome, Bestie! 👋</Text>
            <Text style={styles.welcomeText}>
              Sign in to track your mood, chat with your AI therapist, and get
              personalized support.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={signIn}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FF6B8A" />
            ) : (
              <>
                <Image
                  source={require("../assets/google-logo.png")}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.privacyText}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    opacity: 0.9,
  },
  welcomeContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 24,
    borderRadius: 16,
    marginBottom: 40,
    width: "100%",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: "white",
    lineHeight: 24,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 30,
    width: "100%",
    marginBottom: 24,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  privacyText: {
    fontSize: 12,
    color: "white",
    opacity: 0.8,
    textAlign: "center",
  },
});

export default LoginScreen;
