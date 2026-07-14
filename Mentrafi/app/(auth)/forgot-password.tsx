import { router } from "expo-router";
import { ArrowLeft, CheckCircle, Eye, EyeOff, Mail } from "lucide-react-native";
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
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
} from "react-native-reanimated";

type Step = "email" | "otp" | "password" | "success";

const C = {
  background: "#0d1b2a",
  accent: "#b8943a",
  accentGlow: "rgba(184,148,58,0.15)",
  surface: "#f5f6f8",
  textPrimary: "#0d1b2a",
  textMuted: "#6b7280",
  border: "rgba(13,27,42,0.1)",
  white40: "rgba(255,255,255,0.40)",
  white55: "rgba(255,255,255,0.55)",
  white18: "rgba(255,255,255,0.18)",
  error: "#dc2626",
  errorBg: "#fee2e2",
  success: "#22c55e",
};

const titleFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: undefined,
});

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
      {/* Radial glow */}
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
      {/* Large gold circle */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -24,
          right: -24,
          width: 144,
          height: 144,
          borderRadius: 72,
          backgroundColor: C.accent,
          opacity: 0.88,
        }}
      />
      {/* Ghost circle */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 180,
          right: -64,
          width: 168,
          height: 168,
          borderRadius: 84,
          backgroundColor: "rgba(255,255,255,0.04)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      />
      {/* Gold-tinted circle */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 220,
          left: -52,
          width: 136,
          height: 136,
          borderRadius: 68,
          backgroundColor: C.accent,
          opacity: 0.08,
        }}
      />
      {/* Ring */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 140,
          left: -40,
          width: 108,
          height: 108,
          borderRadius: 54,
          borderWidth: 1,
          borderColor: "rgba(184,148,58,0.14)",
        }}
      />
    </>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  autoCapitalize?: "none" | "words" | "sentences";
  secureTextEntry?: boolean;
  rightElement?: React.ReactNode;
  error?: string;
  maxLength?: number;
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  isFocused,
  onFocus,
  onBlur,
  keyboardType = "default",
  autoCapitalize = "sentences",
  secureTextEntry = false,
  rightElement,
  error,
  maxLength,
}: InputFieldProps) {
  return (
    <View style={{ marginBottom: 16 }}>
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
          minHeight: 52,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: error ? C.error : isFocused ? C.accent : C.border,
          backgroundColor: C.surface,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View style={{ marginRight: 10 }}>{icon}</View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.textMuted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          onFocus={onFocus}
          onBlur={onBlur}
          maxLength={maxLength}
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

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>("email");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const f = (key: string) => ({
    isFocused: focused === key,
    onFocus: () => setFocused(key),
    onBlur: () => setFocused(null),
  });

  const handleSendOTP = async () => {
    const e: Record<string, string> = {};
    if (!emailOrPhone.trim()) {
      e.emailOrPhone = "Email or mobile is required";
    } else if (
      emailOrPhone.includes("@") &&
      !/\S+@\S+\.\S+/.test(emailOrPhone)
    ) {
      e.emailOrPhone = "Enter a valid email address";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    const e: Record<string, string> = {};
    if (!otp.trim()) {
      e.otp = "OTP is required";
    } else if (otp.length !== 6) {
      e.otp = "OTP must be 6 digits";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("password");
    }, 1500);
  };

  const handleResetPassword = async () => {
    const e: Record<string, string> = {};
    if (!newPassword.trim()) {
      e.newPassword = "Password is required";
    } else if (newPassword.length < 6) {
      e.newPassword = "Minimum 6 characters";
    }
    if (!confirmPassword.trim()) {
      e.confirmPassword = "Please confirm password";
    } else if (confirmPassword !== newPassword) {
      e.confirmPassword = "Passwords do not match";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
      setTimeout(() => {
        router.replace("/(auth)");
      }, 2000);
    }, 1500);
  };

  const handleBack = () => {
    if (step === "email") {
      router.back();
    } else if (step === "otp") {
      setStep("email");
      setOtp("");
      setErrors({});
    } else if (step === "password") {
      setStep("otp");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    }
  };

  const getHeadline = () => {
    switch (step) {
      case "email":
        return "Forgot\npassword?";
      case "otp":
        return "Verify\nyour identity.";
      case "password":
        return "Create new\npassword.";
      case "success":
        return "Password\nreset!";
    }
  };

  const getSubtext = () => {
    switch (step) {
      case "email":
        return "Enter your email or mobile to receive a verification code.";
      case "otp":
        return `We sent a 6-digit code to ${emailOrPhone}. Enter it below.`;
      case "password":
        return "Choose a strong password to secure your account.";
      case "success":
        return "Your password has been reset successfully. Redirecting to login...";
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={{ flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0 }}>
        <Decorations />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 48 }}
          >
            {/* HEADER */}
            <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, zIndex: 5 }}>
              {/* Back button */}
              {step !== "success" && (
                <TouchableOpacity
                  onPress={handleBack}
                  activeOpacity={0.7}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 24,
                    alignSelf: "flex-start",
                  }}
                >
                  <ArrowLeft size={18} color="rgba(255,255,255,0.60)" />
                </TouchableOpacity>
              )}

              {/* Logo */}
              <View style={{ marginBottom: 32 }}>
                <BrandLogo />
              </View>

              {/* Headline */}
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
                {getHeadline()}
              </Text>
              <Text style={{ color: C.white40, fontSize: 15, lineHeight: 21 }}>
                {getSubtext()}
              </Text>
            </View>

            {/* FORM CARD */}
            <View style={{ paddingHorizontal: 16, zIndex: 5 }}>
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 28,
                  padding: 22,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 16 },
                  shadowOpacity: 0.28,
                  shadowRadius: 28,
                  elevation: 18,
                  marginBottom: 16,
                }}
              >
                {/* STEP 1: Email/Phone */}
                {step === "email" && (
                  <Animated.View
                    entering={FadeInDown.duration(300).springify()}
                    layout={LinearTransition.duration(300)}
                  >
                    <InputField
                      label="Email / Mobile"
                      value={emailOrPhone}
                      onChangeText={(text) => {
                        setEmailOrPhone(text);
                        if (errors.emailOrPhone) setErrors({});
                      }}
                      placeholder="you@email.com"
                      icon={<Mail size={16} color={focused === "email" ? C.accent : C.textMuted} />}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      error={errors.emailOrPhone}
                      {...f("email")}
                    />

                    <TouchableOpacity
                      onPress={handleSendOTP}
                      activeOpacity={0.85}
                      disabled={loading}
                      style={{
                        backgroundColor: emailOrPhone.trim() ? C.background : "rgba(13,27,42,0.30)",
                        borderRadius: 16,
                        paddingVertical: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
                        {loading ? "Sending code..." : "Send verification code"}
                      </Text>
                      {!loading && <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>›</Text>}
                    </TouchableOpacity>
                  </Animated.View>
                )}

                {/* STEP 2: OTP */}
                {step === "otp" && (
                  <Animated.View
                    entering={FadeInDown.duration(300).springify()}
                    layout={LinearTransition.duration(300)}
                  >
                    <InputField
                      label="Enter OTP"
                      value={otp}
                      onChangeText={(text) => {
                        setOtp(text.replace(/[^0-9]/g, ""));
                        if (errors.otp) setErrors({});
                      }}
                      placeholder="000000"
                      icon={<Mail size={16} color={focused === "otp" ? C.accent : C.textMuted} />}
                      keyboardType="numeric"
                      autoCapitalize="none"
                      maxLength={6}
                      error={errors.otp}
                      {...f("otp")}
                    />

                    <TouchableOpacity activeOpacity={0.7} style={{ marginBottom: 20 }}>
                      <Text
                        style={{
                          color: C.accent,
                          fontSize: 13,
                          fontWeight: "600",
                          textAlign: "center",
                        }}
                      >
                        Did not receive? Resend code
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleVerifyOTP}
                      activeOpacity={0.85}
                      disabled={loading}
                      style={{
                        backgroundColor: otp.length === 6 ? C.background : "rgba(13,27,42,0.30)",
                        borderRadius: 16,
                        paddingVertical: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
                        {loading ? "Verifying..." : "Verify code"}
                      </Text>
                      {!loading && <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>›</Text>}
                    </TouchableOpacity>
                  </Animated.View>
                )}

                {/* STEP 3: New Password */}
                {step === "password" && (
                  <Animated.View
                    entering={FadeInDown.duration(300).springify()}
                    layout={LinearTransition.duration(300)}
                  >
                    <InputField
                      label="New Password"
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
                        if (errors.newPassword) setErrors({});
                      }}
                      placeholder="••••••••"
                      icon={<Mail size={16} color={focused === "newPassword" ? C.accent : C.textMuted} />}
                      secureTextEntry={!showPassword}
                      error={errors.newPassword}
                      rightElement={
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
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
                      {...f("newPassword")}
                    />

                    <InputField
                      label="Confirm Password"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword) setErrors({});
                      }}
                      placeholder="••••••••"
                      icon={<Mail size={16} color={focused === "confirmPassword" ? C.accent : C.textMuted} />}
                      secureTextEntry={!showConfirmPassword}
                      error={errors.confirmPassword}
                      rightElement={
                        <TouchableOpacity
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          activeOpacity={0.7}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} color="#94a3b8" />
                          ) : (
                            <Eye size={18} color="#94a3b8" />
                          )}
                        </TouchableOpacity>
                      }
                      {...f("confirmPassword")}
                    />

                    <TouchableOpacity
                      onPress={handleResetPassword}
                      activeOpacity={0.85}
                      disabled={loading}
                      style={{
                        backgroundColor:
                          newPassword.length >= 6 && confirmPassword === newPassword
                            ? C.background
                            : "rgba(13,27,42,0.30)",
                        borderRadius: 16,
                        paddingVertical: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
                        {loading ? "Resetting password..." : "Reset password"}
                      </Text>
                      {!loading && <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>›</Text>}
                    </TouchableOpacity>
                  </Animated.View>
                )}

                {/* STEP 4: Success */}
                {step === "success" && (
                  <Animated.View
                    entering={FadeIn.duration(400)}
                    style={{ alignItems: "center", paddingVertical: 32 }}
                  >
                    <View
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: "rgba(34,197,94,0.15)",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 24,
                      }}
                    >
                      <CheckCircle size={48} color={C.success} />
                    </View>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "700",
                        color: C.textPrimary,
                        marginBottom: 8,
                        textAlign: "center",
                      }}
                    >
                      Password Reset!
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: C.textMuted,
                        textAlign: "center",
                        lineHeight: 20,
                      }}
                    >
                      Your password has been reset successfully.{"\n"}Redirecting to login...
                    </Text>
                  </Animated.View>
                )}
              </View>

              {/* Legal */}
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.18)",
                  lineHeight: 16,
                  paddingHorizontal: 12,
                }}
              >
                SEBI Reg. No. MF/021/05 · Investments subject to market risks.
                Please read all scheme documents carefully.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
