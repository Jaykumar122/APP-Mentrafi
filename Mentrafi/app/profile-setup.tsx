import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Cake, Shield, Target as TargetIcon, Wallet } from "lucide-react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGrad,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../utils/api";
import {
  AuthBackground,
  C,
  cardTilt,
  depthShadow,
  FieldInput,
  GlowBackdrop,
} from "./(auth)/login";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 44;

// ─────────────────────────────────────────────
// TARGET ICON — isometric extruded dartboard/target (investment-goal
// hero), built the same way as LockIcon / BadgeIcon: layered rings +
// extruded stand + sheen
// ─────────────────────────────────────────────
function TargetHeroIcon() {
  return (
    <Svg width="130" height="130" viewBox="0 0 150 150">
      <Defs>
        <SvgGrad id="tgOuter" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#ff9dbc" />
          <Stop offset="100%" stopColor={C.pink} />
        </SvgGrad>
        <SvgGrad id="tgMid" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
        </SvgGrad>
        <SvgGrad id="tgInner" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#c9b3ff" />
          <Stop offset="100%" stopColor={C.violet} />
        </SvgGrad>
        <SvgGrad id="tgStandSide" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#b23360" />
          <Stop offset="100%" stopColor="#7a1f42" />
        </SvgGrad>
      </Defs>

      {/* stand — small extruded base so the target reads as an object */}
      <Path d="M65 118 L85 118 L90 128 L60 128 Z" fill="url(#tgStandSide)" />

      {/* rings */}
      <Circle cx="75" cy="70" r="42" fill="url(#tgOuter)" />
      <Circle cx="75" cy="70" r="30" fill="url(#tgMid)" />
      <Circle cx="75" cy="70" r="18" fill="url(#tgInner)" />
      <Circle cx="75" cy="70" r="7" fill="#fff" />

      {/* arrow */}
      <Path
        d="M104 40 L78 66"
        stroke="#3d1140"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path d="M104 40 L92 40 L104 52 Z" fill="#3d1140" />

      {/* highlight sheen */}
      <Path d="M45 55 a42 42 0 0 1 20 -20 L58 44 a30 30 0 0 0 -13 13 Z" fill="#fff" opacity="0.3" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// TEXTAREA — multiline variant of the glass field used across the app
// ─────────────────────────────────────────────
function TextAreaField({
  icon,
  placeholder,
  value,
  onChangeText,
}: {
  icon: JSX.Element;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: C.input,
        borderWidth: 1,
        borderColor: C.inputBorder,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 14,
      }}
    >
      <View style={{ marginTop: 2 }}>{icon}</View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textFaint}
        multiline
        style={{
          flex: 1,
          marginLeft: 12,
          color: "#fff",
          fontSize: 14,
          minHeight: 60,
          textAlignVertical: "top",
        }}
      />
    </View>
  );
}

// ─────────────────────────────────────────────
// PROFILE SETUP SCREEN
// ─────────────────────────────────────────────
export default function ProfileSetup() {
  const router = useRouter();
  const [age, setAge] = useState("");
  const [monthlySipBudget, setMonthlySipBudget] = useState("");
  const [riskAppetite, setRiskAppetite] = useState("");
  const [investmentGoal, setInvestmentGoal] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        router.replace("/(auth)/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          age: age.trim() ? parseInt(age.trim(), 10) : null,
          monthlySipBudget: monthlySipBudget.trim() ? parseFloat(monthlySipBudget.trim()) : null,
          riskAppetite: riskAppetite.trim() || null,
          investmentGoal: investmentGoal.trim() || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save profile");
      }

      // success: send user to home
      router.replace("/(tabs)/home");
    } catch (err: any) {
      console.error("Profile setup save error:", err);
      Alert.alert("Save failed", err?.message || "Could not save profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bgBottom }}>
      <AuthBackground />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ width: CARD_WIDTH, ...depthShadow("lg"), ...cardTilt }}>
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
                  <TargetHeroIcon />
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
                  ALMOST THERE
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
                  Set up your profile
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
                  A few quick questions to personalize your recommendations.
                </Text>

                <FieldInput
                  icon={<Cake size={18} color={C.textMuted} />}
                  placeholder="Age"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                />
                <FieldInput
                  icon={<Wallet size={18} color={C.textMuted} />}
                  placeholder="Monthly SIP budget (₹)"
                  value={monthlySipBudget}
                  onChangeText={setMonthlySipBudget}
                  keyboardType="decimal-pad"
                />
                <FieldInput
                  icon={<Shield size={18} color={C.textMuted} />}
                  placeholder="Risk appetite (Low / Medium / High)"
                  value={riskAppetite}
                  onChangeText={setRiskAppetite}
                  autoCapitalize="words"
                />
                <TextAreaField
                  icon={<TargetIcon size={18} color={C.textMuted} />}
                  placeholder="Investment goal — e.g. Retirement planning, 10 years"
                  value={investmentGoal}
                  onChangeText={setInvestmentGoal}
                />

                <TouchableOpacity
                  onPress={handleSubmit}
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
                          Save & Continue
                        </Text>
                        <ArrowRight size={17} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
