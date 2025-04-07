import React, {useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import {Redirect, useRouter} from "expo-router";
import {LinearGradient} from "expo-linear-gradient";
import {useAuth} from "@/src/context/AuthContext";
import {Colors} from "@/constants/Colors";
import {useColorScheme} from "@/hooks/useColorScheme";
import Animated, {FadeInDown, FadeIn} from "react-native-reanimated";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";

const {width} = Dimensions.get("window");

export default function WelcomeScreen() {
  const {user, isLoading} = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user && !isLoading) {
      // Navigate to home if user is already authenticated
      router.replace("/(tabs)");
    }
  }, [user, isLoading]);

  // If user is already authenticated, redirect to home
  if (user && !isLoading) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          Colors[theme].primaryGradientStart,
          Colors[theme].primaryGradientEnd,
        ]}
        style={styles.gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View
          style={[
            styles.contentContainer,
            {
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              paddingLeft: insets.left,
              paddingRight: insets.right,
            },
          ]}>
          <Animated.View entering={FadeIn.delay(100).duration(800)}>
            <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoEmoji}>🤗</Text>
              </View>
              <Text style={styles.appName}>Chat Buddy</Text>
              <Text style={styles.tagline}>
                Your ultimate vibe curator & mental health hype-friend
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIconText}>🫂</Text>
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Emotional Support</Text>
                  <Text style={styles.featureDescription}>
                    Connect with AI companions who understand you
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIconText}>💭</Text>
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Judgment-Free Zone</Text>
                  <Text style={styles.featureDescription}>
                    Express your thoughts in a safe space
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIconText}>🔒</Text>
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Private & Secure</Text>
                  <Text style={styles.featureDescription}>
                    Your conversations remain confidential
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(500).springify()}
            style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/login")}>
              <Text style={styles.primaryButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/signup")}>
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).springify()}>
            <Text style={styles.privacyText}>
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}

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
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoEmoji: {
    fontSize: 56,
  },
  appName: {
    fontSize: 38,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 22,
    maxWidth: width * 0.8,
  },
  featuresContainer: {
    width: "100%",
    marginBottom: 40,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  featureIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureTextContainer: {
    flex: 1,
    flexShrink: 1,
  },
  featureTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  featureDescription: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    lineHeight: 18,
  },
  buttonContainer: {
    width: "80%",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: "75%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: "75%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  privacyText: {
    fontSize: 12,
    marginHorizontal: 20,
    color: "white",
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 18,
  },
});
