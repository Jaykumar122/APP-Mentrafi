// app/(auth)/login.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  PieChart,
  Sparkles,
  TrendingUp,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { API_URL } from "../../utils/api";
import { useTheme } from "../../context/ThemeContext";

export default function LoginScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateInput = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,}$/;
    if (!emailOrPhone.trim()) {
      setError("Email is required");
      return false;
    }
    if (!emailRegex.test(emailOrPhone) && !phoneRegex.test(emailOrPhone)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInput()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailOrPhone,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem("userToken", data.token);
      router.replace("/(tabs)/home");
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ backgroundColor: colors.bg }}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient top section */}
        <View className="relative h-[360px] overflow-hidden">
          <LinearGradient
            colors={["#7c3aed", "#d946ef", "#fb923c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheetAbs}
          />

          <View className="absolute -top-16 -right-12 w-56 h-56 rounded-full bg-yellow-300/40" />
          <View className="absolute top-20 -left-16 w-48 h-48 rounded-full bg-pink-400/50" />
          <View className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-cyan-300/40" />

          <BlurView
            intensity={30}
            tint={isDark ? "dark" : "light"}
            className="absolute top-20 right-6 rounded-2xl overflow-hidden border border-white/30"
            style={{ transform: [{ rotate: "6deg" }] }}
          >
            <View className="flex-row items-center gap-2 p-3 bg-white/20">
              <TrendingUp size={16} color="#fff" />
              <Text className="text-sm text-white">+24.6%</Text>
            </View>
          </BlurView>

          <BlurView
            intensity={30}
            tint={isDark ? "dark" : "light"}
            className="absolute top-44 left-6 rounded-2xl overflow-hidden border border-white/30"
            style={{ transform: [{ rotate: "-6deg" }] }}
          >
            <View className="flex-row items-center gap-2 p-3 bg-white/20">
              <PieChart size={16} color="#fff" />
              <Text className="text-sm text-white">₹12.4L</Text>
            </View>
          </BlurView>

          <View className="pt-20 px-8">
            <View className="flex-row items-center gap-2 mb-6">
              <View className="w-10 h-10 rounded-xl bg-white/25 items-center justify-center border border-white/40">
                <Sparkles size={20} color="#fff" />
              </View>
              <Text className="text-white tracking-wide font-bold">
                MentraFi
              </Text>
            </View>
            <Text className="text-white text-[28px] leading-8 font-bold">
              Grow your wealth,{"\n"}one fund at a time.
            </Text>
            <Text className="text-white/80 mt-2 text-sm">
              Smart mutual fund investing, made simple.
            </Text>
          </View>
        </View>

        {/* Login card */}
        <View
          style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
          className="-mt-12 mx-4 rounded-3xl p-6 pb-8 border shadow-2xl mb-8"
        >
          <View className="mb-5">
            <Text style={{ color: colors.text }} className="text-xl font-bold">
              Welcome back
            </Text>
            <Text
              style={{ color: colors.textSecondary }}
              className="text-sm mt-1"
            >
              Sign in to continue investing
            </Text>
          </View>

          {error ? (
            <View
              style={{
                backgroundColor: colors.errorBg,
                borderColor: colors.error,
              }}
              className="mb-4 border rounded-lg p-3"
            >
              <Text style={{ color: colors.errorText }} className="text-sm">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Email */}
          <View className="mb-4">
            <Text
              style={{ color: colors.text }}
              className="text-sm font-semibold mb-1.5"
            >
              Email
            </Text>
            <View className="relative justify-center">
              <View className="absolute left-3 z-10">
                <Mail size={16} color="#8b5cf6" />
              </View>
              <TextInput
                value={emailOrPhone}
                onChangeText={(t) => {
                  setEmailOrPhone(t);
                  if (error) setError("");
                }}
                placeholder="you@example.com"
                placeholderTextColor={colors.placeholder}
                keyboardType="default"
                autoCapitalize="none"
                editable={!loading}
                style={{
                  color: colors.text,
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                }}
                className="pl-10 pr-3 py-3 rounded-xl border text-sm"
              />
            </View>
          </View>

          {/* Password */}
          <View className="mb-4">
            <Text
              style={{ color: colors.text }}
              className="text-sm font-semibold mb-1.5"
            >
              Password
            </Text>
            <View className="relative justify-center">
              <View className="absolute left-3 z-10">
                <Lock size={16} color="#d946ef" />
              </View>
              <TextInput
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (error) setError("");
                }}
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showPassword}
                editable={!loading}
                style={{
                  color: colors.text,
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                }}
                className="pl-10 pr-10 py-3 rounded-xl border text-sm"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((s) => !s)}
                disabled={loading}
                className="absolute right-3 z-10"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showPassword ? (
                  <EyeOff size={16} color={colors.textSecondary} />
                ) : (
                  <Eye size={16} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember / Forgot */}
          <View className="flex-row items-center justify-between pt-1 mb-4">
            <TouchableOpacity
              onPress={() => setRemember((r) => !r)}
              disabled={loading}
              className="flex-row items-center gap-2"
              activeOpacity={0.7}
            >
              <View
                style={{
                  backgroundColor: remember ? "#7c3aed" : "transparent",
                  borderColor: remember ? "#7c3aed" : colors.inputBorder,
                }}
                className="w-4 h-4 rounded border items-center justify-center"
              >
                {remember && <Check size={12} color="#fff" />}
              </View>
              <Text style={{ color: colors.textSecondary }} className="text-xs">
                Remember me
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgot-password")}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text className="text-xs text-fuchsia-600">Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign in button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
            className="rounded-xl overflow-hidden"
          >
            <LinearGradient
              colors={["#7c3aed", "#d946ef", "#fb923c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-4 py-3.5 flex-row items-center justify-center gap-2"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text className="text-white font-semibold">
                    Sign in securely
                  </Text>
                  <ArrowRight size={16} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center gap-3 my-4">
            <View
              style={{ backgroundColor: colors.divider }}
              className="flex-1 h-px"
            />
            <Text style={{ color: colors.textSecondary }} className="text-xs">
              or continue with
            </Text>
            <View
              style={{ backgroundColor: colors.divider }}
              className="flex-1 h-px"
            />
          </View>

          {/* Social */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              disabled={loading}
              activeOpacity={0.7}
              style={{
                borderColor: colors.inputBorder,
                backgroundColor: colors.inputBg,
              }}
              className="flex-1 py-2.5 rounded-xl border flex-row items-center justify-center gap-2"
            >
              <Phone size={16} color="#f97316" />
              <Text style={{ color: colors.text }} className="text-sm">
                Phone
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={loading}
              activeOpacity={0.7}
              style={{
                borderColor: colors.inputBorder,
                backgroundColor: colors.inputBg,
              }}
              className="flex-1 py-2.5 rounded-xl border flex-row items-center justify-center gap-2"
            >
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <Path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <Path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <Path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </Svg>
              <Text style={{ color: colors.text }} className="text-sm">
                Google
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/(auth)/signup")}
          >
            <Text
              style={{ color: colors.textSecondary }}
              className="text-center text-xs mt-5 mb-2"
            >
              New to MentraFi?{" "}
              <Text className="text-violet-600 font-semibold">
                Create account
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-4" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const StyleSheetAbs = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};