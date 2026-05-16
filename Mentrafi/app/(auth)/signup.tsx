// app/(auth)/signup.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  TrendingUp,
  User,
} from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { API_URL } from "../../utils/api";
import { useTheme } from "../../context/ThemeContext";

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
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
  );
}

export default function Signup() {
  const { colors } = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateInput = () => {
    if (!formData.name.trim()) {
      setError("Full name is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInput()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      // Auto sign in after signup
      const loginRes = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginRes.json();
      await AsyncStorage.setItem("userToken", loginData.token);
      router.replace("/(tabs)/home");
    } catch (e) {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ backgroundColor: colors.bg }} className="flex-1">
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <LinearGradient
        colors={["#6d28d9", "#a21caf", "#ec4899", "#f97316"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />

      <View
        className="absolute rounded-full bg-orange-300/40"
        style={{ width: 280, height: 280, bottom: 30, right: -60 }}
      />
      <View
        className="absolute rounded-full bg-purple-900/20"
        style={{ width: 200, height: 200, bottom: 160, left: -60 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-5 pt-14 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View className="w-10 h-10 bg-white/25 rounded-full items-center justify-center">
                <Text className="text-white text-lg font-bold">⚡</Text>
              </View>
              <Text className="text-white text-lg font-semibold">MentraFi</Text>
            </View>
            <View className="bg-white/20 rounded-full px-4 py-1.5 flex-row items-center gap-1.5">
              <TrendingUp size={14} color="white" />
              <Text className="text-white text-sm font-semibold">+24.6%</Text>
            </View>
          </View>

          <View className="px-5 pt-5 pb-6">
            <Text className="text-white text-3xl font-bold leading-tight">
              Grow your wealth.
            </Text>
            <Text className="text-white/70 text-sm mt-1">
              Smart mutual fund investing, made simple.
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            }}
            className="mx-4 rounded-3xl px-5 py-6 shadow-xl border mb-8"
          >
            <Text style={{ color: colors.text }} className="text-xl font-bold">
              Create account
            </Text>
            <Text
              style={{ color: colors.textSecondary }}
              className="text-sm mt-0.5 mb-5"
            >
              Sign up to start investing
            </Text>

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

            {/* Full Name */}
            <Text
              style={{ color: colors.text }}
              className="text-sm font-semibold mb-1.5"
            >
              Full Name
            </Text>
            <View
              style={{
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              }}
              className="flex-row items-center rounded-xl px-3.5 py-3 mb-3 border"
            >
              <User size={18} color="#7c3aed" />
              <TextInput
                value={formData.name}
                onChangeText={(v) => {
                  setFormData({ ...formData, name: v });
                  if (error) setError("");
                }}
                placeholder="John Doe"
                placeholderTextColor={colors.placeholder}
                style={{ color: colors.text, paddingVertical: 0 }}
                className="flex-1 ml-2.5 text-sm"
              />
            </View>

            {/* Email */}
            <Text
              style={{ color: colors.text }}
              className="text-sm font-semibold mb-1.5"
            >
              Email
            </Text>
            <View
              style={{
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              }}
              className="flex-row items-center rounded-xl px-3.5 py-3 mb-3 border"
            >
              <Mail size={18} color="#7c3aed" />
              <TextInput
                value={formData.email}
                onChangeText={(v) => {
                  setFormData({ ...formData, email: v });
                  if (error) setError("");
                }}
                placeholder="you@example.com"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ color: colors.text, paddingVertical: 0 }}
                className="flex-1 ml-2.5 text-sm"
              />
            </View>

            {/* Password */}
            <Text
              style={{ color: colors.text }}
              className="text-sm font-semibold mb-1.5"
            >
              Password
            </Text>
            <View
              style={{
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              }}
              className="flex-row items-center rounded-xl px-3.5 py-3 mb-3 border"
            >
              <Lock size={18} color="#7c3aed" />
              <TextInput
                value={formData.password}
                onChangeText={(v) => {
                  setFormData({ ...formData, password: v });
                  if (error) setError("");
                }}
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showPassword}
                style={{ color: colors.text, paddingVertical: 0 }}
                className="flex-1 ml-2.5 text-sm"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color={colors.textSecondary} />
                ) : (
                  <Eye size={18} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text
              style={{ color: colors.text }}
              className="text-sm font-semibold mb-1.5"
            >
              Confirm Password
            </Text>
            <View
              style={{
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              }}
              className="flex-row items-center rounded-xl px-3.5 py-3 mb-5 border"
            >
              <Lock size={18} color="#7c3aed" />
              <TextInput
                value={formData.confirmPassword}
                onChangeText={(v) => {
                  setFormData({ ...formData, confirmPassword: v });
                  if (error) setError("");
                }}
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showConfirmPassword}
                style={{ color: colors.text, paddingVertical: 0 }}
                className="flex-1 ml-2.5 text-sm"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} color={colors.textSecondary} />
                ) : (
                  <Eye size={18} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={loading}
            >
              <LinearGradient
                colors={["#7c3aed", "#9333ea", "#f97316"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 14 }}
                className="py-4 flex-row items-center justify-center gap-2"
              >
                <Text className="text-white text-base font-semibold">
                  {loading ? "Creating account..." : "Create account securely"}
                </Text>
                {!loading && (
                  <Text className="text-white font-bold text-base">→</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

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

            <View className="flex-row gap-3">
              <TouchableOpacity
                style={{
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.inputBg,
                }}
                className="flex-1 py-3 border rounded-2xl flex-row items-center justify-center gap-2"
                activeOpacity={0.7}
              >
                <Phone size={18} color="#f97316" />
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-medium"
                >
                  Phone
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.inputBg,
                }}
                className="flex-1 py-3 border rounded-2xl flex-row items-center justify-center gap-2"
                activeOpacity={0.7}
              >
                <GoogleIcon />
                <Text
                  style={{ color: colors.text }}
                  className="text-sm font-medium"
                >
                  Google
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-5">
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text className="text-violet-600 text-sm font-semibold">
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="h-4" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}