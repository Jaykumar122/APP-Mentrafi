import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const C = {
  background: "#0d1b2a",
  textMuted: "#6b7280",
};

type Props = {
  activeTab: "login" | "signup";
};

export function AnimatedTabToggle({ activeTab }: Props) {
  const router = useRouter();
  const [tabWidth, setTabWidth] = useState(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (tabWidth > 0) {
      translateX.value = withSpring(activeTab === "login" ? 0 : tabWidth, {
        damping: 20,
        stiffness: 180,
        mass: 0.8,
      });
    }
  }, [activeTab, tabWidth, translateX]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    const calculatedTabWidth = (width - 8) / 2; // subtract padding (4px * 2), divide by 2 tabs
    setTabWidth(calculatedTabWidth);
    
    // Set initial position
    if (activeTab === "signup") {
      translateX.value = calculatedTabWidth;
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View
      onLayout={handleLayout}
      style={{
        flexDirection: "row",
        backgroundColor: "#eaedf1",
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
        position: "relative",
      }}
    >
      {/* Animated background pill */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 4,
            left: 4,
            width: tabWidth,
            height: "100%",
            marginVertical: 4,
            backgroundColor: C.background,
            borderRadius: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
          },
          animatedStyle,
        ]}
      />

      {/* Log In button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.replace("/(auth)/login")}
        style={{
          flex: 1,
          borderRadius: 12,
          paddingVertical: 11,
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <Animated.Text
          style={{
            color: activeTab === "login" ? "#fff" : C.textMuted,
            fontWeight: "700",
            fontSize: 14,
          }}
        >
          Log In
        </Animated.Text>
      </TouchableOpacity>

      {/* Sign Up button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.replace("/(auth)/signup")}
        style={{
          flex: 1,
          borderRadius: 12,
          paddingVertical: 11,
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <Animated.Text
          style={{
            color: activeTab === "signup" ? "#fff" : C.textMuted,
            fontWeight: "700",
            fontSize: 14,
          }}
        >
          Sign Up
        </Animated.Text>
      </TouchableOpacity>
    </View>
  );
}
