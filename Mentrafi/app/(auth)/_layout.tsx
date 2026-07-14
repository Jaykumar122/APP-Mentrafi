import { Stack } from "expo-router";
import "../../global.css";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 200,
        contentStyle: { backgroundColor: "#0d1b2a" },
      }}
    />
  );
}
