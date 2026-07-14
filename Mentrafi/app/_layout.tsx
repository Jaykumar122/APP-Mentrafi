import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ThemeProvider } from "../context/ThemeContext";
import "../global.css";

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check both auth status and onboarding status
    Promise.all([
      AsyncStorage.getItem("userToken"),
      AsyncStorage.getItem("hasSeenOnboarding"),
    ]).then(([token, onboarding]) => {
      setIsLoggedIn(!!token);
      setHasSeenOnboarding(!!onboarding);
    });
  }, []);

  useEffect(() => {
    // Wait for both checks to complete
    if (isLoggedIn === null || hasSeenOnboarding === null) return;

    if (isLoggedIn) {
      // User is logged in → go to home
      router.replace("/(tabs)/home");
    } else if (!hasSeenOnboarding) {
      // User not logged in AND hasn't seen onboarding → show onboarding
      router.replace("/onboarding" as any);
    } else {
      // User not logged in BUT has seen onboarding → go to auth
      router.replace("/(auth)" as any);
    }
  }, [isLoggedIn, hasSeenOnboarding, router]);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
