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
import React, { useEffect, useState } from "react";
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
  icon: React.ReactElement;
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
const RISK_OPTIONS = ["Low", "Moderate", "High"] as const;
const MIN_AGE = 18;
const MAX_AGE = 100;

export default function ProfileSetup() {
  const router = useRouter();
  const [age, setAge] = useState("");
  const [monthlySipBudget, setMonthlySipBudget] = useState("");
  const [riskAppetite, setRiskAppetite] = useState("");
  const [investmentGoal, setInvestmentGoal] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation: All fields must be filled
  const isFormValid = age.trim() !== "" && 
                       monthlySipBudget.trim() !== "" && 
                       riskAppetite.trim() !== "" && 
                       investmentGoal.trim() !== "";

  // Prevent back navigation - user must complete profile setup
  useEffect(() => {
    const handleBackPress = () => {
      Alert.alert(
        "Complete Your Profile",
        "Please complete your profile setup to continue using the app.",
        [{ text: "OK" }]
      );
      return true; // Prevent default back action
    };

    // Note: For web/expo-router, back button is handled automatically
    // For native Android back button, you'd need BackHandler
    // The router.replace() in _layout.tsx already prevents going back

    return () => {};
  }, []);

  function adjustAge(delta: number) {
    const current = parseInt(age, 10);
    const base = isNaN(current) ? MIN_AGE : current;
    const next = Math.min(MAX_AGE, Math.max(MIN_AGE, base + delta));
    setAge(String(next));
  }

  async function handleSubmit() {
    // Validate before submitting
    if (!isFormValid) {
      Alert.alert("Incomplete", "Please fill in all fields to continue.");
      return;
    }

    // Validate age is within acceptable range
    const ageNum = parseInt(age.trim(), 10);
    if (isNaN(ageNum) || ageNum < MIN_AGE || ageNum > MAX_AGE) {
      Alert.alert("Invalid Age", `Please enter an age between ${MIN_AGE} and ${MAX_AGE}.`);
      return;
    }

    // Validate SIP budget is a positive number
    const budgetNum = parseFloat(monthlySipBudget.trim());
    if (isNaN(budgetNum) || budgetNum <= 0) {
      Alert.alert("Invalid Budget", "Please enter a positive monthly SIP budget.");
      return;
    }

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
          age: ageNum,
          monthlySipBudget: budgetNum,
          riskAppetite: riskAppetite.trim(),
          investmentGoal: investmentGoal.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save profile");
      }

      // Clear the pending profile setup flag
      await AsyncStorage.removeItem("pendingProfileSetup");

      // success: send user to their profile so they can fill in the rest
      // of their personal information (name, phone, DOB, gender, location).
      router.replace("/(tabs)/profile?openEditor=1" as any);
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

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: C.input,
                    borderWidth: 1,
                    borderColor: C.inputBorder,
                    borderRadius: 16,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    marginBottom: 14,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                      paddingLeft: 8,
                    }}
                  >
                    <Cake size={18} color={C.textMuted} />
                    <Text style={{ color: C.textFaint, fontSize: 13, marginLeft: 12 }}>Age</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => adjustAge(-1)}
                    activeOpacity={0.75}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginTop: -2 }}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    value={age}
                    onChangeText={(v) => {
                      const numValue = v.replace(/[^0-9]/g, "");
                      if (numValue === "") {
                        setAge("");
                      } else {
                        const num = parseInt(numValue, 10);
                        if (num > MAX_AGE) {
                          setAge(String(MAX_AGE));
                        } else {
                          setAge(numValue);
                        }
                      }
                    }}
                    keyboardType="number-pad"
                    placeholder="—"
                    placeholderTextColor={C.textFaint}
                    maxLength={3}
                    style={{
                      width: 44,
                      textAlign: "center",
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: "700",
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => adjustAge(1)}
                    activeOpacity={0.75}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>+</Text>
                  </TouchableOpacity>
                </View>
                <FieldInput
                  icon={<Wallet size={18} color={C.textMuted} />}
                  placeholder="Monthly SIP budget (₹)"
                  value={monthlySipBudget}
                  onChangeText={setMonthlySipBudget}
                  keyboardType="default"
                />
                <View style={{ marginBottom: 14 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, paddingLeft: 2 }}>
                    <Shield size={16} color={C.textMuted} />
                    <Text style={{ color: C.textFaint, fontSize: 13, marginLeft: 12 }}>Risk appetite</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    {RISK_OPTIONS.map((level) => {
                      const selected = riskAppetite === level;
                      return (
                        <TouchableOpacity
                          key={level}
                          onPress={() => setRiskAppetite(level)}
                          activeOpacity={0.85}
                          style={{ flex: 1 }}
                        >
                          {selected ? (
                            <LinearGradient
                              colors={[C.pink, C.violet]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={{
                                borderRadius: 14,
                                paddingVertical: 12,
                                alignItems: "center",
                              }}
                            >
                              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>{level}</Text>
                            </LinearGradient>
                          ) : (
                            <View
                              style={{
                                borderRadius: 14,
                                paddingVertical: 12,
                                alignItems: "center",
                                backgroundColor: C.input,
                                borderWidth: 1,
                                borderColor: C.inputBorder,
                              }}
                            >
                              <Text style={{ color: C.textMuted, fontSize: 13, fontWeight: "600" }}>
                                {level}
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                <TextAreaField
                  icon={<TargetIcon size={18} color={C.textMuted} />}
                  placeholder="Investment goal — e.g. Retirement planning, 10 years"
                  value={investmentGoal}
                  onChangeText={setInvestmentGoal}
                />

                <TouchableOpacity
                  onPress={handleSubmit}
                  activeOpacity={0.88}
                  disabled={loading || !isFormValid}
                  style={{ ...depthShadow("md"), opacity: (loading || !isFormValid) ? 0.5 : 1, marginTop: 8 }}
                >
                  <LinearGradient
                    colors={isFormValid ? [C.pink, C.violet] : ["#666", "#444"]}
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


