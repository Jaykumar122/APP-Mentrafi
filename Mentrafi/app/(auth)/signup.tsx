import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgGrad,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../../utils/api";
import {
  AuthBackground,
  C,
  cardTilt,
  depthShadow,
  ErrorBanner,
  FieldInput,
  GlowBackdrop,
} from "./login";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 44;

// ─────────────────────────────────────────────
// BADGE ICON — isometric extruded ID badge with a person + plus,
// built the same way as LockIcon (front/top/side faces + sheen)
// ─────────────────────────────────────────────
function BadgeIcon() {
  return (
    <Svg width="130" height="130" viewBox="0 0 150 150">
      <Defs>
        <SvgGrad id="bgBody" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#ff9dbc" />
          <Stop offset="100%" stopColor={C.pink} />
        </SvgGrad>
        <SvgGrad id="bgBodySide" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#b23360" />
          <Stop offset="100%" stopColor="#7a1f42" />
        </SvgGrad>
        <SvgGrad id="bgTop" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
        </SvgGrad>
        <SvgGrad id="bgClip" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#c9b3ff" />
          <Stop offset="100%" stopColor={C.violet} />
        </SvgGrad>
      </Defs>

      {/* lanyard clip — same tube treatment as the lock's shackle */}
      <Path
        d="M68 58 V44 a7 7 0 0 1 14 0 V58"
        stroke="#4c2794"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        opacity="0.55"
      />
      <Path
        d="M68 56 V44 a7 7 0 0 1 14 0 V56"
        stroke="url(#bgClip)"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />

      {/* badge body — isometric extruded card */}
      <Path d="M108,60 L108,118 L120,111 L120,53 Z" fill="url(#bgBodySide)" />
      <Path d="M32,60 L108,60 L120,53 L44,53 Z" fill="url(#bgTop)" />
      <Path d="M32,60 L32,118 L108,118 L108,60 Z" fill="url(#bgBody)" />

      {/* person silhouette */}
      <Circle cx="62" cy="82" r="9" fill="#7a1f42" />
      <Path d="M48 106 a14 14 0 0 1 28 0 Z" fill="#7a1f42" />

      {/* plus badge */}
      <Line x1="90" y1="82" x2="90" y2="94" stroke="#7a1f42" strokeWidth="4" strokeLinecap="round" />
      <Line x1="84" y1="88" x2="96" y2="88" stroke="#7a1f42" strokeWidth="4" strokeLinecap="round" />

      {/* highlight sheen */}
      <Path d="M36 62 L64 62 L58 56 L42 56 Z" fill="#fff" opacity="0.35" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// SIGNUP SCREEN
// ─────────────────────────────────────────────
export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,}$/;

  const validate = () => {
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return false;
    }
    const identifier = email.trim();
    if (!identifier) {
      setError("Please enter your mobile number or email.");
      return false;
    }
    if (!emailRegex.test(identifier) && !phoneRegex.test(identifier)) {
      setError("Enter a valid mobile number or email.");
      return false;
    }
    if (!password) {
      setError("Please enter a password.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (confirmPassword !== password) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  async function handleSignup() {
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      // signup only creates the user — sign in right after to get a
      // session and land the user straight on the home screen. Both
      // calls go straight to API_URL since utils/api.ts only exports
      // that constant.
      const signupRes = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        setError(signupData.error || "Signup failed");
        setLoading(false);
        return;
      }

      const signinRes = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const signinData = await signinRes.json();

      if (!signinRes.ok) {
        setError(signinData.error || "Sign in failed");
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem("userToken", signinData.token);
      if (signinData.user?.name) {
        await AsyncStorage.setItem("userName", signinData.user.name);
      }
      // Mark pending profile setup so the root layout routes correctly
      await AsyncStorage.setItem("pendingProfileSetup", "true");
      router.replace("/profile-setup" as any);
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bgBottom }}>
      <AuthBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              width: CARD_WIDTH,
              ...depthShadow("lg"),
              ...cardTilt,
            }}
          >
            <LinearGradient
              colors={[C.card, "#050508"]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={{
                borderRadius: 36,
                borderWidth: 1,
                borderColor: C.cardEdge,
                overflow: "hidden",
                paddingBottom: 30,
              }}
            >
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: -40,
                  left: -60,
                  width: 140,
                  height: 700,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  transform: [{ rotate: "18deg" }],
                }}
              />

              <View style={{ height: 190, alignItems: "center", justifyContent: "flex-end" }}>
                <View style={{ position: "absolute", bottom: 0 }}>
                  <GlowBackdrop from={C.pink} to={C.violet} />
                </View>
                <View style={{ marginBottom: 26, ...depthShadow("md") }}>
                  <BadgeIcon />
                </View>
              </View>

              <View style={{ paddingHorizontal: 26 }}>
                <Text
                  style={{
                    color: C.pink,
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 1.2,
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  GET STARTED
                </Text>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 23,
                    lineHeight: 29,
                    fontWeight: "700",
                    marginBottom: 6,
                    textAlign: "center",
                  }}
                >
                  Create your account
                </Text>
                <Text
                  style={{
                    color: C.textMuted,
                    fontSize: 12.5,
                    lineHeight: 19,
                    textAlign: "center",
                    marginBottom: 26,
                  }}
                >
                  Start investing in under 3 minutes.
                </Text>

                <ErrorBanner message={error} />

                <FieldInput
                  icon={<User size={18} color={C.textMuted} />}
                  placeholder="Full name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
                <FieldInput
                  icon={<Mail size={18} color={C.textMuted} />}
                  placeholder="Mobile / Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
                <FieldInput
                  icon={<Lock size={18} color={C.textMuted} />}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secure={hidePassword}
                  toggleSecure={() => setHidePassword((v) => !v)}
                />
                <FieldInput
                  icon={<Lock size={18} color={C.textMuted} />}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secure={hideConfirmPassword}
                  toggleSecure={() => setHideConfirmPassword((v) => !v)}
                />

                <TouchableOpacity
                  onPress={handleSignup}
                  activeOpacity={0.88}
                  disabled={loading}
                  style={{ ...depthShadow("md"), opacity: loading ? 0.75 : 1, marginTop: 8 }}
                >
                  <LinearGradient
                    colors={[C.pink, C.violet]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      height: 54,
                      borderRadius: 27,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      gap: 8,
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
                          Create Account
                        </Text>
                        <ArrowRight size={17} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 22 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
                  <Text style={{ color: C.textFaint, fontSize: 11, marginHorizontal: 10 }}>
                    OR CONTINUE WITH
                  </Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
                </View>

                <View style={{ flexDirection: "row", gap: 12, marginBottom: 22 }}>
                  {["Google", "Apple"].map((label) => (
                    <TouchableOpacity
                      key={label}
                      activeOpacity={0.8}
                      style={{
                        flex: 1,
                        height: 48,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: C.inputBorder,
                        backgroundColor: C.input,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ flexDirection: "row", justifyContent: "center" }}>
                  <Text style={{ color: C.textMuted, fontSize: 12.5 }}>
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace("/(auth)/login")}>
                    <Text style={{ color: C.cyan, fontSize: 12.5, fontWeight: "700" }}>
                      Log in
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={{
                    marginTop: 18,
                    textAlign: "center",
                    color: C.textFaint,
                    fontSize: 10,
                    lineHeight: 15,
                  }}
                >
                  SEBI Reg. No. MF/021/05 · Investments subject to market risks. Please read all
                  scheme documents carefully.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}