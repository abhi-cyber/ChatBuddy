import {DarkTheme, DefaultTheme, ThemeProvider} from "@react-navigation/native";
import {useFonts} from "expo-font";
import {Stack} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {StatusBar} from "expo-status-bar";
import {useEffect} from "react";
import "react-native-reanimated";
import {AuthProvider} from "@/src/context/AuthContext";
import {useColorScheme} from "@/hooks/useColorScheme";
import {Colors} from "@/constants/Colors";
import {SafeAreaProvider} from "react-native-safe-area-context";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create custom theme with our color palette
const createCustomTheme = (
  baseTheme: typeof DarkTheme | typeof DefaultTheme,
  colors: typeof Colors.light
) => {
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.tint,
      background: colors.background,
      card: colors.cardBackground,
      text: colors.text,
      border: colors.lightGray,
      notification: colors.secondaryColor,
    },
  };
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";

  // Create custom theme based on color scheme
  const customTheme = createCustomTheme(
    colorScheme === "dark" ? DarkTheme : DefaultTheme,
    Colors[theme]
  );

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={customTheme}>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: Colors[theme].background,
              },
              animation: "slide_from_right",
            }}>
            <Stack.Screen name="index" options={{headerShown: false}} />
            <Stack.Screen name="login" options={{headerShown: false}} />
            <Stack.Screen name="signup" options={{headerShown: false}} />
            <Stack.Screen name="(tabs)" options={{headerShown: false}} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
