import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Eye, EyeOff, TrendingUp } from "lucide-react-native";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { API_URL } from "../../utils/api";
import { AnimatedTabToggle } from "../../components/AnimatedTabToggle";

const C = {
  background: "#0d1b2a",
  accent: "#b8943a",
  accentGlow: "rgba(184,148,58,0.15)",
  surface: "#f5f6f8",
  bodyBg: "#f0f1f3",
  textPrimary: "#0d1b2a",
  textMuted: "#6b7280",
  border: "rgba(13,27,42,0.1)",
  glass: "rgba(255,255,255,0.08)",
  inputBg: "#f0f1f3",
  white40: "rgba(255,255,255,0.40)",
  white55: "rgba(255,255,255,0.55)",
  white18: "rgba(255,255,255,0.18)",
  error: "#dc2626",
  errorBg: "#fee2e2",
};

const titleFont = Platform.select({ ios: "Georgia", android: "serif", default: undefined });

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
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

function AppleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={C.textPrimary}>
      <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </Svg>
  );
}

function BrandLogo() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: C.accent,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(184,148,58,0.08)",
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            borderWidth: 1.5,
            borderColor: C.accent,
          }}
        />
      </View>
      <Text
        style={{
          color: "#fff",
          fontSize: 18,
          fontWeight: "600",
          fontFamily: titleFont,
        }}
      >
        Mentrafi
      </Text>
    </View>
  );
}

