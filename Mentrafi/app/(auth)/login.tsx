import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../../utils/api";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 44;

// ─────────────────────────────────────────────
// COLORS — shared palette, kept identical across login & signup
// ─────────────────────────────────────────────
export const C = {
  bgTop: "#1c1547",
  bgMid: "#120c33",
  bgBottom: "#050310",
  card: "#0a0a14",
  cardEdge: "rgba(255,255,255,0.06)",
  input: "rgba(255,255,255,0.05)",
  inputBorder: "rgba(255,255,255,0.09)",
  pink: "#ff4f81",
  magenta: "#c239b3",
  violet: "#7b3ff2",
  cyan: "#33d9e8",
  textMuted: "rgba(255,255,255,0.45)",
  textFaint: "rgba(255,255,255,0.28)",
};

export const depthShadow = (level: "sm" | "md" | "lg" = "md") => {
  const map = {
    sm: { h: 4, r: 10, op: 0.3, elev: 5 },
    md: { h: 12, r: 24, op: 0.4, elev: 12 },
    lg: { h: 26, r: 44, op: 0.55, elev: 22 },
  }[level];
  return {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: map.h },
    shadowRadius: map.r,
    shadowOpacity: map.op,
    elevation: map.elev,
  };
};

export const cardTilt = {
  transform: [
    { perspective: 1100 },
    { rotateX: "3.5deg" as const },
    { rotateY: "-3deg" as const },
  ],
};

