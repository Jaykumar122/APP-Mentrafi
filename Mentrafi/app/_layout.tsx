import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ThemeProvider } from "../context/ThemeContext";
import "../global.css";

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem("userToken").then((token) => {
      setIsLoggedIn(!!token);
    });
  }, []);

  useEffect(() => {
    if (isLoggedIn === null) return;

    if (isLoggedIn) {
      router.replace("/(tabs)/home");
    } else {
      router.replace("/(tabs)/");
    }
  }, [isLoggedIn]);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
