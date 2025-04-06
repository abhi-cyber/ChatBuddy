import React, {useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {useAuth} from "../context/AuthContext";

const LoginScreen = () => {
  const {signIn, signUp, isLoading, error} = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setLocalError("Email and password are required");
      return;
    }

    try {
      setLocalError(null);
      await signIn(email, password);
    } catch (err) {
      // Error handling is done in the AuthContext
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#FF9F4A", "#FF6B8A"]}
        style={styles.gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{flex: 1}}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.contentContainer}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/bot-avatar.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.appName}>Chat Buddy</Text>
                <Text style={styles.tagline}>
                  Your trusted AI companion for meaningful conversations
                </Text>
              </View>

              <View style={styles.authContainer}>
                <Text style={styles.authTitle}>Login</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                {(localError || error) && (
                  <Text style={styles.errorText}>{localError || error}</Text>
                )}

                <TouchableOpacity
                  style={styles.authButton}
                  onPress={handleLogin}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FF6B8A" />
                  ) : (
                    <Text style={styles.authButtonText}>Login</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.forgotPasswordButton}>
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.privacyText}>
                By signing in, you agree to our Terms of Service and Privacy
                Policy.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
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
  authContainer: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: "white",
  },
  errorText: {
    color: "#FFD2D2",
    marginBottom: 16,
    textAlign: "center",
  },
  authButton: {
    width: "100%",
    height: 50,
    backgroundColor: "white",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B8A",
  },
  forgotPasswordButton: {
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "white",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  privacyText: {
    fontSize: 12,
    color: "white",
    opacity: 0.8,
    textAlign: "center",
  },
});

export default LoginScreen;
