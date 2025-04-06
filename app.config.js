import "dotenv/config";

export default {
  name: "ChatBuddy",
  slug: "ChatBuddy",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme:
    "com.googleusercontent.apps.301315783938-bf7130q8tsh5pobp1jjh71u7ns7ris01",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    backgroundColor: "#6C5CE7",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.abhicyber.chatbuddy",
    config: {
      googleSignIn: {
        reservedClientId:
          "com.googleusercontent.apps.301315783938-bf7130q8tsh5pobp1jjh71u7ns7ris01",
      },
    },
  },
  android: {
    package: "com.abhicyber.chatbuddy",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#6C5CE7",
    },
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#6C5CE7",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    // Load all environment variables here
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,

    GEMINI_API_KEY: process.env.GEMINI_API_KEY,

    EXPO_CLIENT_ID: process.env.EXPO_CLIENT_ID,
    ANDROID_CLIENT_ID: process.env.ANDROID_CLIENT_ID,
    IOS_CLIENT_ID: process.env.IOS_CLIENT_ID,
    WEB_CLIENT_ID: process.env.WEB_CLIENT_ID,

    MAX_CONVERSATION_LENGTH: process.env.MAX_CONVERSATION_LENGTH,
    DEFAULT_TEMPERATURE: process.env.DEFAULT_TEMPERATURE,
    MAX_TOKENS: process.env.MAX_TOKENS,

    eas: {
      projectId: "ed60fd80-cb0a-46db-92a9-f22ef3668888",
    },
  },
};