// ─────────────────────────────────────────────
// GLOW BACKDROP — radial light-blob behind the hero icon
// ─────────────────────────────────────────────
export function GlowBackdrop({ from, to }: { from: string; to: string }) {
  return (
    <Svg width={CARD_WIDTH} height={190} viewBox="0 0 300 190">
      <Defs>
        <RadialGradient id="glowA" cx="50%" cy="72%" r="60%">
          <Stop offset="0%" stopColor={from} stopOpacity="0.9" />
          <Stop offset="55%" stopColor={to} stopOpacity="0.35" />
          <Stop offset="100%" stopColor={to} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="glowB" cx="50%" cy="80%" r="38%">
          <Stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="150" cy="130" rx="140" ry="80" fill="url(#glowA)" />
      <Ellipse cx="150" cy="142" rx="64" ry="28" fill="url(#glowB)" />
      <Ellipse cx="150" cy="168" rx="42" ry="8" fill="#000" opacity="0.4" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// LOCK ICON — isometric extruded lock (login hero)
// ─────────────────────────────────────────────
export function LockIcon() {
  return (
    <Svg width="130" height="130" viewBox="0 0 150 150">
      <Defs>
        <SvgGrad id="lkBody" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#ff9dbc" />
          <Stop offset="100%" stopColor={C.pink} />
        </SvgGrad>
        <SvgGrad id="lkBodySide" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#b23360" />
          <Stop offset="100%" stopColor="#7a1f42" />
        </SvgGrad>
        <SvgGrad id="lkTop" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
        </SvgGrad>
        <SvgGrad id="lkShackle" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#c9b3ff" />
          <Stop offset="100%" stopColor={C.violet} />
        </SvgGrad>
      </Defs>

      <Path
        d="M50 62 V46 a25 25 0 0 1 50 0 V62"
        stroke="#4c2794"
        strokeWidth="18"
        fill="none"
        strokeLinecap="round"
        opacity="0.55"
      />
      <Path
        d="M50 60 V46 a25 25 0 0 1 50 0 V60"
        stroke="url(#lkShackle)"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />

      <Path d="M112,64 L112,116 L124,109 L124,57 Z" fill="url(#lkBodySide)" />
      <Path d="M28,64 L112,64 L124,57 L40,57 Z" fill="url(#lkTop)" />
      <Path d="M28,64 L28,116 L112,116 L112,64 Z" fill="url(#lkBody)" />

      <Circle cx="70" cy="84" r="7" fill="#3d1140" />
      <Path d="M67 89 L73 89 L76 102 L64 102 Z" fill="#3d1140" />

      <Path d="M32 66 L60 66 L54 60 L38 60 Z" fill="#fff" opacity="0.35" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// Floating background sphere — parallax cue
// ─────────────────────────────────────────────
export function FloatingSphere({
  size,
  top,
  left,
  right,
  color,
  opacity = 0.5,
}: {
  size: number;
  top: number;
  left?: number;
  right?: number;
  color: string;
  opacity?: number;
}) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", top, left, right, opacity }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={`sph-${size}-${top}`} cx="35%" cy="30%" r="75%">
            <Stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <Stop offset="35%" stopColor={color} stopOpacity="0.85" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="46" fill={`url(#sph-${size}-${top})`} />
      </Svg>
    </View>
  );
}

// ─────────────────────────────────────────────
// BACKGROUND — shared gradient + glows + spheres, used by both screens
// ─────────────────────────────────────────────
export function AuthBackground() {
  return (
    <>
      <LinearGradient
        colors={[C.bgTop, C.bgMid, C.bgBottom]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -120,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: "rgba(123,63,242,0.18)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -140,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: "rgba(51,217,232,0.10)",
        }}
      />
      <FloatingSphere size={60} top={80} left={18} color={C.violet} opacity={0.4} />
      <FloatingSphere size={40} top={SCREEN_HEIGHT * 0.7} right={26} color={C.cyan} opacity={0.35} />
      <FloatingSphere size={26} top={130} right={36} color={C.pink} opacity={0.3} />
    </>
  );
}

// ─────────────────────────────────────────────
// INPUT FIELD — dark glass pill matching the card's material
// ─────────────────────────────────────────────
export function FieldInput({
  icon,
  placeholder,
  value,
  onChangeText,
  secure,
  toggleSecure,
  keyboardType,
  autoCapitalize,
}: {
  icon: JSX.Element;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secure?: boolean;
  toggleSecure?: () => void;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "words" | "sentences" | "characters";
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.input,
        borderWidth: 1,
        borderColor: C.inputBorder,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 54,
        marginBottom: 14,
      }}
    >
      {icon}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textFaint}
        secureTextEntry={secure}
        autoCapitalize={autoCapitalize ?? "none"}
        keyboardType={keyboardType || "default"}
        style={{
          flex: 1,
          marginLeft: 12,
          color: "#fff",
          fontSize: 14,
        }}
      />
      {toggleSecure && (
        <TouchableOpacity onPress={toggleSecure} activeOpacity={0.7}>
          {secure ? (
            <Eye size={18} color={C.textMuted} />
          ) : (
            <EyeOff size={18} color={C.textMuted} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// ERROR BANNER — shared between login & signup
// ─────────────────────────────────────────────
export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,79,129,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,79,129,0.3)",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 14,
        gap: 8,
      }}
    >
      <AlertCircle size={15} color={C.pink} />
      <Text style={{ color: C.pink, fontSize: 12, flex: 1 }}>{message}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10,}$/;

  const validate = () => {
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
      setError("Please enter your password.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  async function handleLogin() {
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      // Talk to the backend directly with API_URL — utils/api.ts only
      // exports the base URL, so the fetch + session storage lives here.
      const res = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Couldn't log in. Please try again.");
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem("userToken", data.token);
      if (data.user?.name) {
        await AsyncStorage.setItem("userName", data.user.name);
      }
      router.replace("/(tabs)/home");
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
                  <LockIcon />
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
                  WELCOME BACK
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
                  Log in to your account
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
                  Pick up right where you left off with your investments.
                </Text>

                <ErrorBanner message={error} />

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

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={{ alignSelf: "flex-end", marginBottom: 22 }}
                  onPress={() => router.push("/(auth)/forgot-password")}
                >
                  <Text style={{ color: C.cyan, fontSize: 12, fontWeight: "600" }}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLogin}
                  activeOpacity={0.88}
                  disabled={loading}
                  style={{ ...depthShadow("md"), opacity: loading ? 0.75 : 1 }}
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
                          Log In
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
                    Don&apos;t have an account?{" "}
                  </Text>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/(auth)/signup")}>
                    <Text style={{ color: C.cyan, fontSize: 12.5, fontWeight: "700" }}>
                      Sign up
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