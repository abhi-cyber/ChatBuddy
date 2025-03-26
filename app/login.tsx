import React, {useEffect} from "react";
import {Redirect, useRouter} from "expo-router";
import LoginScreen from "@/src/screens/LoginScreen";
import {useAuth} from "@/src/context/AuthContext";

export default function LoginRoute() {
  const {user, isLoading} = useAuth();
  const router = useRouter();

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

  // Otherwise show login screen
  return <LoginScreen />;
}
