import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {useRouter, Redirect} from "expo-router";
import {LinearGradient} from "expo-linear-gradient";
import {useAuth} from "@/src/context/AuthContext";
import {Colors} from "@/constants/Colors";
import {useColorScheme} from "@/hooks/useColorScheme";
import Animated, {FadeInUp} from "react-native-reanimated";
import {Ionicons} from "@expo/vector-icons";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";

export default function SignupScreen() {
  const {user, isLoading, signUp} = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const insets = useSafeAreaInsets();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setLocalError("All fields are required");
      return;
    }

    try {
      setLocalError(null);
      await signUp(email, password, name);
    } catch (err) {
      // Error handling is done in the AuthContext, but we'll keep this for additional handling
      if (err instanceof Error) {
        setLocalError(err.message);
      }
    }
  };

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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
                paddingLeft: Math.max(insets.left, 24),
                paddingRight: Math.max(insets.right, 24),
              },
            ]}
            keyboardShouldPersistTaps="handled">
            {/* Header with back button */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <Animated.View entering={FadeInUp.duration(800).springify()}>
              <View style={styles.titleContainer}>
                <Text style={styles.titleText}>Create Account</Text>
                <Text style={styles.subtitleText}>
                  Sign up to start your journey with ChatBuddy
                </Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="rgba(255,255,255,0.7)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Your Name"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="rgba(255,255,255,0.7)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="rgba(255,255,255,0.7)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="rgba(255,255,255,0.7)"
                    />
                  </TouchableOpacity>
                </View>

                {localError && (
                  <Text style={styles.errorText}>{localError}</Text>
                )}

                <Text style={styles.termsText}>
                  By creating an account, you agree to our Terms of Service and
                  Privacy Policy
                </Text>

                <TouchableOpacity
                  style={styles.signupButton}
                  onPress={handleSignup}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#6C5CE7" />
                  ) : (
                    <Text style={styles.signupButtonText}>Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.footerContainer}>
                <Text style={styles.hasAccountText}>
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 20,
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    marginBottom: 40,
  },
  titleText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  formContainer: {
    width: "100%",
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    color: "#FFD2D2",
    marginBottom: 16,
    textAlign: "center",
  },
  termsText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 18,
  },
  signupButton: {
    backgroundColor: "white",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  signupButtonText: {
    color: "#6C5CE7",
    fontSize: 16,
    fontWeight: "600",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  hasAccountText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginRight: 4,
  },
  loginText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