function Decorations() {
  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -72,
          right: -72,
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: C.accentGlow,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -20,
          right: -22,
          width: 174,
          height: 174,
          borderRadius: 87,
          backgroundColor: C.accent,
          opacity: 0.96,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 82,
          right: 18,
          zIndex: 5,
          backgroundColor: "rgba(255,255,255,0.18)",
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 9,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.24)",
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.20)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrendingUp size={12} color="#fff" />
        </View>
        <View>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
            +26.2%
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.68)", fontSize: 9 }}>
            1Y Return
          </Text>
        </View>
      </View>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 214,
          right: -72,
          width: 188,
          height: 188,
          borderRadius: 94,
          backgroundColor: "rgba(255,255,255,0.03)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.07)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 156,
          left: 46,
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: C.accent,
          opacity: 0.9,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 220,
          left: -52,
          width: 164,
          height: 164,
          borderRadius: 82,
          borderWidth: 1,
          borderColor: "rgba(184,148,58,0.09)",
          backgroundColor: "rgba(184,148,58,0.02)",
        }}
      />
    </>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "words" | "sentences";
  rightElement?: ReactNode;
  error?: string;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  rightElement,
  error,
}: FieldProps) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: C.textMuted,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          minHeight: 44,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: error ? C.error : C.border,
          backgroundColor: C.inputBg,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8b94a3"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={{
            flex: 1,
            paddingVertical: Platform.OS === "ios" ? 15 : 12,
            fontSize: 14,
            color: C.textPrimary,
          }}
        />
        {rightElement}
      </View>
      {error ? (
        <Text style={{ color: C.error, fontSize: 11, marginTop: 5, marginLeft: 2 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export default function Signup() {
  const activeTab = "signup";
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  const isValid = useMemo(() => {
    return fullName.trim().length > 0 && contact.trim().length > 0 && password.length >= 6;
  }, [contact, fullName, password]);

  useEffect(() => {
    headerAnim.setValue(0);
    cardAnim.setValue(0);
    footerAnim.setValue(0);

    Animated.stagger(90, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(footerAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardAnim, footerAnim, headerAnim]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,}$/;

    if (!fullName.trim()) {
      nextErrors.fullName = "Full name is required";
    }

    if (!contact.trim()) {
      nextErrors.contact = "Mobile or email is required";
    } else if (!emailRegex.test(contact.trim()) && !phoneRegex.test(contact.trim())) {
      nextErrors.contact = "Enter a valid mobile number or email";
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const identifier = contact.trim();

      const signupRes = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: identifier,
          password,
        }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        setErrors({ form: signupData.error || "Signup failed" });
        setLoading(false);
        return;
      }

      const signinRes = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: identifier,
          password,
        }),
      });

      const signinData = await signinRes.json();

      if (!signinRes.ok) {
        setErrors({ form: signinData.error || "Sign in failed after signup" });
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem("userToken", signinData.token);
      await AsyncStorage.setItem("userName", signinData.user.name);
      router.replace("/(tabs)/home");
    } catch {
      setErrors({ form: "Network error. Check your connection." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <StatusBar barStyle="light-content" backgroundColor={C.background} />
      <SafeAreaView style={{ flex: 1 }}>
        <Decorations />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 34 }}
          >
            <Animated.View
              style={{
                paddingHorizontal: 24,
                paddingTop: 32,
                paddingBottom: 26,
                opacity: headerAnim,
                transform: [
                  {
                    translateY: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                ],
              }}
            >
              <View style={{ marginBottom: 36 }}>
                <BrandLogo />
              </View>

              <Text
                style={{
                  color: "#fff",
                  fontSize: 40,
                  lineHeight: 44,
                  fontWeight: "700",
                  fontFamily: titleFont,
                  marginBottom: 10,
                  maxWidth: 260,
                }}
              >
                {"Create your\naccount."}
              </Text>

              <Text style={{ color: C.white40, fontSize: 15, lineHeight: 21 }}>
                Start investing in under 3 minutes.
              </Text>
            </Animated.View>

            <Animated.View
              style={{
                paddingHorizontal: 16,
                opacity: cardAnim,
                transform: [
                  {
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [28, 0],
                    }),
                  },
                  {
                    scale: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.985, 1],
                    }),
                  },
                ],
              }}
            >
              <View
                style={{
                  backgroundColor: C.surface,
                  borderRadius: 30,
                  padding: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 16 },
                  shadowOpacity: 0.22,
                  shadowRadius: 24,
                  elevation: 14,
                }}
              >
                <AnimatedTabToggle activeTab={activeTab} />

                {errors.form ? (
                  <View
                    style={{
                      backgroundColor: C.errorBg,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      marginBottom: 16,
                    }}
                  >
                    <Text style={{ color: C.error, fontSize: 13 }}>{errors.form}</Text>
                  </View>
                ) : null}

                <Field
                  label="Full Name"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (errors.fullName || errors.form) {
                      setErrors((prev) => ({ ...prev, fullName: "", form: "" }));
                    }
                  }}
                  placeholder="Singh"
                  autoCapitalize="words"
                  error={errors.fullName}
                />

                <Field
                  label="Mobile / Email"
                  value={contact}
                  onChangeText={(text) => {
                    setContact(text);
                    if (errors.contact || errors.form) {
                      setErrors((prev) => ({ ...prev, contact: "", form: "" }));
                    }
                  }}
                  placeholder="91 or you@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.contact}
                />

                <Field
                  label="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password || errors.form) {
                      setErrors((prev) => ({ ...prev, password: "", form: "" }));
                    }
                  }}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  error={errors.password}
                  rightElement={
                    <TouchableOpacity
                      onPress={() => setShowPassword((prev) => !prev)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color="#94a3b8" />
                      ) : (
                        <Eye size={18} color="#94a3b8" />
                      )}
                    </TouchableOpacity>
                  }
                />

                <TouchableOpacity
                  onPress={handleSubmit}
                  activeOpacity={isValid && !loading ? 0.88 : 1}
                  disabled={!isValid || loading}
                  style={{ marginTop: 4, marginBottom: 20 }}
                >
                  <View
                    style={{
                      backgroundColor: isValid ? C.background : "rgba(13,27,42,0.35)",
                      borderRadius: 16,
                      paddingVertical: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
                      {loading ? "Creating account..." : "Create Account"}
                    </Text>
                    {!loading ? (
                      <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>›</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
                  <Text style={{ color: C.textMuted, fontSize: 12 }}>or continue with</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      minHeight: 44,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: C.border,
                      backgroundColor: "#fff",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      gap: 8,
                    }}
                  >
                    <GoogleIcon />
                    <Text style={{ color: C.textPrimary, fontSize: 14, fontWeight: "500" }}>
                      Google
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      minHeight: 44,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: C.border,
                      backgroundColor: "#fff",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      gap: 8,
                    }}
                  >
                    <AppleIcon />
                    <Text style={{ color: C.textPrimary, fontSize: 14, fontWeight: "500" }}>
                      Apple
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>

            <Animated.View
              style={{
                alignItems: "center",
                marginTop: 18,
                paddingHorizontal: 24,
                opacity: footerAnim,
                transform: [
                  {
                    translateY: footerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [14, 0],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/login")}
                activeOpacity={0.7}
              >
                <Text style={{ color: C.white55, fontSize: 13 }}>
                  Already have an account? <Text style={{ color: C.accent, fontWeight: "700" }}>Log in</Text>
                </Text>
              </TouchableOpacity>

              <Text
                style={{
                  marginTop: 14,
                  textAlign: "center",
                  color: C.white18,
                  fontSize: 10,
                  lineHeight: 15,
                }}
              >
                SEBI Reg. No. MF/021/05 · Investments subject to market risks. Please read all
                scheme documents carefully.
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
