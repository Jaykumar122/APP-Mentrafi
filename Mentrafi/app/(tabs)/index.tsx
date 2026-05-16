import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function App() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={{ backgroundColor: colors.bg }} className="flex-1">
      <LinearGradient
        colors={["#7c3aed", "#d946ef", "#fb923c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 items-center justify-center px-8"
      >
        {/* Logo */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-white/20 rounded-3xl items-center justify-center mb-4 border border-white/30">
            <Text className="text-4xl">⚡</Text>
          </View>
          <Text className="text-white text-3xl font-bold tracking-wide">
            MentraFi
          </Text>
          <Text className="text-white/70 text-sm mt-2 text-center">
            Smart mutual fund investing,{"\n"}made simple.
          </Text>
        </View>

        {/* CTA buttons */}
        <View className="w-full gap-3">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/(auth)/login")}
            className="bg-white rounded-2xl py-4 items-center"
          >
            <Text className="text-purple-700 font-bold text-base">Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/(auth)/signup")}
            className="bg-white/20 border border-white/40 rounded-2xl py-4 items-center"
          >
            <Text className="text-white font-bold text-base">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-white/50 text-xs mt-8 text-center">
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </LinearGradient>
    </View>
  );
}